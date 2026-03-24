'use client';

import { useState } from 'react';
import styles from './page.module.css';

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
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          CI/CD Pipeline
        </div>
        <h1 className={styles.title}>OCI DevOps Lab</h1>
        <p className={styles.subtitle}>
          Demo de pipeline CI/CD multi-modelo desplegado en Oracle Cloud Infrastructure
        </p>
      </div>

      <div className={styles.cards}>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Frontend</div>
          <div className={styles.cardValue}>Next.js 14 · puerto 3000</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Backend API</div>
          <div className={styles.cardValue}>{API_URL}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Stack</div>
          <div className={styles.cardValue}>NestJS · TypeScript · React</div>
        </div>
      </div>

      <div className={styles.healthCard}>
        <div className={styles.healthHeader}>
          <span className={styles.healthTitle}>Health Check — Backend</span>
          <button
            className={styles.btn}
            onClick={checkHealth}
            disabled={healthStatus === 'loading'}
          >
            {healthStatus === 'loading' ? (
              <>
                <span className={styles.spinner} />
                {' Verificando...'}
              </>
            ) : (
              'Verificar backend'
            )}
          </button>
        </div>

        {healthStatus === 'idle' && (
          <div className={`${styles.result} ${styles.resultIdle}`}>
            Presiona el boton para verificar la conexion con el backend.
          </div>
        )}

        {healthStatus === 'ok' && healthData && (
          <div className={`${styles.result} ${styles.resultOk}`}>
            <div>
              <span className={`${styles.statusDot} ${styles.dotOk}`} />
              <strong className={styles.statusOk}>Backend conectado</strong>
            </div>
            <div className={styles.resultGrid}>
              <div className={styles.resultItem}>
                <span>Estado</span>
                <span>{healthData.status}</span>
              </div>
              <div className={styles.resultItem}>
                <span>Uptime</span>
                <span>{formatUptime(healthData.uptime)}</span>
              </div>
              <div className={styles.resultItem}>
                <span>Timestamp</span>
                <span>{new Date(healthData.timestamp).toLocaleTimeString('es-CO')}</span>
              </div>
            </div>
          </div>
        )}

        {healthStatus === 'error' && (
          <div className={`${styles.result} ${styles.resultError}`}>
            <div>
              <span className={`${styles.statusDot} ${styles.dotError}`} />
              <strong className={styles.statusError}>Error de conexion</strong>
            </div>
            <div className={styles.errorMsg}>{errorMsg}</div>
          </div>
        )}
      </div>

      <p className={styles.footer}>OCI DevOps Lab · Next.js + NestJS</p>
    </div>
  );
}
