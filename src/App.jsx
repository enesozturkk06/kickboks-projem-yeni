import { useState, useEffect, useCallback } from "react";

// ============================================================
// INITIAL DATA
// ============================================================
const TRAINER_PASSWORD = "Enes2024";

const INITIAL_STUDENTS = [
  {
    id: 1, code: "ENES001", name: "Ahmet Yılmaz", phone: "0532 111 2233",
    package: 10, remainingLessons: 7, completedLessons: 3,
    payment: { total: 2500, paid: 2500, due: null, note: "Tam ödeme" },
    notes: [], lessons: [], status: "active"
  },
  {
    id: 2, code: "ENES002", name: "Mehmet Kaya", phone: "0541 222 3344",
    package: 8, remainingLessons: 3, completedLessons: 5,
    payment: { total: 2000, paid: 1000, due: "2024-02-15", note: "Kalanı şubatta ödenecek" },
    notes: [], lessons: [], status: "active"
  },
  {
    id: 3, code: "ENES003", name: "Burak Demir", phone: "0555 333 4455",
    package: 12, remainingLessons: 12, completedLessons: 0,
    payment: { total: 3000, paid: 3000, due: null, note: "" },
    notes: [], lessons: [], status: "active"
  },
];

const INITIAL_SLOTS = [
  { id: 1, date: getTodayStr(), time: "09:00", studentId: 1, status: "booked" },
  { id: 2, date: getTodayStr(), time: "10:00", studentId: null, status: "available" },
  { id: 3, date: getTodayStr(), time: "11:00", studentId: 2, status: "booked" },
  { id: 4, date: getTodayStr(), time: "14:00", studentId: null, status: "available" },
  { id: 5, date: getTodayStr(), time: "15:00", studentId: null, status: "available" },
  { id: 6, date: getTomorrowStr(), time: "09:00", studentId: null, status: "available" },
  { id: 7, date: getTomorrowStr(), time: "10:00", studentId: null, status: "available" },
  { id: 8, date: getTomorrowStr(), time: "11:00", studentId: 3, status: "booked" },
];

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}
function getTomorrowStr() {
  const d = new Date(); d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}
function formatDate(str) {
  if (!str) return "";
  const [y, m, d] = str.split("-");
  return `${d}.${m}.${y}`;
}
function formatDateTime(date, time) {
  return `${formatDate(date)} - ${time}`;
}
function canCancel(date, time) {
  const slotDt = new Date(`${date}T${time}:00`);
  const now = new Date();
  return (slotDt - now) > 18 * 3600 * 1000;
}

// ============================================================
// ICONS (SVG inline)
// ============================================================
const Icon = ({ name, size = 18 }) => {
  const icons = {
    glove: <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8 2 5 5 5 9v8c0 2.2 1.8 4 4 4h6c2.2 0 4-1.8 4-4V9c0-4-3-7-7-7zm0 2c2.8 0 5 2.2 5 5v1h-2V9c0-1.7-1.3-3-3-3s-3 1.3-3 3v1H7V9c0-2.8 2.2-5 5-5z"/></svg>,
    user: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
    calendar: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
    clock: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>,
    money: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/></svg>,
    chart: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 20h18M5 20V14l4-4 4 4 4-8v14"/></svg>,
    bell: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>,
    plus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>,
    check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>,
    x: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>,
    edit: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    trash: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
    whatsapp: <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>,
    star: <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
    lock: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    home: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    logout: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    note: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    trophy: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>,
    search: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
    menu: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
    close: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    warning: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    qr: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/><rect x="18" y="14" width="3" height="3"/><rect x="14" y="18" width="3" height="3"/><rect x="18" y="18" width="3" height="3"/><rect x="5" y="5" width="3" height="3" fill="currentColor"/><rect x="16" y="5" width="3" height="3" fill="currentColor"/><rect x="5" y="16" width="3" height="3" fill="currentColor"/></svg>,
    download: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  };
  return icons[name] || null;
};

// ============================================================
// STYLES
// ============================================================
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;500;600;700&family=Barlow:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --black: #0a0a0a;
    --dark: #111111;
    --card: #161616;
    --border: #2a2a2a;
    --red: #e63329;
    --red-dark: #c42a21;
    --gold: #c9a227;
    --gold-light: #f0c84a;
    --white: #f5f5f5;
    --gray: #888;
    --gray-light: #aaa;
    --green: #22c55e;
    --yellow: #f59e0b;
    --blue: #3b82f6;
  }

  html, body { background: var(--black); color: var(--white); font-family: 'Barlow', sans-serif; font-size: 15px; min-height: 100vh; }

  .app { min-height: 100vh; background: var(--black); }

  /* LOGIN */
  .login-screen {
    min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center;
    background: radial-gradient(ellipse at center top, #1a0505 0%, #0a0a0a 60%);
    padding: 20px;
  }
  .login-logo { text-align: center; margin-bottom: 40px; }
  .login-logo .brand { font-family: 'Bebas Neue', sans-serif; font-size: 42px; letter-spacing: 4px; color: var(--white); line-height: 1; }
  .login-logo .brand span { color: var(--red); }
  .login-logo .subtitle { font-family: 'Rajdhani', sans-serif; font-size: 13px; letter-spacing: 6px; color: var(--gold); text-transform: uppercase; margin-top: 6px; }
  .login-logo .gloves { font-size: 48px; margin-bottom: 16px; display: block; }
  .login-card {
    background: var(--card); border: 1px solid var(--border); border-radius: 12px;
    padding: 36px 32px; width: 100%; max-width: 380px;
    box-shadow: 0 0 60px rgba(230,51,41,0.08);
  }
  .login-card h2 { font-family: 'Rajdhani', sans-serif; font-size: 22px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--gold); margin-bottom: 24px; text-align: center; }
  .form-group { margin-bottom: 16px; }
  .form-group label { display: block; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; color: var(--gray); margin-bottom: 8px; font-weight: 600; }
  .form-group input, .form-group select, .form-group textarea {
    width: 100%; background: #1e1e1e; border: 1px solid var(--border); color: var(--white);
    border-radius: 8px; padding: 12px 14px; font-size: 15px; font-family: 'Barlow', sans-serif;
    outline: none; transition: border-color 0.2s;
  }
  .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: var(--red); }
  .form-group select option { background: #1e1e1e; }
  .form-group textarea { resize: vertical; min-height: 80px; }

  .btn {
    display: inline-flex; align-items: center; gap: 8px; padding: 12px 20px;
    border-radius: 8px; font-family: 'Rajdhani', sans-serif; font-size: 15px; font-weight: 700;
    letter-spacing: 1px; text-transform: uppercase; cursor: pointer; border: none; transition: all 0.2s;
  }
  .btn-primary { background: var(--red); color: white; }
  .btn-primary:hover { background: var(--red-dark); transform: translateY(-1px); }
  .btn-gold { background: var(--gold); color: var(--black); }
  .btn-gold:hover { background: var(--gold-light); }
  .btn-outline { background: transparent; color: var(--white); border: 1px solid var(--border); }
  .btn-outline:hover { border-color: var(--red); color: var(--red); }
  .btn-ghost { background: transparent; color: var(--gray); border: none; padding: 8px 12px; }
  .btn-ghost:hover { color: var(--white); }
  .btn-danger { background: #3a1010; color: var(--red); border: 1px solid #5a1a1a; }
  .btn-danger:hover { background: var(--red); color: white; }
  .btn-green { background: #0f3320; color: var(--green); border: 1px solid #1a5530; }
  .btn-green:hover { background: var(--green); color: white; }
  .btn-sm { padding: 7px 12px; font-size: 13px; }
  .btn-full { width: 100%; justify-content: center; }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; }

  /* LAYOUT */
  .layout { display: flex; min-height: 100vh; }
  .sidebar {
    width: 230px; min-width: 230px; background: var(--dark); border-right: 1px solid var(--border);
    display: flex; flex-direction: column; position: fixed; top: 0; left: 0; height: 100vh; z-index: 100;
    transition: transform 0.3s;
  }
  .sidebar-logo { padding: 20px 16px; border-bottom: 1px solid var(--border); }
  .sidebar-logo .brand { font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 3px; color: var(--white); line-height: 1.2; }
  .sidebar-logo .brand span { color: var(--red); }
  .sidebar-logo .role-badge { font-size: 10px; letter-spacing: 3px; color: var(--gold); text-transform: uppercase; font-family: 'Rajdhani', sans-serif; margin-top: 2px; }
  .sidebar-nav { flex: 1; overflow-y: auto; padding: 12px 0; }
  .nav-section { margin-bottom: 4px; }
  .nav-section-title { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--gray); padding: 12px 16px 6px; font-weight: 600; }
  .nav-item {
    display: flex; align-items: center; gap: 10px; padding: 10px 16px; cursor: pointer;
    color: var(--gray-light); font-size: 14px; font-family: 'Rajdhani', sans-serif;
    font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;
    border-left: 3px solid transparent; transition: all 0.15s;
  }
  .nav-item:hover { color: var(--white); background: rgba(255,255,255,0.04); }
  .nav-item.active { color: var(--red); border-left-color: var(--red); background: rgba(230,51,41,0.08); }
  .sidebar-footer { padding: 12px; border-top: 1px solid var(--border); }

  .main-content { margin-left: 230px; min-height: 100vh; padding: 24px; flex: 1; }

  .topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
  .page-title { font-family: 'Bebas Neue', sans-serif; font-size: 32px; letter-spacing: 3px; color: var(--white); }
  .page-title span { color: var(--red); }

  /* CARDS */
  .card {
    background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 20px;
    transition: border-color 0.2s;
  }
  .card:hover { border-color: #3a3a3a; }
  .card-title { font-family: 'Rajdhani', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--gray); margin-bottom: 12px; }

  .stat-card { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 20px; }
  .stat-card .stat-value { font-family: 'Bebas Neue', sans-serif; font-size: 38px; letter-spacing: 2px; line-height: 1; }
  .stat-card .stat-label { font-size: 12px; color: var(--gray); text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; font-weight: 600; }
  .stat-red .stat-value { color: var(--red); }
  .stat-gold .stat-value { color: var(--gold); }
  .stat-green .stat-value { color: var(--green); }
  .stat-white .stat-value { color: var(--white); }

  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }

  .badge {
    display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 20px;
    font-size: 12px; font-weight: 700; font-family: 'Rajdhani', sans-serif; text-transform: uppercase; letter-spacing: 0.5px;
  }
  .badge-red { background: rgba(230,51,41,0.15); color: var(--red); border: 1px solid rgba(230,51,41,0.3); }
  .badge-gold { background: rgba(201,162,39,0.15); color: var(--gold); border: 1px solid rgba(201,162,39,0.3); }
  .badge-green { background: rgba(34,197,94,0.15); color: var(--green); border: 1px solid rgba(34,197,94,0.3); }
  .badge-gray { background: rgba(136,136,136,0.15); color: var(--gray-light); border: 1px solid rgba(136,136,136,0.3); }
  .badge-blue { background: rgba(59,130,246,0.15); color: var(--blue); border: 1px solid rgba(59,130,246,0.3); }

  .divider { height: 1px; background: var(--border); margin: 16px 0; }

  /* TABLE */
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; }
  th { font-family: 'Rajdhani', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--gray); padding: 10px 14px; text-align: left; border-bottom: 1px solid var(--border); }
  td { padding: 12px 14px; border-bottom: 1px solid #1e1e1e; font-size: 14px; vertical-align: middle; }
  tr:hover td { background: rgba(255,255,255,0.02); }

  /* MODAL */
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 999;
    display: flex; align-items: center; justify-content: center; padding: 16px;
  }
  .modal {
    background: var(--card); border: 1px solid var(--border); border-radius: 14px;
    padding: 28px; width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto;
    box-shadow: 0 0 80px rgba(0,0,0,0.8);
  }
  .modal-title { font-family: 'Bebas Neue', sans-serif; font-size: 26px; letter-spacing: 2px; color: var(--white); margin-bottom: 20px; }
  .modal-title span { color: var(--red); }
  .modal-footer { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }

  /* NOTIFICATION */
  .notif-list { position: fixed; top: 16px; right: 16px; z-index: 9999; display: flex; flex-direction: column; gap: 8px; }
  .notif {
    background: var(--card); border: 1px solid var(--border); border-radius: 10px;
    padding: 14px 16px; min-width: 280px; max-width: 360px;
    animation: slideIn 0.3s ease; display: flex; align-items: flex-start; gap: 10px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
  }
  .notif-red { border-left: 3px solid var(--red); }
  .notif-green { border-left: 3px solid var(--green); }
  .notif-gold { border-left: 3px solid var(--gold); }
  .notif-title { font-family: 'Rajdhani', sans-serif; font-size: 14px; font-weight: 700; letter-spacing: 1px; }
  .notif-body { font-size: 13px; color: var(--gray-light); margin-top: 2px; }
  @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

  /* PROGRESS BAR */
  .progress-bar { height: 6px; background: #2a2a2a; border-radius: 3px; overflow: hidden; }
  .progress-fill { height: 100%; border-radius: 3px; transition: width 0.5s; }
  .fill-red { background: var(--red); }
  .fill-gold { background: var(--gold); }
  .fill-green { background: var(--green); }

  /* TIME SLOT */
  .slot-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); gap: 8px; }
  .slot-item {
    padding: 10px 8px; border-radius: 8px; text-align: center; cursor: pointer;
    border: 1px solid var(--border); font-family: 'Rajdhani', sans-serif;
    font-size: 15px; font-weight: 700; transition: all 0.15s;
  }
  .slot-available { color: var(--green); border-color: rgba(34,197,94,0.3); background: rgba(34,197,94,0.06); }
  .slot-available:hover { background: rgba(34,197,94,0.15); border-color: var(--green); }
  .slot-booked { color: var(--gray); border-color: #1e1e1e; background: #141414; cursor: not-allowed; }
  .slot-mine { color: var(--red); border-color: rgba(230,51,41,0.4); background: rgba(230,51,41,0.08); cursor: default; }
  .slot-closed { color: #444; border-color: #1e1e1e; background: #111; cursor: not-allowed; }
  .slot-selected { background: var(--red); color: white; border-color: var(--red); }

  /* CALENDAR */
  .cal-nav { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
  .cal-nav button { background: var(--card); border: 1px solid var(--border); color: var(--white); border-radius: 8px; padding: 8px 14px; cursor: pointer; font-size: 18px; }
  .cal-nav button:hover { border-color: var(--red); color: var(--red); }
  .cal-title { font-family: 'Bebas Neue', sans-serif; font-size: 24px; letter-spacing: 2px; }
  .cal-days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
  .cal-header { text-align: center; font-size: 11px; font-weight: 700; letter-spacing: 1px; color: var(--gray); padding: 8px 0; font-family: 'Rajdhani', sans-serif; text-transform: uppercase; }
  .cal-day {
    aspect-ratio: 1; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center;
    cursor: pointer; border: 1px solid transparent; font-size: 14px; transition: all 0.15s; position: relative;
  }
  .cal-day:hover { background: rgba(255,255,255,0.05); }
  .cal-day.today { border-color: var(--red); color: var(--red); font-weight: 700; }
  .cal-day.selected { background: var(--red); color: white; border-color: var(--red); }
  .cal-day.has-events::after { content: ''; position: absolute; bottom: 4px; width: 4px; height: 4px; border-radius: 50%; background: var(--gold); }
  .cal-day.other-month { opacity: 0.3; }
  .cal-day.closed { opacity: 0.3; text-decoration: line-through; cursor: not-allowed; }

  /* SCORE BARS */
  .skill-row { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
  .skill-label { width: 110px; font-size: 13px; color: var(--gray-light); flex-shrink: 0; font-family: 'Rajdhani', sans-serif; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
  .skill-bar-wrap { flex: 1; }
  .skill-score { width: 32px; text-align: right; font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 15px; color: var(--gold); }

  /* TABS */
  .tabs { display: flex; gap: 4px; background: var(--dark); border-radius: 10px; padding: 4px; margin-bottom: 20px; }
  .tab-btn {
    flex: 1; padding: 9px; border-radius: 7px; font-family: 'Rajdhani', sans-serif;
    font-size: 13px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
    cursor: pointer; border: none; background: transparent; color: var(--gray); transition: all 0.15s;
    text-align: center;
  }
  .tab-btn.active { background: var(--red); color: white; }
  .tab-btn:hover:not(.active) { color: var(--white); }

  /* MOBILE */
  .mobile-header {
    display: none; background: var(--dark); border-bottom: 1px solid var(--border);
    padding: 14px 16px; position: sticky; top: 0; z-index: 99;
    align-items: center; justify-content: space-between;
  }
  .mobile-header .brand { font-family: 'Bebas Neue', sans-serif; font-size: 20px; letter-spacing: 3px; }
  .mobile-header .brand span { color: var(--red); }

  .mobile-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 99; }

  /* WHATSAPP MODAL */
  .wa-preview {
    background: #128c7e; border-radius: 12px 12px 12px 0; padding: 14px 16px;
    color: white; font-size: 14px; line-height: 1.7; margin: 16px 0;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  }

  /* ALERT */
  .alert { padding: 12px 16px; border-radius: 8px; font-size: 14px; margin-bottom: 16px; display: flex; align-items: center; gap: 10px; }
  .alert-warning { background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.3); color: var(--yellow); }
  .alert-danger { background: rgba(230,51,41,0.1); border: 1px solid rgba(230,51,41,0.3); color: var(--red); }
  .alert-success { background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.3); color: var(--green); }

  /* SEARCH */
  .search-input-wrap { position: relative; }
  .search-input-wrap input { padding-left: 40px; }
  .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--gray); pointer-events: none; }

  .empty-state { text-align: center; padding: 48px 20px; color: var(--gray); }
  .empty-state .icon { font-size: 48px; margin-bottom: 12px; opacity: 0.4; }
  .empty-state p { font-size: 15px; }

  .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .section-title { font-family: 'Rajdhani', sans-serif; font-size: 18px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }

  .chip { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 12px; background: #1e1e1e; color: var(--gray-light); margin: 2px; }

  /* rating stars */
  .stars { display: flex; gap: 3px; }
  .star-filled { color: var(--gold); }
  .star-empty { color: #333; }

  @media (max-width: 768px) {
    .sidebar { transform: translateX(-100%); }
    .sidebar.open { transform: translateX(0); }
    .mobile-overlay.open { display: block; }
    .mobile-header { display: flex; }
    .main-content { margin-left: 0; padding: 16px; margin-top: 0; }
    .grid-4 { grid-template-columns: repeat(2, 1fr); }
    .grid-3 { grid-template-columns: repeat(2, 1fr); }
    .grid-2 { grid-template-columns: 1fr; }
    .page-title { font-size: 24px; }
    .modal { padding: 20px; }
    .table-wrap { font-size: 13px; }
  }
  @media (max-width: 480px) {
    .grid-4 { grid-template-columns: repeat(2, 1fr); }
    .grid-3 { grid-template-columns: 1fr 1fr; }
    .tabs { flex-wrap: wrap; }
  }
`;

// ============================================================
// NOTIFICATIONS
// ============================================================
function NotifProvider({ children }) {
  const [notifs, setNotifs] = useState([]);
  const add = useCallback((title, body, type = "red") => {
    const id = Date.now();
    setNotifs(n => [...n, { id, title, body, type }]);
    setTimeout(() => setNotifs(n => n.filter(x => x.id !== id)), 4000);
  }, []);
  return (
    <>
      {children}
      <div className="notif-list">
        {notifs.map(n => (
          <div key={n.id} className={`notif notif-${n.type}`}>
            <div style={{ flex: 1 }}>
              <div className="notif-title">{n.title}</div>
              {n.body && <div className="notif-body">{n.body}</div>}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  // 1. Öğrencileri ve Slotları Hafızadan Okuma
  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem('kickboks_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [slots, setSlots] = useState(() => {
    const saved = localStorage.getItem('kickboks_slots');
    return saved ? JSON.parse(saved) : INITIAL_SLOTS;
  });

  // 2. Veri Değiştiğinde Otomatik Kaydetme
  useEffect(() => {
    localStorage.setItem('kickboks_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('kickboks_slots', JSON.stringify(slots));
  }, [slots]);
  const [view, setView] = useState("login"); // login | trainer | student
  const [trainerLoggedIn, setTrainerLoggedIn] = useState(false);
  const [studentCode, setStudentCode] = useState("");
  const [currentStudent, setCurrentStudent] = useState(null);
  const [notifs, setNotifs] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const addNotif = useCallback((title, body, type = "red") => {
    const id = Date.now();
    setNotifs(n => [...n, { id, title, body, type }]);
    setTimeout(() => setNotifs(n => n.filter(x => x.id !== id)), 4500);
  }, []);

  const studentLogin = (code) => {
    const s = students.find(x => x.code === code.trim().toUpperCase());
    if (s) {
      setCurrentStudent(s);
      setView("student");
      addNotif("Hoş Geldiniz! 🥊", s.name, "gold");
      return true;
    }
    return false;
  };

  return (
    <>
      <style>{css}</style>
      <div className="notif-list">
        {notifs.map(n => (
          <div key={n.id} className={`notif notif-${n.type}`}>
            <div style={{ flex: 1 }}>
              <div className="notif-title">{n.title}</div>
              {n.body && <div className="notif-body">{n.body}</div>}
            </div>
          </div>
        ))}
      </div>
      <div className="app">
        {view === "login" && (
          <LoginScreen
            onTrainer={() => setView("trainer-login")}
            onStudent={studentLogin}
          />
        )}
        {view === "trainer-login" && (
          <TrainerLoginScreen
            onBack={() => setView("login")}
            onLogin={(pwd) => {
              if (pwd === TRAINER_PASSWORD) {
                setTrainerLoggedIn(true);
                setView("trainer");
                addNotif("Antrenör Paneli", "Hoş geldiniz!", "gold");
              } else {
                addNotif("Hata", "Yanlış şifre!", "red");
              }
            }}
          />
        )}
        {view === "trainer" && (
          <TrainerPanel
            students={students} setStudents={setStudents}
            slots={slots} setSlots={setSlots}
            addNotif={addNotif}
            onLogout={() => setView("login")}
            sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}
          />
        )}
        {view === "student" && currentStudent && (
          <StudentPanel
            student={students.find(s => s.id === currentStudent.id) || currentStudent}
            slots={slots} setSlots={setSlots}
            students={students} setStudents={setStudents}
            addNotif={addNotif}
            onLogout={() => { setView("login"); setCurrentStudent(null); }}
            sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}
          />
        )}
      </div>
    </>
  );
}

// ============================================================
// LOGIN SCREEN
// ============================================================
function LoginScreen({ onTrainer, onStudent }) {
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");

  const handleStudent = () => {
    const ok = onStudent(code);
    if (!ok) setErr("Geçersiz kod. Antrenörünüzden kodunuzu alın.");
    else setErr("");
  };

  return (
    <div className="login-screen">
      <div className="login-logo">
        <span className="gloves">🥊</span>
        <div className="brand">ANTRENÖR <span>ENES ÖZTÜRK</span></div>
        <div className="subtitle">Kickboks — Özel Ders Sistemi</div>
      </div>

      <div className="login-card">
        <h2>Öğrenci Girişi</h2>
        <div className="form-group">
          <label>Öğrenci Kodunuz</label>
          <input
            placeholder="Örn: ENES001"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === "Enter" && handleStudent()}
            style={{ textTransform: "uppercase", letterSpacing: "3px", fontSize: "18px", textAlign: "center" }}
          />
        </div>
        {err && <div style={{ color: "var(--red)", fontSize: "13px", marginBottom: "12px", textAlign: "center" }}>{err}</div>}
        <button className="btn btn-primary btn-full" onClick={handleStudent}>
          <Icon name="lock" size={16} /> Giriş Yap
        </button>

        <div className="divider" />
        <div style={{ textAlign: "center" }}>
          <button className="btn btn-ghost btn-full" onClick={onTrainer} style={{ fontSize: "13px", color: "var(--gray)" }}>
            <Icon name="star" size={14} /> Antrenör Girişi
          </button>
        </div>
      </div>

      <div style={{ marginTop: "24px", textAlign: "center", color: "#444", fontSize: "12px", letterSpacing: "1px" }}>
        🥊 HER DERS 50 DAKİKA — PROFESYONEL KİCKBOKS EĞİTİMİ
      </div>
    </div>
  );
}

// ============================================================
// TRAINER LOGIN
// ============================================================
function TrainerLoginScreen({ onBack, onLogin }) {
  const [pwd, setPwd] = useState("");
  return (
    <div className="login-screen">
      <div className="login-logo">
        <span className="gloves">⚡</span>
        <div className="brand">ANTRENÖR <span>PANELİ</span></div>
        <div className="subtitle">Yönetim — Enes Öztürk</div>
      </div>
      <div className="login-card">
        <h2>Antrenör Girişi</h2>
        <div className="form-group">
          <label>Şifre</label>
          <input type="password" placeholder="••••••••" value={pwd} onChange={e => setPwd(e.target.value)} onKeyDown={e => e.key === "Enter" && onLogin(pwd)} />
        </div>
        <button className="btn btn-gold btn-full" onClick={() => onLogin(pwd)}>
          <Icon name="lock" size={16} /> Giriş Yap
        </button>
        <div className="divider" />
        <button className="btn btn-ghost btn-full" onClick={onBack}>← Geri Dön</button>
      </div>
    </div>
  );
}

// ============================================================
// SIDEBAR COMPONENT
// ============================================================
function Sidebar({ items, active, setActive, role, onLogout, open, onClose }) {
  return (
    <>
      <div className={`mobile-overlay ${open ? "open" : ""}`} onClick={onClose} />
      <div className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-logo">
          <div className="brand">ENES <span>ÖZTÜRK</span></div>
          <div className="role-badge">{role === "trainer" ? "⚡ Antrenör Paneli" : "🥊 Öğrenci Paneli"}</div>
        </div>
        <nav className="sidebar-nav">
          {items.map((item, i) => (
            item.divider
              ? <div key={i} className="nav-section-title">{item.label}</div>
              : <div key={i} className={`nav-item ${active === item.id ? "active" : ""}`} onClick={() => { setActive(item.id); onClose(); }}>
                  <Icon name={item.icon} size={16} />
                  {item.label}
                </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="btn btn-ghost btn-full" onClick={onLogout} style={{ color: "var(--gray)" }}>
            <Icon name="logout" size={16} /> Çıkış Yap
          </button>
        </div>
      </div>
    </>
  );
}

// ============================================================
// TRAINER PANEL
// ============================================================
function TrainerPanel({ students, setStudents, slots, setSlots, addNotif, onLogout, sidebarOpen, setSidebarOpen }) {
  const [page, setPage] = useState("dashboard");

  const navItems = [
    { divider: true, label: "Ana Menü" },
    { id: "dashboard", label: "Kontrol Paneli", icon: "home" },
    { id: "today", label: "Bugünkü Dersler", icon: "clock" },
    { id: "calendar", label: "Takvim", icon: "calendar" },
    { divider: true, label: "Öğrenciler" },
    { id: "students", label: "Öğrenciler", icon: "user" },
    { id: "payments", label: "Ödemeler", icon: "money" },
    { id: "notes", label: "Ders Notları", icon: "note" },
    { divider: true, label: "Sistem" },
    { id: "notifications", label: "Bildirimler", icon: "bell" },
    { id: "reports", label: "Raporlar", icon: "chart" },
  ];

  return (
    <div className="layout">
      <Sidebar items={navItems} active={page} setActive={setPage} role="trainer" onLogout={onLogout} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <div className="mobile-header">
          <button className="btn btn-ghost" onClick={() => setSidebarOpen(true)} style={{ padding: "6px" }}><Icon name="menu" size={22} /></button>
          <div className="brand">ENES <span style={{ color: "var(--red)" }}>ÖZTÜRK</span></div>
          <div style={{ width: 40 }} />
        </div>

        {page === "dashboard" && <TrainerDashboard students={students} slots={slots} />}
        {page === "today" && <TodayLessons students={students} slots={slots} setSlots={setSlots} setStudents={setStudents} addNotif={addNotif} />}
        {page === "calendar" && <TrainerCalendar slots={slots} setSlots={setSlots} students={students} addNotif={addNotif} />}
        {page === "students" && <StudentsManager students={students} setStudents={setStudents} addNotif={addNotif} />}
        {page === "payments" && <PaymentsManager students={students} setStudents={setStudents} addNotif={addNotif} />}
        {page === "notes" && <LessonNotesManager students={students} setStudents={setStudents} />}
        {page === "notifications" && <NotificationsPage students={students} slots={slots} />}
        {page === "reports" && <ReportsPage students={students} slots={slots} />}
      </div>
    </div>
  );
}

// ============================================================
// TRAINER DASHBOARD
// ============================================================
function TrainerDashboard({ students, slots }) {
  const today = getTodayStr();
  const todaySlots = slots.filter(s => s.date === today && s.studentId);
  const totalRevenue = students.reduce((a, s) => a + s.payment.paid, 0);
  const totalPending = students.reduce((a, s) => a + (s.payment.total - s.payment.paid), 0);
  const debtors = students.filter(s => s.payment.total > s.payment.paid);
  const finishing = students.filter(s => s.remainingLessons <= 2);

  return (
    <div>
      <div className="topbar">
        <div className="page-title">KONTROL <span>PANELİ</span></div>
        <div style={{ color: "var(--gray)", fontSize: "13px" }}>{formatDate(today)}</div>
      </div>

      <div className="grid-4" style={{ marginBottom: 20 }}>
        <div className="stat-card stat-white"><div className="stat-value">{students.length}</div><div className="stat-label">Toplam Öğrenci</div></div>
        <div className="stat-card stat-red"><div className="stat-value">{todaySlots.length}</div><div className="stat-label">Bugünkü Ders</div></div>
        <div className="stat-card stat-gold"><div className="stat-value">₺{totalRevenue.toLocaleString()}</div><div className="stat-label">Toplam Gelir</div></div>
        <div className="stat-card stat-green"><div className="stat-value">{students.reduce((a, s) => a + s.completedLessons, 0)}</div><div className="stat-label">Verilen Ders</div></div>
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="card-title">⚡ Bugünkü Dersler</div>
          {todaySlots.length === 0 ? <div style={{ color: "var(--gray)", fontSize: "14px" }}>Bugün ders yok</div> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {todaySlots.map(slot => {
                const s = students.find(x => x.id === slot.studentId);
                return (
                  <div key={slot.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ background: "var(--red)", borderRadius: 8, padding: "6px 10px", fontFamily: "'Bebas Neue'", fontSize: 18, letterSpacing: 1 }}>{slot.time}</div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{s?.name}</div>
                      <div style={{ fontSize: 12, color: "var(--gray)" }}>{s?.remainingLessons} ders kaldı</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-title">⚠️ Dikkat Gereken</div>
          {debtors.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, color: "var(--gold)", marginBottom: 6, fontFamily: "'Rajdhani'", fontWeight: 700, letterSpacing: 1 }}>BORÇLU ÖĞRENCİLER</div>
              {debtors.map(s => (
                <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 14, borderBottom: "1px solid #1e1e1e" }}>
                  <span>{s.name}</span>
                  <span style={{ color: "var(--red)" }}>₺{(s.payment.total - s.payment.paid).toLocaleString()} kalan</span>
                </div>
              ))}
            </div>
          )}
          {finishing.length > 0 && (
            <div>
              <div style={{ fontSize: 13, color: "var(--red)", marginBottom: 6, fontFamily: "'Rajdhani'", fontWeight: 700, letterSpacing: 1 }}>PAKETİ BİTİYOR</div>
              {finishing.map(s => (
                <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 14, borderBottom: "1px solid #1e1e1e" }}>
                  <span>{s.name}</span>
                  <span style={{ color: "var(--yellow)" }}>{s.remainingLessons} ders kaldı</span>
                </div>
              ))}
            </div>
          )}
          {debtors.length === 0 && finishing.length === 0 && <div style={{ color: "var(--gray)", fontSize: "14px" }}>Her şey yolunda! 💪</div>}
        </div>
      </div>

      <div className="card">
        <div className="card-title">📊 Öğrenci Durumu</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {students.map(s => {
            const pct = Math.round(s.completedLessons / s.package * 100);
            return (
              <div key={s.id}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 14 }}>
                  <span style={{ fontWeight: 600 }}>{s.name} <span style={{ color: "var(--gray)", fontFamily: "'Rajdhani'", fontSize: 12, letterSpacing: 1 }}>{s.code}</span></span>
                  <span style={{ color: "var(--gray)", fontSize: 13 }}>{s.completedLessons}/{s.package} ders</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill fill-red" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// TODAY LESSONS
// ============================================================
function TodayLessons({ students, slots, setSlots, setStudents, addNotif }) {
  const today = getTodayStr();
  const todaySlots = slots.filter(s => s.date === today).sort((a, b) => a.time.localeCompare(b.time));
  const [noteModal, setNoteModal] = useState(null);
  const [noteData, setNoteData] = useState({ kondisyon: 5, yumruk: 5, tekme: 5, savunma: 5, kombinasyon: 5, sparring: 5, genel: "", note: "" });

  const completeLesson = (slot) => {
    setNoteModal(slot);
  };

  const saveComplete = () => {
    const s = students.find(x => x.id === noteModal.studentId);
    if (!s) return;

    setStudents(prev => prev.map(st => st.id === s.id ? {
      ...st,
      remainingLessons: Math.max(0, st.remainingLessons - 1),
      completedLessons: st.completedLessons + 1,
      lessons: [...(st.lessons || []), {
        date: noteModal.date, time: noteModal.time,
        scores: { ...noteData }, completedAt: new Date().toISOString()
      }]
    } : st));

    setSlots(prev => prev.map(sl => sl.id === noteModal.id ? { ...sl, status: "completed" } : sl));
    addNotif("Ders Tamamlandı ✅", `${s.name} - ${noteModal.time}`, "green");
    setNoteModal(null);
    setNoteData({ kondisyon: 5, yumruk: 5, tekme: 5, savunma: 5, kombinasyon: 5, sparring: 5, genel: "", note: "" });
  };

  return (
    <div>
      <div className="topbar"><div className="page-title">BUGÜNKÜ <span>DERSLER</span></div></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {todaySlots.length === 0 && <div className="empty-state"><div className="icon">📅</div><p>Bugün için ders yok</p></div>}
        {todaySlots.map(slot => {
          const s = slot.studentId ? students.find(x => x.id === slot.studentId) : null;
          return (
            <div key={slot.id} className="card" style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <div style={{ background: slot.status === "completed" ? "#1a3320" : "var(--red)", borderRadius: 10, padding: "10px 16px", fontFamily: "'Bebas Neue'", fontSize: 26, letterSpacing: 2, minWidth: 90, textAlign: "center" }}>
                {slot.time}
              </div>
              <div style={{ flex: 1 }}>
                {s ? (
                  <>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{s.name}</div>
                    <div style={{ fontSize: 13, color: "var(--gray)", marginTop: 2 }}>
                      {s.code} · {s.phone} · {s.remainingLessons} ders kaldı
                    </div>
                  </>
                ) : (
                  <div style={{ color: "var(--gray)" }}>Boş Saat</div>
                )}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {slot.status === "completed" && <span className="badge badge-green">✅ Tamamlandı</span>}
                {slot.status === "booked" && s && (
                  <button className="btn btn-green btn-sm" onClick={() => completeLesson(slot)}>
                    <Icon name="check" size={14} /> Ders Tamamlandı
                  </button>
                )}
                {slot.studentId && slot.status === "booked" && (
                  <WaButton student={s} slot={slot} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {noteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">DERS <span>NOTLARI</span></div>
            <div style={{ fontSize: 14, color: "var(--gray)", marginBottom: 16 }}>
              {students.find(x => x.id === noteModal.studentId)?.name} — {noteModal.time}
            </div>
            {["kondisyon", "yumruk", "tekme", "savunma", "kombinasyon", "sparring"].map(key => (
              <div key={key} className="skill-row">
                <div className="skill-label">{key}</div>
                <div className="skill-bar-wrap">
                  <input type="range" min="1" max="10" value={noteData[key]} onChange={e => setNoteData(d => ({ ...d, [key]: +e.target.value }))}
                    style={{ width: "100%", accentColor: "var(--red)" }} />
                </div>
                <div className="skill-score">{noteData[key]}</div>
              </div>
            ))}
            <div className="form-group" style={{ marginTop: 12 }}>
              <label>Genel Değerlendirme</label>
              <textarea value={noteData.note} onChange={e => setNoteData(d => ({ ...d, note: e.target.value }))} placeholder="Ders notu..." />
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setNoteModal(null)}>İptal</button>
              <button className="btn btn-green" onClick={saveComplete}><Icon name="check" size={16} /> Kaydet & Tamamla</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// WHATSAPP BUTTON
// ============================================================
function WaButton({ student, slot }) {
  const [open, setOpen] = useState(false);
  const msg = `Merhaba ${student?.name}! 🥊\n\nAntrenör Enes Öztürk ile dersiniz oluşturuldu.\n\nTarih: ${formatDate(slot.date)}\nSaat: ${slot.time}\n\n50 dakika kickboks dersi.\nGörüşmek üzere! 💪`;

  const handleWa = () => {
    const phone = student?.phone?.replace(/\D/g, "");
    const url = `https://wa.me/90${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
    setOpen(false);
  };

  return (
    <>
      <button className="btn btn-sm" onClick={() => setOpen(true)} style={{ background: "#1a3a25", color: "#25d366", border: "1px solid #1a5530" }}>
        <Icon name="whatsapp" size={14} /> WA
      </button>
      {open && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">WHATSAPP <span>MESAJI</span></div>
            <div style={{ fontSize: 14, color: "var(--gray)", marginBottom: 12 }}>Hazır mesajı düzenleyip gönderebilirsiniz:</div>
            <div className="wa-preview" style={{ whiteSpace: "pre-wrap" }}>{msg}</div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setOpen(false)}>İptal</button>
              <button className="btn" onClick={handleWa} style={{ background: "#25d366", color: "#000" }}>
                <Icon name="whatsapp" size={16} /> WhatsApp'ta Aç
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ============================================================
// TRAINER CALENDAR
// ============================================================
function TrainerCalendar({ slots, setSlots, students, addNotif }) {
  const [calView, setCalView] = useState("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [addModal, setAddModal] = useState(false);
  const [newSlot, setNewSlot] = useState({ date: getTodayStr(), time: "09:00", status: "available" });
  const [closeModal, setCloseModal] = useState(false);
  const [closeData, setCloseData] = useState({ date: getTodayStr(), allDay: false, time: "09:00", reason: "Tatil" });

  const times = ["07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00"];

  const addSlot = () => {
    const exists = slots.find(s => s.date === newSlot.date && s.time === newSlot.time);
    if (exists) { addNotif("Hata", "Bu saatte zaten bir slot var", "red"); return; }
    const id = Date.now();
    setSlots(prev => [...prev, { ...newSlot, id, studentId: null }]);
    addNotif("Saat Eklendi", `${formatDate(newSlot.date)} - ${newSlot.time}`, "green");
    setAddModal(false);
  };

  const closeSlot = () => {
    if (closeData.allDay) {
      const daySlots = slots.filter(s => s.date === closeData.date);
      if (daySlots.length === 0) {
        setSlots(prev => [...prev, { id: Date.now(), date: closeData.date, time: "00:00", status: "closed", studentId: null, reason: closeData.reason }]);
      } else {
        setSlots(prev => prev.map(s => s.date === closeData.date ? { ...s, status: "closed" } : s));
      }
      addNotif("Gün Kapatıldı", `${formatDate(closeData.date)} — ${closeData.reason}`, "gold");
    } else {
      const exists = slots.find(s => s.date === closeData.date && s.time === closeData.time);
      if (exists) {
        setSlots(prev => prev.map(s => (s.date === closeData.date && s.time === closeData.time) ? { ...s, status: "closed" } : s));
      } else {
        setSlots(prev => [...prev, { id: Date.now(), date: closeData.date, time: closeData.time, status: "closed", studentId: null, reason: closeData.reason }]);
      }
      addNotif("Saat Kapatıldı", `${formatDate(closeData.date)} - ${closeData.time}`, "gold");
    }
    setCloseModal(false);
  };

  const daySlots = slots.filter(s => s.date === selectedDate).sort((a, b) => a.time.localeCompare(b.time));

  // Build weekly dates
  const getWeekDates = () => {
    const d = new Date(currentDate);
    const day = d.getDay();
    const monday = new Date(d);
    monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
    return Array.from({ length: 7 }, (_, i) => { const x = new Date(monday); x.setDate(monday.getDate() + i); return x.toISOString().split("T")[0]; });
  };
  const weekDates = getWeekDates();
  const dayNames = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

  return (
    <div>
      <div className="topbar">
        <div className="page-title">TAKVİM <span>YÖNETİMİ</span></div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-outline btn-sm" onClick={() => setCloseModal(true)}><Icon name="x" size={14} /> Kapat</button>
          <button className="btn btn-primary btn-sm" onClick={() => setAddModal(true)}><Icon name="plus" size={14} /> Saat Ekle</button>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 16 }}>
        {["day", "week", "month"].map(v => (
          <button key={v} className={`tab-btn ${calView === v ? "active" : ""}`} onClick={() => setCalView(v)}>
            {v === "day" ? "Günlük" : v === "week" ? "Haftalık" : "Aylık"}
          </button>
        ))}
      </div>

      {calView === "week" && (
        <div>
          <div className="cal-nav">
            <button onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate() - 7); setCurrentDate(d); }}>‹</button>
            <div className="cal-title" style={{ flex: 1 }}>
              {formatDate(weekDates[0])} — {formatDate(weekDates[6])}
            </div>
            <button onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate() + 7); setCurrentDate(d); }}>›</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
            {weekDates.map((date, i) => {
              const dayS = slots.filter(s => s.date === date);
              const booked = dayS.filter(s => s.studentId).length;
              const avail = dayS.filter(s => !s.studentId && s.status === "available").length;
              const isToday = date === getTodayStr();
              return (
                <div key={date} className={`card ${selectedDate === date ? "active" : ""}`} style={{ cursor: "pointer", borderColor: selectedDate === date ? "var(--red)" : isToday ? "var(--gold)" : "var(--border)", padding: "12px 8px", textAlign: "center" }} onClick={() => setSelectedDate(date)}>
                  <div style={{ fontSize: 11, color: "var(--gray)", fontFamily: "'Rajdhani'", textTransform: "uppercase", letterSpacing: 1 }}>{dayNames[i]}</div>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: 24, color: isToday ? "var(--gold)" : "var(--white)", margin: "4px 0" }}>{date.split("-")[2]}</div>
                  {booked > 0 && <div style={{ fontSize: 11, color: "var(--red)" }}>{booked} ders</div>}
                  {avail > 0 && <div style={{ fontSize: 11, color: "var(--green)" }}>{avail} boş</div>}
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 20 }}>
            <div className="section-header">
              <div className="section-title">{formatDate(selectedDate)} — Slotar</div>
            </div>
            <div className="slot-grid">
              {times.map(time => {
                const slot = daySlots.find(s => s.time === time);
                const student = slot?.studentId ? students.find(s => s.id === slot.studentId) : null;
                return (
                  <div key={time} className={`slot-item ${slot ? (slot.status === "closed" ? "slot-closed" : slot.studentId ? "slot-mine" : "slot-available") : ""}`}
                    style={{ minHeight: 56 }}>
                    <div>{time}</div>
                    {student && <div style={{ fontSize: 11, marginTop: 2 }}>{student.name.split(" ")[0]}</div>}
                    {slot?.status === "closed" && <div style={{ fontSize: 10, color: "#555" }}>Kapalı</div>}
                    {!slot && <div style={{ fontSize: 10, color: "#444" }}>—</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {calView === "day" && (
        <div>
          <div className="cal-nav">
            <button onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() - 1); setSelectedDate(d.toISOString().split("T")[0]); }}>‹</button>
            <div className="cal-title" style={{ flex: 1 }}>{formatDate(selectedDate)}</div>
            <button onClick={() => { const d = new Date(selectedDate); d.setDate(d.getDate() + 1); setSelectedDate(d.toISOString().split("T")[0]); }}>›</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {times.map(time => {
              const slot = daySlots.find(s => s.time === time);
              const student = slot?.studentId ? students.find(s => s.id === slot.studentId) : null;
              return (
                <div key={time} className="card" style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px" }}>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: 22, letterSpacing: 1, width: 60, color: slot?.studentId ? "var(--red)" : slot?.status === "closed" ? "#444" : "var(--gray)" }}>{time}</div>
                  <div style={{ flex: 1 }}>
                    {student ? <><div style={{ fontWeight: 600 }}>{student.name}</div><div style={{ fontSize: 12, color: "var(--gray)" }}>{student.code}</div></> :
                     slot?.status === "closed" ? <span style={{ color: "#555" }}>Kapalı — {slot.reason || ""}</span> :
                     slot ? <span style={{ color: "var(--green)", fontSize: 13 }}>Boş Saat</span> :
                     <span style={{ color: "#333", fontSize: 13 }}>Eklenmemiş</span>}
                  </div>
                  {student && slot && <WaButton student={student} slot={slot} />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {calView === "month" && <MonthView slots={slots} students={students} selectedDate={selectedDate} setSelectedDate={setSelectedDate} currentDate={currentDate} setCurrentDate={setCurrentDate} />}

      {addModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">YENİ <span>SAAT EKLE</span></div>
            <div className="form-group"><label>Tarih</label><input type="date" value={newSlot.date} onChange={e => setNewSlot(d => ({ ...d, date: e.target.value }))} /></div>
            <div className="form-group">
              <label>Saat</label>
              <select value={newSlot.time} onChange={e => setNewSlot(d => ({ ...d, time: e.target.value }))}>
                {times.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setAddModal(false)}>İptal</button>
              <button className="btn btn-primary" onClick={addSlot}><Icon name="plus" size={16} /> Ekle</button>
            </div>
          </div>
        </div>
      )}

      {closeModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">SAAT <span>KAPAT</span></div>
            <div className="form-group"><label>Tarih</label><input type="date" value={closeData.date} onChange={e => setCloseData(d => ({ ...d, date: e.target.value }))} /></div>
            <div className="form-group">
              <label>Tüm Günü Kapat</label>
              <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                  <input type="checkbox" checked={closeData.allDay} onChange={e => setCloseData(d => ({ ...d, allDay: e.target.checked }))} style={{ accentColor: "var(--red)" }} />
                  <span style={{ fontSize: 14 }}>Tüm gün kapalı</span>
                </label>
              </div>
            </div>
            {!closeData.allDay && (
              <div className="form-group">
                <label>Saat</label>
                <select value={closeData.time} onChange={e => setCloseData(d => ({ ...d, time: e.target.value }))}>
                  {times.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            )}
            <div className="form-group">
              <label>Sebep</label>
              <select value={closeData.reason} onChange={e => setCloseData(d => ({ ...d, reason: e.target.value }))}>
                {["Tatil", "Mola", "Özel İş", "Bugün Ders Yok", "Hasta"].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setCloseModal(false)}>İptal</button>
              <button className="btn btn-danger" onClick={closeSlot}><Icon name="x" size={16} /> Kapat</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// MONTH VIEW
// ============================================================
function MonthView({ slots, students, selectedDate, setSelectedDate, currentDate, setCurrentDate }) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthNames = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div>
      <div className="cal-nav">
        <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>‹</button>
        <div className="cal-title" style={{ flex: 1 }}>{monthNames[month]} {year}</div>
        <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>›</button>
      </div>
      <div className="cal-days">
        {["Pzt","Sal","Çar","Per","Cum","Cmt","Paz"].map(d => <div key={d} className="cal-header">{d}</div>)}
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          const daySlots = slots.filter(s => s.date === dateStr);
          const hasEvents = daySlots.some(s => s.studentId);
          const isToday = dateStr === getTodayStr();
          const isSelected = dateStr === selectedDate;
          return (
            <div key={i} className={`cal-day ${isToday ? "today" : ""} ${isSelected ? "selected" : ""} ${hasEvents ? "has-events" : ""}`}
              onClick={() => setSelectedDate(dateStr)}>
              {d}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 20 }}>
        <div className="section-title" style={{ marginBottom: 12 }}>{formatDate(selectedDate)}</div>
        {slots.filter(s => s.date === selectedDate).sort((a, b) => a.time.localeCompare(b.time)).map(slot => {
          const st = slot.studentId ? students.find(s => s.id === slot.studentId) : null;
          return (
            <div key={slot.id} style={{ display: "flex", gap: 12, padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 14 }}>
              <span style={{ color: "var(--red)", fontFamily: "'Rajdhani'", fontWeight: 700 }}>{slot.time}</span>
              <span>{st ? st.name : <span style={{ color: "var(--gray)" }}>Boş</span>}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// STUDENTS MANAGER
// ============================================================
function StudentsManager({ students, setStudents, addNotif }) {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); // null | "add" | "edit"
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", package: 10, code: "" });
  const [qrStudent, setQrStudent] = useState(null);

  const filtered = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.code.includes(search.toUpperCase()));

  const genCode = () => {
    const num = String(students.length + 1).padStart(3, "0");
    return `ENES${num}`;
  };

  const openAdd = () => {
    setForm({ name: "", phone: "", package: 10, code: genCode() });
    setModal("add");
  };

  const openEdit = (s) => {
    setForm({ name: s.name, phone: s.phone, package: s.package, code: s.code });
    setEditId(s.id);
    setModal("edit");
  };

  const saveAdd = () => {
    if (!form.name || !form.phone) { addNotif("Hata", "Ad ve telefon gerekli", "red"); return; }
    const newS = {
      id: Date.now(), code: form.code || genCode(), name: form.name, phone: form.phone,
      package: +form.package, remainingLessons: +form.package, completedLessons: 0,
      payment: { total: 0, paid: 0, due: null, note: "" }, notes: [], lessons: [], status: "active"
    };
    setStudents(prev => [...prev, newS]);
    addNotif("Öğrenci Eklendi", form.name, "green");
    setModal(null);
  };

  const saveEdit = () => {
    setStudents(prev => prev.map(s => s.id === editId ? { ...s, name: form.name, phone: form.phone, package: +form.package, code: form.code } : s));
    addNotif("Güncellendi", form.name, "gold");
    setModal(null);
  };

  const deleteStudent = (id) => {
    if (window.confirm("Öğrenciyi silmek istediğinizden emin misiniz?")) {
      setStudents(prev => prev.filter(s => s.id !== id));
      addNotif("Silindi", "", "red");
    }
  };

  const packageOptions = [8, 10, 12, 16, 20];

  return (
    <div>
      <div className="topbar">
        <div className="page-title">ÖĞRENCİ <span>YÖNETİMİ</span></div>
        <button className="btn btn-primary btn-sm" onClick={openAdd}><Icon name="plus" size={16} /> Öğrenci Ekle</button>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="search-input-wrap">
          <div className="search-icon"><Icon name="search" size={16} /></div>
          <input placeholder="Öğrenci ara..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Kod</th><th>Ad Soyad</th><th>Telefon</th><th>Paket</th><th>Kalan</th><th>Ödeme</th><th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => {
                const debt = s.payment.total - s.payment.paid;
                return (
                  <tr key={s.id}>
                    <td><span style={{ fontFamily: "'Rajdhani'", fontWeight: 700, color: "var(--red)", letterSpacing: 1 }}>{s.code}</span></td>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td style={{ color: "var(--gray)" }}>{s.phone}</td>
                    <td><span className="badge badge-gold">{s.package} ders</span></td>
                    <td>
                      <span style={{ color: s.remainingLessons <= 2 ? "var(--red)" : "var(--green)", fontFamily: "'Rajdhani'", fontWeight: 700, fontSize: 16 }}>
                        {s.remainingLessons}
                      </span>
                    </td>
                    <td>
                      {debt > 0 ? <span className="badge badge-red">₺{debt} borç</span> : <span className="badge badge-green">Tamam</span>}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(s)}><Icon name="edit" size={14} /></button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setQrStudent(s)} style={{ color: "var(--gold)" }}><Icon name="qr" size={14} /></button>
                        <button className="btn btn-ghost btn-sm" onClick={() => deleteStudent(s.id)} style={{ color: "var(--red)" }}><Icon name="trash" size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {(modal === "add" || modal === "edit") && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">{modal === "add" ? "YENİ" : "DÜZENLE"} <span>ÖĞRENCİ</span></div>
            <div className="form-group"><label>Ad Soyad</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ahmet Yılmaz" /></div>
            <div className="form-group"><label>Telefon</label><input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="0532 111 2233" /></div>
            <div className="form-group">
              <label>Paket</label>
              <select value={form.package} onChange={e => setForm(f => ({ ...f, package: +e.target.value }))}>
                {packageOptions.map(p => <option key={p} value={p}>{p} Ders Paketi</option>)}
              </select>
            </div>
            <div className="form-group"><label>Giriş Kodu</label><input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} style={{ letterSpacing: 3, textTransform: "uppercase" }} /></div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModal(null)}>İptal</button>
              <button className="btn btn-primary" onClick={modal === "add" ? saveAdd : saveEdit}>
                <Icon name="check" size={16} /> {modal === "add" ? "Ekle" : "Güncelle"}
              </button>
            </div>
          </div>
        </div>
      )}

      {qrStudent && (
        <div className="modal-overlay">
          <div className="modal" style={{ textAlign: "center" }}>
            <div className="modal-title">QR <span>KOD</span></div>
            <div style={{ color: "var(--gray)", marginBottom: 16 }}>{qrStudent.name}</div>
            <div style={{ background: "white", borderRadius: 12, padding: 20, display: "inline-block", margin: "0 auto 16px" }}>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${qrStudent.code}`} alt="QR" style={{ display: "block" }} />
            </div>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 28, letterSpacing: 6, color: "var(--red)", margin: "12px 0" }}>{qrStudent.code}</div>
            <div style={{ color: "var(--gray)", fontSize: 13 }}>Bu kod ile öğrenci giriş yapabilir</div>
            <div className="modal-footer" style={{ justifyContent: "center" }}>
              <button className="btn btn-outline" onClick={() => setQrStudent(null)}>Kapat</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// PAYMENTS MANAGER
// ============================================================
function PaymentsManager({ students, setStudents, addNotif }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ total: 0, paid: 0, due: "", note: "" });
  const [editId, setEditId] = useState(null);

  const totalRevenue = students.reduce((a, s) => a + s.payment.paid, 0);
  const totalPending = students.reduce((a, s) => a + Math.max(0, s.payment.total - s.payment.paid), 0);
  const debtors = students.filter(s => s.payment.total > s.payment.paid);

  const openEdit = (s) => {
    setForm({ total: s.payment.total, paid: s.payment.paid, due: s.payment.due || "", note: s.payment.note || "" });
    setEditId(s.id);
    setModal("edit");
  };

  const save = () => {
    setStudents(prev => prev.map(s => s.id === editId ? { ...s, payment: { total: +form.total, paid: +form.paid, due: form.due, note: form.note } } : s));
    addNotif("Ödeme Güncellendi", "", "gold");
    setModal(null);
  };

  return (
    <div>
      <div className="topbar"><div className="page-title">ÖDEME <span>TAKİBİ</span></div></div>

      <div className="grid-3" style={{ marginBottom: 20 }}>
        <div className="stat-card stat-gold"><div className="stat-value">₺{totalRevenue.toLocaleString()}</div><div className="stat-label">Toplam Tahsilat</div></div>
        <div className="stat-card stat-red"><div className="stat-value">₺{totalPending.toLocaleString()}</div><div className="stat-label">Bekleyen Ödeme</div></div>
        <div className="stat-card stat-white"><div className="stat-value">{debtors.length}</div><div className="stat-label">Borçlu Öğrenci</div></div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Öğrenci</th><th>Paket Ücreti</th><th>Ödenen</th><th>Kalan</th><th>Son Tarih</th><th>Durum</th><th>İşlem</th></tr>
            </thead>
            <tbody>
              {students.map(s => {
                const debt = s.payment.total - s.payment.paid;
                const pct = s.payment.total > 0 ? Math.round(s.payment.paid / s.payment.total * 100) : 100;
                return (
                  <tr key={s.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{s.name}</div>
                      {s.payment.note && <div style={{ fontSize: 11, color: "var(--gray)" }}>{s.payment.note}</div>}
                    </td>
                    <td>₺{s.payment.total.toLocaleString()}</td>
                    <td style={{ color: "var(--green)" }}>₺{s.payment.paid.toLocaleString()}</td>
                    <td style={{ color: debt > 0 ? "var(--red)" : "var(--gray)" }}>
                      {debt > 0 ? `₺${debt.toLocaleString()}` : "—"}
                    </td>
                    <td style={{ color: "var(--gray)", fontSize: 13 }}>{s.payment.due ? formatDate(s.payment.due) : "—"}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div className="progress-bar" style={{ width: 60 }}>
                          <div className="progress-fill fill-gold" style={{ width: `${pct}%` }} />
                        </div>
                        <span style={{ fontSize: 12, color: "var(--gray)" }}>{pct}%</span>
                      </div>
                    </td>
                    <td><button className="btn btn-gold btn-sm" onClick={() => openEdit(s)}><Icon name="edit" size={13} /> Düzenle</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {modal === "edit" && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">ÖDEME <span>DÜZENLE</span></div>
            <div className="form-group"><label>Paket Ücreti (₺)</label><input type="number" value={form.total} onChange={e => setForm(f => ({ ...f, total: e.target.value }))} /></div>
            <div className="form-group"><label>Ödenen (₺)</label><input type="number" value={form.paid} onChange={e => setForm(f => ({ ...f, paid: e.target.value }))} /></div>
            <div className="form-group"><label>Son Ödeme Tarihi</label><input type="date" value={form.due} onChange={e => setForm(f => ({ ...f, due: e.target.value }))} /></div>
            <div className="form-group"><label>Not</label><input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="Ödeme notu..." /></div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModal(null)}>İptal</button>
              <button className="btn btn-gold" onClick={save}><Icon name="check" size={16} /> Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// LESSON NOTES MANAGER
// ============================================================
function LessonNotesManager({ students, setStudents }) {
  const [selStudent, setSelStudent] = useState(null);
  const [noteModal, setNoteModal] = useState(false);
  const [noteForm, setNoteForm] = useState({ text: "", type: "genel" });

  const addNote = () => {
    if (!noteForm.text || !selStudent) return;
    setStudents(prev => prev.map(s => s.id === selStudent.id ? {
      ...s, notes: [...(s.notes || []), { id: Date.now(), text: noteForm.text, type: noteForm.type, date: getTodayStr() }]
    } : s));
    setNoteModal(false);
    setNoteForm({ text: "", type: "genel" });
  };

  const currentStudent = selStudent ? students.find(s => s.id === selStudent.id) : null;

  return (
    <div>
      <div className="topbar"><div className="page-title">DERS <span>NOTLARI</span></div></div>
      <div className="grid-2">
        <div className="card">
          <div className="card-title">Öğrenci Seç</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {students.map(s => (
              <div key={s.id} className={`card`} style={{ cursor: "pointer", padding: "12px 14px", borderColor: selStudent?.id === s.id ? "var(--red)" : "var(--border)" }} onClick={() => setSelStudent(s)}>
                <div style={{ fontWeight: 600 }}>{s.name}</div>
                <div style={{ fontSize: 12, color: "var(--gray)", marginTop: 2 }}>{s.lessons?.length || 0} ders tamamlandı</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          {currentStudent ? (
            <div>
              <div className="section-header">
                <div className="section-title">{currentStudent.name}</div>
                <button className="btn btn-primary btn-sm" onClick={() => setNoteModal(true)}><Icon name="plus" size={14} /> Not Ekle</button>
              </div>

              {currentStudent.lessons?.length > 0 && (
                <div className="card" style={{ marginBottom: 16 }}>
                  <div className="card-title">Gelişim Skoru — Son Ders</div>
                  {(() => {
                    const last = currentStudent.lessons[currentStudent.lessons.length - 1];
                    return last?.scores ? (
                      <div>
                        {["kondisyon","yumruk","tekme","savunma","kombinasyon","sparring"].map(k => (
                          last.scores[k] && <div key={k} className="skill-row">
                            <div className="skill-label">{k}</div>
                            <div className="skill-bar-wrap">
                              <div className="progress-bar">
                                <div className="progress-fill fill-gold" style={{ width: `${last.scores[k] * 10}%` }} />
                              </div>
                            </div>
                            <div className="skill-score">{last.scores[k]}/10</div>
                          </div>
                        ))}
                      </div>
                    ) : null;
                  })()}
                </div>
              )}

              <div className="card">
                <div className="card-title">Notlar</div>
                {(currentStudent.notes || []).length === 0 && <div style={{ color: "var(--gray)", fontSize: 14 }}>Henüz not yok</div>}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {(currentStudent.notes || []).map(n => (
                    <div key={n.id} style={{ padding: "10px 12px", background: "#1a1a1a", borderRadius: 8, borderLeft: "3px solid var(--gold)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span className="badge badge-gold">{n.type}</span>
                        <span style={{ fontSize: 12, color: "var(--gray)" }}>{formatDate(n.date)}</span>
                      </div>
                      <div style={{ fontSize: 14, marginTop: 6 }}>{n.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state"><div className="icon">📝</div><p>Sol taraftan öğrenci seçin</p></div>
          )}
        </div>
      </div>

      {noteModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">NOT <span>EKLE</span></div>
            <div className="form-group">
              <label>Not Tipi</label>
              <select value={noteForm.type} onChange={e => setNoteForm(f => ({ ...f, type: e.target.value }))}>
                {["genel","geç geldi","gelmedi","kondisyon","teknik","davranış","diğer"].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Not</label><textarea value={noteForm.text} onChange={e => setNoteForm(f => ({ ...f, text: e.target.value }))} placeholder="Not içeriği..." /></div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setNoteModal(false)}>İptal</button>
              <button className="btn btn-gold" onClick={addNote}><Icon name="check" size={16} /> Ekle</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// NOTIFICATIONS PAGE
// ============================================================
function NotificationsPage({ students, slots }) {
  const today = getTodayStr();
  const debtors = students.filter(s => s.payment.total > s.payment.paid);
  const finishing = students.filter(s => s.remainingLessons <= 2 && s.remainingLessons > 0);
  const todayLessons = slots.filter(s => s.date === today && s.studentId);

  const notifications = [
    ...todayLessons.map(s => ({ type: "gold", title: "Bugün Ders Var", body: `${students.find(x => x.id === s.studentId)?.name} — ${s.time}`, date: today })),
    ...debtors.map(s => ({ type: "red", title: "Bekleyen Ödeme", body: `${s.name} — ₺${s.payment.total - s.payment.paid} borç`, date: today })),
    ...finishing.map(s => ({ type: "gold", title: "Paket Bitiyor", body: `${s.name} — ${s.remainingLessons} ders kaldı`, date: today })),
  ];

  return (
    <div>
      <div className="topbar"><div className="page-title">BİLDİRİMLER</div></div>
      {notifications.length === 0 ? <div className="empty-state"><div className="icon">🔔</div><p>Bildirim yok</p></div> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {notifications.map((n, i) => (
            <div key={i} className={`notif notif-${n.type}`} style={{ position: "static", animation: "none", minWidth: "unset", maxWidth: "unset" }}>
              <div style={{ flex: 1 }}>
                <div className="notif-title">{n.title}</div>
                <div className="notif-body">{n.body}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// REPORTS PAGE
// ============================================================
function ReportsPage({ students, slots }) {
  const totalRevenue = students.reduce((a, s) => a + s.payment.paid, 0);
  const totalLessons = students.reduce((a, s) => a + s.completedLessons, 0);
  const avgLessons = students.length > 0 ? (totalLessons / students.length).toFixed(1) : 0;

  const exportCSV = () => {
    const rows = [
      ["Kod","Ad Soyad","Telefon","Paket","Tamamlanan","Kalan","Ödenen","Kalan Borç"],
      ...students.map(s => [s.code, s.name, s.phone, s.package, s.completedLessons, s.remainingLessons, s.payment.paid, s.payment.total - s.payment.paid])
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = "ogrenciler.csv"; a.click();
  };

  return (
    <div>
      <div className="topbar">
        <div className="page-title">RAPORLAR</div>
        <button className="btn btn-outline btn-sm" onClick={exportCSV}><Icon name="download" size={14} /> CSV İndir</button>
      </div>

      <div className="grid-3" style={{ marginBottom: 20 }}>
        <div className="stat-card stat-gold"><div className="stat-value">₺{totalRevenue.toLocaleString()}</div><div className="stat-label">Toplam Gelir</div></div>
        <div className="stat-card stat-white"><div className="stat-value">{totalLessons}</div><div className="stat-label">Verilen Ders</div></div>
        <div className="stat-card stat-red"><div className="stat-value">{avgLessons}</div><div className="stat-label">Kişi Başı Ders</div></div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title">En Aktif Öğrenciler</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[...students].sort((a, b) => b.completedLessons - a.completedLessons).map((s, i) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: 22, color: i === 0 ? "var(--gold)" : "var(--gray)", width: 28 }}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{s.name}</div>
                <div className="progress-bar" style={{ marginTop: 4 }}>
                  <div className="progress-fill fill-red" style={{ width: `${Math.min(100, s.completedLessons / 12 * 100)}%` }} />
                </div>
              </div>
              <div style={{ fontFamily: "'Rajdhani'", fontWeight: 700, color: "var(--gold)" }}>{s.completedLessons} ders</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Paket Dağılımı</div>
        {[8, 10, 12].map(pkg => {
          const count = students.filter(s => s.package === pkg).length;
          return (
            <div key={pkg} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{ width: 70, fontFamily: "'Rajdhani'", fontWeight: 700 }}>{pkg} Ders</div>
              <div className="progress-bar" style={{ flex: 1 }}>
                <div className="progress-fill fill-gold" style={{ width: `${students.length > 0 ? count / students.length * 100 : 0}%` }} />
              </div>
              <div style={{ color: "var(--gray)", fontSize: 13 }}>{count} kişi</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// STUDENT PANEL
// ============================================================
function StudentPanel({ student, slots, setSlots, students, setStudents, addNotif, onLogout, sidebarOpen, setSidebarOpen }) {
  const [page, setPage] = useState("home");

  const navItems = [
    { divider: true, label: "Panelim" },
    { id: "home", label: "Ana Sayfa", icon: "home" },
    { id: "book", label: "Randevu Al", icon: "calendar" },
    { id: "history", label: "Ders Geçmişi", icon: "clock" },
    { id: "progress", label: "Gelişimim", icon: "chart" },
    { id: "payment", label: "Ödeme Durumu", icon: "money" },
  ];

  return (
    <div className="layout">
      <Sidebar items={navItems} active={page} setActive={setPage} role="student" onLogout={onLogout} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <div className="mobile-header">
          <button className="btn btn-ghost" onClick={() => setSidebarOpen(true)} style={{ padding: "6px" }}><Icon name="menu" size={22} /></button>
          <div className="brand">ENES <span style={{ color: "var(--red)" }}>ÖZTÜRK</span></div>
          <div style={{ width: 40 }} />
        </div>

        {page === "home" && <StudentHome student={student} slots={slots} />}
        {page === "book" && <StudentBook student={student} slots={slots} setSlots={setSlots} students={students} setStudents={setStudents} addNotif={addNotif} />}
        {page === "history" && <StudentHistory student={student} />}
        {page === "progress" && <StudentProgress student={student} />}
        {page === "payment" && <StudentPayment student={student} />}
      </div>
    </div>
  );
}

// ============================================================
// STUDENT HOME
// ============================================================
function StudentHome({ student, slots }) {
  const upcoming = slots.filter(s => s.studentId === student.id && s.date >= getTodayStr() && s.status !== "cancelled").sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))[0];
  const pct = Math.round(student.completedLessons / student.package * 100);
  const debt = student.payment.total - student.payment.paid;

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="page-title">HOŞ GELDİN, <span>{student.name.split(" ")[0].toUpperCase()}</span></div>
          <div style={{ color: "var(--gray)", fontSize: 13, marginTop: -4 }}>{student.code}</div>
        </div>
        <div style={{ fontSize: 40 }}>🥊</div>
      </div>

      <div className="grid-4" style={{ marginBottom: 20 }}>
        <div className="stat-card stat-red"><div className="stat-value">{student.remainingLessons}</div><div className="stat-label">Kalan Ders</div></div>
        <div className="stat-card stat-white"><div className="stat-value">{student.completedLessons}</div><div className="stat-label">Tamamlanan</div></div>
        <div className="stat-card stat-gold"><div className="stat-value">{student.package}</div><div className="stat-label">Paket</div></div>
        <div className={`stat-card ${debt > 0 ? "stat-red" : "stat-green"}`}><div className="stat-value">{debt > 0 ? `₺${debt}` : "✓"}</div><div className="stat-label">Ödeme</div></div>
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="card-title">📅 Yaklaşan Randevu</div>
          {upcoming ? (
            <div>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: 28, letterSpacing: 2, color: "var(--red)" }}>{upcoming.time}</div>
              <div style={{ fontSize: 15, marginTop: 4 }}>{formatDate(upcoming.date)}</div>
              <div style={{ fontSize: 13, color: "var(--gray)", marginTop: 4 }}>50 dakika kickboks</div>
            </div>
          ) : (
            <div style={{ color: "var(--gray)", fontSize: 14 }}>Randevunuz yok. <br />Hemen randevu alın!</div>
          )}
        </div>

        <div className="card">
          <div className="card-title">💪 Paket İlerlemesi</div>
          <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--gray)", fontSize: 13 }}>{student.completedLessons}/{student.package} ders</span>
            <span style={{ color: "var(--gold)", fontFamily: "'Rajdhani'", fontWeight: 700 }}>%{pct}</span>
          </div>
          <div className="progress-bar" style={{ height: 10 }}>
            <div className="progress-fill fill-red" style={{ width: `${pct}%` }} />
          </div>
          {student.remainingLessons <= 2 && (
            <div className="alert alert-warning" style={{ marginTop: 12 }}>
              <Icon name="warning" size={16} /> Paketin bitiyor! {student.remainingLessons} ders kaldı.
            </div>
          )}
        </div>
      </div>

      {student.notes?.length > 0 && (
        <div className="card">
          <div className="card-title">📝 Antrenör Notları</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {student.notes.slice(-3).map(n => (
              <div key={n.id} style={{ padding: "10px 12px", background: "#1a1a1a", borderRadius: 8, borderLeft: "3px solid var(--gold)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span className="badge badge-gold">{n.type}</span>
                  <span style={{ fontSize: 12, color: "var(--gray)" }}>{formatDate(n.date)}</span>
                </div>
                <div style={{ fontSize: 14 }}>{n.text}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// STUDENT BOOK
// ============================================================
function StudentBook({ student, slots, setSlots, students, setStudents, addNotif }) {
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [confirmSlot, setConfirmSlot] = useState(null);

  const availableSlots = slots.filter(s => s.date === selectedDate && s.status === "available" && !s.studentId);
  const mySlots = slots.filter(s => s.studentId === student.id && s.date >= getTodayStr() && s.status !== "cancelled");

  const getNext7Days = () => Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i);
    return d.toISOString().split("T")[0];
  });

  const bookSlot = () => {
    if (student.remainingLessons <= 0) { addNotif("Hata", "Kalan dersiniz yok!", "red"); return; }
    setSlots(prev => prev.map(s => s.id === confirmSlot.id ? { ...s, studentId: student.id, status: "booked" } : s));
    addNotif("Randevu Alındı! 🥊", `${formatDate(confirmSlot.date)} - ${confirmSlot.time}`, "green");
    setConfirmSlot(null);
  };

  const cancelSlot = (slot) => {
    if (!canCancel(slot.date, slot.time)) { addNotif("İptal Edilemez", "18 saatten az kaldı", "red"); return; }
    if (window.confirm("Randevuyu iptal etmek istiyor musunuz?")) {
      setSlots(prev => prev.map(s => s.id === slot.id ? { ...s, studentId: null, status: "available" } : s));
      addNotif("Randevu İptal Edildi", `${formatDate(slot.date)} - ${slot.time}`, "gold");
    }
  };

  const days = getNext7Days();

  return (
    <div>
      <div className="topbar"><div className="page-title">RANDEVU <span>AL</span></div></div>

      {student.remainingLessons === 0 && (
        <div className="alert alert-danger" style={{ marginBottom: 16 }}>
          <Icon name="warning" size={16} /> Kalan dersiniz yok. Yeni paket almak için antrenörünüzle iletişime geçin.
        </div>
      )}

      {mySlots.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-title">📅 Mevcut Randevularım</div>
          {mySlots.map(slot => (
            <div key={slot.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ background: "rgba(230,51,41,0.15)", border: "1px solid rgba(230,51,41,0.3)", borderRadius: 8, padding: "8px 12px", fontFamily: "'Bebas Neue'", fontSize: 20, color: "var(--red)", letterSpacing: 1, minWidth: 80, textAlign: "center" }}>
                {slot.time}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{formatDate(slot.date)}</div>
                <div style={{ fontSize: 12, color: "var(--gray)" }}>50 dakika kickboks</div>
              </div>
              {canCancel(slot.date, slot.time) ? (
                <button className="btn btn-danger btn-sm" onClick={() => cancelSlot(slot)}>İptal</button>
              ) : (
                <span className="badge badge-gray">18s kural</span>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title">Tarih Seç</div>
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
          {days.map(date => {
            const cnt = slots.filter(s => s.date === date && s.status === "available" && !s.studentId).length;
            const isToday = date === getTodayStr();
            const dayName = new Date(date).toLocaleDateString("tr-TR", { weekday: "short" });
            return (
              <div key={date} onClick={() => setSelectedDate(date)} style={{
                minWidth: 64, padding: "10px 6px", borderRadius: 10, border: `1px solid ${selectedDate === date ? "var(--red)" : "var(--border)"}`,
                background: selectedDate === date ? "rgba(230,51,41,0.12)" : "var(--dark)", cursor: "pointer", textAlign: "center", flexShrink: 0
              }}>
                <div style={{ fontSize: 10, color: isToday ? "var(--gold)" : "var(--gray)", fontFamily: "'Rajdhani'", letterSpacing: 1, fontWeight: 700, textTransform: "uppercase" }}>{dayName}</div>
                <div style={{ fontFamily: "'Bebas Neue'", fontSize: 22, color: isToday ? "var(--gold)" : "var(--white)", lineHeight: 1.2 }}>{date.split("-")[2]}</div>
                {cnt > 0 && <div style={{ fontSize: 10, color: "var(--green)", marginTop: 2 }}>{cnt} boş</div>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Boş Saatler — {formatDate(selectedDate)}</div>
        {availableSlots.length === 0 ? (
          <div style={{ color: "var(--gray)", fontSize: 14, padding: "12px 0" }}>Bu tarihte boş saat yok</div>
        ) : (
          <div className="slot-grid">
            {availableSlots.map(slot => (
              <div key={slot.id} className="slot-item slot-available" onClick={() => setConfirmSlot(slot)}>
                {slot.time}
              </div>
            ))}
          </div>
        )}
      </div>

      {confirmSlot && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">RANDEVU <span>ONAYLA</span></div>
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🥊</div>
              <div style={{ fontFamily: "'Bebas Neue'", fontSize: 36, letterSpacing: 2, color: "var(--red)" }}>{confirmSlot.time}</div>
              <div style={{ fontSize: 18, color: "var(--white)", marginTop: 4 }}>{formatDate(confirmSlot.date)}</div>
              <div style={{ fontSize: 14, color: "var(--gray)", marginTop: 8 }}>50 dakika kickboks dersi</div>
              <div style={{ marginTop: 16, padding: "10px 16px", background: "#1a1a1a", borderRadius: 8, fontSize: 14, color: "var(--gray-light)" }}>
                Kalan dersiniz: <strong style={{ color: "var(--gold)" }}>{student.remainingLessons}</strong> → <strong style={{ color: "var(--red)" }}>{student.remainingLessons - 1}</strong>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setConfirmSlot(null)}>Vazgeç</button>
              <button className="btn btn-primary" onClick={bookSlot}><Icon name="check" size={16} /> Randevu Al</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// STUDENT HISTORY
// ============================================================
function StudentHistory({ student }) {
  const lessons = student.lessons || [];
  return (
    <div>
      <div className="topbar"><div className="page-title">DERS <span>GEÇMİŞİ</span></div></div>
      {lessons.length === 0 ? (
        <div className="empty-state"><div className="icon">📋</div><p>Henüz tamamlanan ders yok</p></div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[...lessons].reverse().map((l, i) => (
            <div key={i} className="card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: 20, letterSpacing: 1 }}>{formatDate(l.date)}</div>
                  <div style={{ fontSize: 13, color: "var(--gray)" }}>{l.time} — 50 dakika</div>
                </div>
                <span className="badge badge-green">✅ Tamamlandı</span>
              </div>
              {l.scores && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                  {["kondisyon","yumruk","tekme","savunma","kombinasyon","sparring"].filter(k => l.scores[k]).map(k => (
                    <div key={k} style={{ background: "#1a1a1a", borderRadius: 8, padding: "8px 10px", textAlign: "center" }}>
                      <div style={{ fontSize: 11, color: "var(--gray)", textTransform: "uppercase", letterSpacing: 1, fontFamily: "'Rajdhani'", fontWeight: 700 }}>{k}</div>
                      <div style={{ fontFamily: "'Bebas Neue'", fontSize: 24, color: "var(--gold)" }}>{l.scores[k]}</div>
                    </div>
                  ))}
                </div>
              )}
              {l.scores?.note && <div style={{ marginTop: 10, fontSize: 14, color: "var(--gray-light)", padding: "10px", background: "#111", borderRadius: 8 }}>📝 {l.scores.note}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// STUDENT PROGRESS
// ============================================================
function StudentProgress({ student }) {
  const lessons = student.lessons || [];
  const skillKeys = ["kondisyon","yumruk","tekme","savunma","kombinasyon","sparring"];

  const avgScores = skillKeys.reduce((acc, k) => {
    const vals = lessons.filter(l => l.scores?.[k]).map(l => l.scores[k]);
    acc[k] = vals.length > 0 ? (vals.reduce((a, v) => a + v, 0) / vals.length).toFixed(1) : null;
    return acc;
  }, {});

  const latestScores = lessons.length > 0 ? lessons[lessons.length - 1].scores : null;

  return (
    <div>
      <div className="topbar"><div className="page-title">GELİŞİMİM</div></div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="card-title">⭐ Ortalama Puanlar</div>
          {skillKeys.map(k => (
            <div key={k} className="skill-row">
              <div className="skill-label">{k}</div>
              <div className="skill-bar-wrap">
                <div className="progress-bar">
                  <div className="progress-fill fill-gold" style={{ width: avgScores[k] ? `${avgScores[k] * 10}%` : "0%" }} />
                </div>
              </div>
              <div className="skill-score">{avgScores[k] || "—"}</div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title">🥊 Son Ders Skorları</div>
          {latestScores ? (
            skillKeys.filter(k => latestScores[k]).map(k => (
              <div key={k} className="skill-row">
                <div className="skill-label">{k}</div>
                <div className="skill-bar-wrap">
                  <div className="progress-bar">
                    <div className="progress-fill fill-red" style={{ width: `${latestScores[k] * 10}%` }} />
                  </div>
                </div>
                <div className="skill-score">{latestScores[k]}</div>
              </div>
            ))
          ) : (
            <div style={{ color: "var(--gray)", fontSize: 14 }}>Henüz ders tamamlanmadı</div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-title">📈 Ders İlerlemesi</div>
        <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 48, color: "var(--red)", lineHeight: 1 }}>{student.completedLessons}</div>
            <div style={{ fontSize: 12, color: "var(--gray)", textTransform: "uppercase", letterSpacing: 1 }}>Tamamlanan</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
              <span style={{ color: "var(--gray)" }}>Paket İlerlemesi</span>
              <span style={{ color: "var(--gold)" }}>{Math.round(student.completedLessons / student.package * 100)}%</span>
            </div>
            <div className="progress-bar" style={{ height: 12 }}>
              <div className="progress-fill fill-red" style={{ width: `${student.completedLessons / student.package * 100}%` }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 12, color: "var(--gray)" }}>
              <span>0</span>
              <span>{student.package} ders</span>
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 48, color: "var(--green)", lineHeight: 1 }}>{student.remainingLessons}</div>
            <div style={{ fontSize: 12, color: "var(--gray)", textTransform: "uppercase", letterSpacing: 1 }}>Kalan</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// STUDENT PAYMENT
// ============================================================
function StudentPayment({ student }) {
  const debt = student.payment.total - student.payment.paid;
  const pct = student.payment.total > 0 ? Math.round(student.payment.paid / student.payment.total * 100) : 100;

  return (
    <div>
      <div className="topbar"><div className="page-title">ÖDEME <span>DURUMU</span></div></div>

      <div className="grid-3" style={{ marginBottom: 20 }}>
        <div className="stat-card stat-white"><div className="stat-value">₺{student.payment.total.toLocaleString()}</div><div className="stat-label">Paket Ücreti</div></div>
        <div className="stat-card stat-green"><div className="stat-value">₺{student.payment.paid.toLocaleString()}</div><div className="stat-label">Ödenen</div></div>
        <div className={`stat-card ${debt > 0 ? "stat-red" : "stat-green"}`}><div className="stat-value">{debt > 0 ? `₺${debt.toLocaleString()}` : "✓"}</div><div className="stat-label">Kalan Borç</div></div>
      </div>

      <div className="card">
        <div className="card-title">Ödeme İlerlemesi</div>
        <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "var(--gray)", fontSize: 13 }}>₺{student.payment.paid.toLocaleString()} / ₺{student.payment.total.toLocaleString()}</span>
          <span style={{ color: "var(--gold)", fontFamily: "'Rajdhani'", fontWeight: 700 }}>%{pct}</span>
        </div>
        <div className="progress-bar" style={{ height: 10 }}>
          <div className="progress-fill fill-gold" style={{ width: `${pct}%` }} />
        </div>

        {student.payment.due && (
          <div style={{ marginTop: 16, display: "flex", gap: 12, fontSize: 14 }}>
            <div style={{ color: "var(--gray)" }}>Son Ödeme Tarihi:</div>
            <div style={{ color: "var(--yellow)", fontWeight: 600 }}>{formatDate(student.payment.due)}</div>
          </div>
        )}

        {student.payment.note && (
          <div style={{ marginTop: 12, padding: "10px 14px", background: "#1a1a1a", borderRadius: 8, fontSize: 14, color: "var(--gray-light)" }}>
            📝 {student.payment.note}
          </div>
        )}

        {debt > 0 && (
          <div className="alert alert-warning" style={{ marginTop: 16 }}>
            <Icon name="warning" size={16} /> Ödeme bakiyeniz var. Detaylar için antrenörünüzle iletişime geçin.
          </div>
        )}

        {debt === 0 && (
          <div className="alert alert-success" style={{ marginTop: 16 }}>
            <Icon name="check" size={16} /> Ödemeniz tamamdır! 💪
          </div>
        )}
      </div>
    </div>
  );
}