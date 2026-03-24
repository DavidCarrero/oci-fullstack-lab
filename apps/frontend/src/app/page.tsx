'use client';

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type HealthStatus = 'idle' | 'loading' | 'ok' | 'error';

interface HealthData {
  status: string;
  uptime: number;
  timestamp: string;
}

export default function Home() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus>('idle');
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const checkHealth = async () => {
    setHealthStatus('loading');
    setHealthData(null);
    setErrorMsg('');
    try {
      const res = await fetch(`${API_URL}/health`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: HealthData = await res.json();
      setHealthData(data);
      setHealthStatus('ok');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
      setHealthStatus('error');
    }
  };

  const formatUptime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #0f1117;
          color: #e2e8f0;
          font-family: 'Segoe UI', system-ui, sans-serif;
          min-height: 100vh;
        }

        .page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          gap: 2rem;
        }

        .hero {
          text-align: center;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(99,102,241,0.15);
          border: 1px solid rgba(99,102,241,0.4);
          color: #a5b4fc;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 0.3rem 0.8rem;
          border-radius: 999px;
          margin-bottom: 1rem;
        }

        .badge-dot {
          width: 6px;
          height: 6px;
          background: #818cf8;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        h1 {
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 800;
          background: linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #f472b6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.1;
          margin-bottom: 0.75rem;
        }

        .subtitle {
          color: #94a3b8;
          font-size: 1rem;
          max-width: 480px;
          margin: 0 auto;
        }

        .cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1rem;
          width: 100%;
          max-width: 860px;
        }

        .card {
          background: #1e2130;
          border: 1px solid #2d3148;
          border-radius: 16px;
          padding: 1.5rem;
        }

        .card-label {
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #64748b;
          margin-bottom: 0.5rem;
        }

        .card-value {
          font-size: 0.95rem;
          color: #cbd5e1;
          font-family: 'Cascadia Code', 'Fira Code', monospace;
          word-break: break-all;
        }

        .health-card {
          background: #1e2130;
          border: 1px solid #2d3148;
          border-radius: 16px;
          padding: 1.5rem;
          width: 100%;
          max-width: 860px;
        }

        .health-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .health-title {
          font-size: 1rem;
          font-weight: 700;
          color: #e2e8f0;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 0.55rem 1.25rem;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.1s;
        }

        .btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
        .btn:active:not(:disabled) { transform: translateY(0); }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .result {
          border-radius: 10px;
          padding: 1rem 1.25rem;
          font-size: 0.875rem;
        }

        .result-ok {
          background: rgba(16,185,129,0.1);
          border: 1px solid rgba(16,185,129,0.3);
        }

        .result-error {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.3);
        }

        .result-idle {
          background: rgba(100,116,139,0.08);
          border: 1px solid rgba(100,116,139,0.2);
          color: #64748b;
        }

        .status-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 0.5rem;
        }

        .dot-ok { background: #10b981; }
        .dot-error { background: #ef4444; }

        .result-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 0.75rem;
          margin-top: 0.75rem;
        }

        .result-item label {
          display: block;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #64748b;
          margin-bottom: 0.2rem;
        }

        .result-item span {
          font-family: 'Cascadia Code', 'Fira Code', monospace;
          font-size: 0.85rem;
          color: #a7f3d0;
        }

        .error-msg {
          font-family: 'Cascadia Code', 'Fira Code', monospace;
          color: #fca5a5;
        }

        .footer {
          color: #334155;
          font-size: 0.75rem;
          text-align: center;
        }
      `}</style>

      <div className="page">
        <div className="hero">
          <div className="badge">
            <span className="badge-dot" />
            CI/CD Pipeline
          </div>
          <h1>OCI DevOps Lab</h1>
          <p className="subtitle">
            Demo de pipeline CI/CD multi-modelo desplegado en Oracle Cloud Infrastructure
          </p>
        </div>

        <div className="cards">
          <div className="card">
            <div className="card-label">Frontend</div>
            <div className="card-value">Next.js 14 · puerto 3000</div>
          </div>
          <div className="card">
            <div className="card-label">Backend API</div>
            <div className="card-value">{API_URL}</div>
          </div>
          <div className="card">
            <div className="card-label">Stack</div>
            <div className="card-value">NestJS · TypeScript · React</div>
          </div>
        </div>

        <div className="health-card">
          <div className="health-header">
            <span className="health-title">Health Check — Backend</span>
            <button className="btn" onClick={checkHealth} disabled={healthStatus === 'loading'}>
              {healthStatus === 'loading' ? (
                <>
                  <span className="spinner" /> Verificando...
                </>
              ) : (
                <> Verificar backend</>
              )}
            </button>
          </div>

          {healthStatus === 'idle' && (
            <div className="result result-idle">
              Presiona el boton para verificar la conexion con el backend.
            </div>
          )}

          {healthStatus === 'ok' && healthData && (
            <div className="result result-ok">
              <div>
                <span className="status-dot dot-ok" />
                <strong style={{ color: '#10b981' }}>Backend conectado</strong>
              </div>
              <div className="result-grid">
                <div className="result-item">
                  <label>Estado</label>
                  <span>{healthData.status}</span>
                </div>
                <div className="result-item">
                  <label>Uptime</label>
                  <span>{formatUptime(healthData.uptime)}</span>
                </div>
                <div className="result-item">
                  <label>Timestamp</label>
                  <span>{new Date(healthData.timestamp).toLocaleTimeString('es-CO')}</span>
                </div>
              </div>
            </div>
          )}

          {healthStatus === 'error' && (
            <div className="result result-error">
              <div>
                <span className="status-dot dot-error" />
                <strong style={{ color: '#ef4444' }}>Error de conexion</strong>
              </div>
              <div style={{ marginTop: '0.5rem' }}>
                <span className="error-msg">{errorMsg}</span>
              </div>
            </div>
          )}
        </div>

        <p className="footer">OCI DevOps Lab · Next.js + NestJS</p>
      </div>
    </>
  );
}
