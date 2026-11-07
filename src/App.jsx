import React, { useCallback, useEffect, useMemo, useState } from "react";

const API_BASE = (import.meta.env.VITE_BOT_API_URL || "").replace(/\/$/, "");
const NAV = [
  ["overview", "Overview", "▦"], ["applications", "Application List", "▤"],
  ["mapping", "DOB / ID Mapping", "⌕"], ["v153", "V153 Control", "⚙"],
  ["parser", "React Parser", "⌘"], ["reports", "Reports & Delivery", "▥"]
];
const request = async (path, options = {}) => {
  if (!API_BASE) throw new Error("VITE_BOT_API_URL সেট করা হয়নি");
  const response = await fetch(API_BASE + path, { ...options, headers: { "Content-Type": "application/json", ...(options.headers || {}) }, cache: "no-store" });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
  return data;
};
function Pill({ok, children}) { return <span className={`pill ${ok ? "good" : "bad"}`}><i />{children}</span>; }

export default function App() {
  const [page, setPage] = useState("overview");
  const [health, setHealth] = useState(null);
  const [rows, setRows] = useState([]);
  const [otp, setOtp] = useState(null);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [lastSync, setLastSync] = useState(null);

  const refresh = useCallback(async () => {
    if (!API_BASE) { setError("Vercel Environment Variable VITE_BOT_API_URL সেট করতে হবে।"); return; }
    setLoading(true); setError("");
    const results = await Promise.allSettled([
      request("/health"), request("/api/application-mappings"), request("/api/otp/current"),
      request("/api/dashboard/status")
    ]);
    if (results[0].status === "fulfilled") setHealth(results[0].value);
    else { setHealth(null); setError(results[0].reason.message); }
    if (results[1].status === "fulfilled") setRows(results[1].value.rows || []);
    if (results[2].status === "fulfilled") setOtp(results[2].value);
    if (results[3].status === "fulfilled") setStatus(results[3].value);
    setLastSync(new Date());
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); const id = setInterval(refresh, 15000); return () => clearInterval(id); }, [refresh]);

  const filtered = useMemo(() => rows.filter(r => JSON.stringify(r).toLowerCase().includes(query.toLowerCase())), [rows, query]);
  const controlReady = status?.controlReady === true;
  const doControl = async (path, label) => {
    if (!controlReady) return;
    if (!window.confirm(`${label} করতে চান?`)) return;
    try { await request(path, { method: "POST", body: "{}" }); await refresh(); }
    catch (e) { setError(e.message); }
  };

  return <div className="shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">B</div><div><b>BDRIS Cloud</b><small>CONTROL CENTER</small></div></div>
      <div className="side-label">WORKSPACE</div>
      {NAV.map(([id,label,icon]) => <button key={id} className={page===id?"nav active":"nav"} onClick={()=>setPage(id)}><span>{icon}</span>{label}</button>)}
      <div className="side-bottom"><span className="live-dot"/><div><b>Remote Backend</b><small>{API_BASE ? "Tunnel configured" : "Not configured"}</small></div></div>
    </aside>
    <main className="main">
      <header className="topbar"><div><div className="eyebrow">BDRIS AUTOMATION / CLOUD</div><h1>{NAV.find(n=>n[0]===page)?.[1] || "Overview"}</h1></div><div className="top-actions"><Pill ok={!!health?.ok}>{health?.ok ? "Backend Online" : "Backend Offline"}</Pill><button className="refresh" onClick={refresh}>{loading?"Syncing…":"↻ Refresh"}</button></div></header>
      {error && <div className="alert">Connection / API notice: {error}</div>}
      {page==="overview" && <>
        <section className="welcome"><div><div className="eyebrow light">REMOTE OPERATIONS</div><h2>তোমার BDRIS Bot, এক জায়গা থেকে</h2><p>Bot-এর কম্পিউটার আলাদা থাকবে। এই Dashboard Tunnel দিয়ে Backend-এর সঙ্গে যোগাযোগ করবে।</p></div><div className="welcome-icon">⌘</div></section>
        <section className="stats">
          <article className="stat"><span>Backend</span><strong>{health?.ok?"Online":"Offline"}</strong><small>{health?.name || "Waiting for health API"}</small></article>
          <article className="stat"><span>Applications</span><strong>{rows.length}</strong><small>Backend mapping records</small></article>
          <article className="stat"><span>WhatsApp</span><strong>{status?.whatsappConnected===true?"Connected":status?.whatsappConnected===false?"Disconnected":"Unknown"}</strong><small>Requires dashboard status API</small></article>
          <article className="stat"><span>OTP Queue</span><strong>{otp?.waitingCount ?? "—"}</strong><small>Waiting OTP sessions</small></article>
        </section>
        <section className="panel"><div className="panel-head"><div><h3>Bot Control</h3><p>Remote start / stop requires secured control API.</p></div><Pill ok={status?.botOnline===true}>{status?.botOnline===true?"Bot Online":status?.botOnline===false?"Bot Offline":"Status Unknown"}</Pill></div><div className="control-row"><button disabled={!controlReady} className="primary" onClick={()=>doControl("/api/bot/start","Bot Start")}>▶ Start Bot</button><button disabled={!controlReady} className="danger" onClick={()=>doControl("/api/bot/stop","Bot Stop")}>■ Stop Bot</button><span className="hint">{controlReady?"Control API ready":"নিরাপত্তাসহ Bot Control API এখনো Backend-এ যোগ করা হয়নি"}</span></div></section>
        <section className="panel"><div className="panel-head"><div><h3>Recent Applications</h3><p>সর্বশেষ Mapping records</p></div><button className="text-btn" onClick={()=>setPage("applications")}>সব দেখুন →</button></div><Records rows={rows.slice(0,6)}/></section>
      </>}
      {page==="applications" && <section className="panel"><div className="panel-head"><div><h3>Application List</h3><p>Application ID, BRN, DOB, Customer ও State</p></div><span className="count">{filtered.length} records</span></div><input className="search" placeholder="ID / DOB / Customer খুঁজুন..." value={query} onChange={e=>setQuery(e.target.value)}/><Records rows={filtered}/></section>}
      {page==="mapping" && <section className="panel"><div className="panel-head"><div><h3>DOB / ID Mapping</h3><p>বর্তমান Backend-এর /api/application-mappings থেকে</p></div></div><Records rows={filtered}/></section>}
      {page==="v153" && <Unavailable title="V153 Control" detail="এই ZIP-এ Dashboard-এর জন্য আলাদা V153 status/control API পাওয়া যায়নি। Backend API যোগ হলে এখানে যুক্ত হবে।"/>}
      {page==="parser" && <Unavailable title="React Parser" detail="React Parser-এর সোর্স ও Local UI ZIP-এ আছে। নিরাপদ Remote Parser API এবং authentication তৈরি না হওয়া পর্যন্ত এখানে Run action চালু করা হচ্ছে না।"/>}
      {page==="reports" && <Unavailable title="Reports & Delivery Status" detail="এই ZIP-এ Dashboard-এর জন্য Reports / Delivery history API পাওয়া যায়নি। প্রয়োজনীয় data endpoint যোগ হলে রিপোর্ট দেখানো যাবে।"/>}
      <footer>Last sync: {lastSync ? lastSync.toLocaleTimeString() : "Not synced"} · Refreshes every 15 seconds</footer>
    </main>
  </div>;
}
function Records({rows}) {
  if (!rows.length) return <div className="empty">কোনো রেকর্ড পাওয়া যায়নি অথবা Backend API সংযুক্ত হয়নি।</div>;
  return <div className="table-wrap"><table><thead><tr><th>Application / Session</th><th>BRN / ID</th><th>DOB</th><th>Customer</th><th>Status</th></tr></thead><tbody>{rows.map((r,i)=><tr key={r.id||i}><td>{r.id||"—"}</td><td>{r.brn||"—"}</td><td>{r.dob||"—"}</td><td>{r.customer||"—"}</td><td><span className="state">{r.state||"—"}</span></td></tr>)}</tbody></table></div>;
}
function Unavailable({title,detail}) { return <section className="panel unavailable"><div className="lock">⌁</div><h3>{title}</h3><p>{detail}</p><span className="state">Backend integration pending</span></section>; }
