'use client';
import { useState } from 'react';

export default function PcRemoto() {
  const [pin, setPin] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(null);

  async function sendCommand(action) {
    if (pin.length < 4) {
      setStatus({ type: 'error', message: 'Inserisci il PIN (min. 4 cifre)' });
      return;
    }
    setLoading(action);
    setStatus(null);
    try {
      const res = await fetch(`/pc/api/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStatus({ type: 'success', message: data.message });
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(null);
    }
  }

  return (
    <main className="root">
      <div className="panel">
        <div className="header">
          <div className="dot" />
          <span className="hostname">PC-RICCARDO</span>
        </div>

        <div className="display">
          <svg width="72" height="54" viewBox="0 0 80 60" fill="none">
            <rect x="4" y="4" width="72" height="46" rx="4" stroke="currentColor" strokeWidth="2.5"/>
            <rect x="12" y="12" width="56" height="30" rx="2" fill="currentColor" opacity="0.08"/>
            <path d="M28 54h24M40 50v4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
          <span className="ip">home.riccardoricciardi.com</span>
        </div>

        <div className="pin-wrap">
          <label htmlFor="pin">PIN</label>
          <input
            id="pin"
            type="password"
            inputMode="numeric"
            placeholder="· · · ·"
            maxLength={8}
            value={pin}
            onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
            onKeyDown={e => e.key === 'Enter' && sendCommand('wol')}
          />
        </div>

        <div className="actions">
          <button className="btn on" onClick={() => sendCommand('wol')} disabled={!!loading}>
            {loading === 'wol' ? <span className="spin" /> : <PowerIcon />}
            Accendi
          </button>
          <button className="btn off" onClick={() => sendCommand('shutdown')} disabled={!!loading}>
            {loading === 'shutdown' ? <span className="spin" /> : <PowerIcon />}
            Spegni
          </button>
        </div>

        {status && (
          <div className={`toast ${status.type}`}>
            {status.type === 'success' ? '✓' : '✕'} {status.message}
          </div>
        )}
      </div>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .root {
          min-height: 100svh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #080810;
          font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
        }
        .panel {
          width: min(360px, 92vw);
          background: #0e0e1a;
          border: 1px solid #1c1c30;
          border-radius: 16px;
          padding: 2rem 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .header { display: flex; align-items: center; gap: 8px; }
        .dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #22c55e; box-shadow: 0 0 6px #22c55e;
          animation: pulse 2s infinite;
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .hostname { font-size: 11px; letter-spacing: 0.15em; color: #4a4a6a; }
        .display {
          display: flex; flex-direction: column; align-items: center;
          gap: 12px; padding: 1rem 0 0.5rem; color: #3a3a5c;
        }
        .ip {
          font-size: 11px; letter-spacing: 0.05em; color: #3a3a5c;
          background: #121220; border: 1px solid #1c1c30;
          padding: 4px 12px; border-radius: 20px;
        }
        .pin-wrap { display: flex; flex-direction: column; gap: 6px; }
        label { font-size: 10px; letter-spacing: 0.2em; color: #3a3a5c; }
        input {
          width: 100%; background: #080810; border: 1px solid #1c1c30;
          border-radius: 10px; padding: 14px 16px;
          font-family: inherit; font-size: 1.4rem; letter-spacing: 0.4em;
          color: #a0a0c8; text-align: center; outline: none;
          transition: border-color 0.2s;
        }
        input:focus { border-color: #4a4af0; }
        input::placeholder { color: #1e1e30; font-size: 1rem; letter-spacing: 0.3em; }
        .actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .btn {
          display: flex; align-items: center; justify-content: center;
          gap: 8px; padding: 14px 0; border-radius: 10px; border: none;
          font-family: inherit; font-size: 13px; letter-spacing: 0.05em;
          cursor: pointer; transition: opacity 0.15s, transform 0.1s;
        }
        .btn:active { transform: scale(0.96); }
        .btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .btn.on { background: #4a4af0; color: #fff; }
        .btn.on:hover:not(:disabled) { background: #3a3ae0; }
        .btn.off { background: #121220; color: #4a4a6a; border: 1px solid #1c1c30; }
        .btn.off:hover:not(:disabled) { color: #8080a8; border-color: #2c2c48; }
        .toast {
          padding: 10px 14px; border-radius: 8px;
          font-size: 12px; text-align: center;
        }
        .toast.success { background: #0a1f0f; color: #4ade80; border: 1px solid #14401e; }
        .toast.error { background: #1f0a0a; color: #f87171; border: 1px solid #401414; }
        .spin {
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.2); border-top-color: #fff;
          border-radius: 50%; animation: spin 0.5s linear infinite; display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </main>
  );
}

function PowerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M18.36 6.64a9 9 0 1 1-12.73 0"/>
      <line x1="12" y1="2" x2="12" y2="12"/>
    </svg>
  );
}
