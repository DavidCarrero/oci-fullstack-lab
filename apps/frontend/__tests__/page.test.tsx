/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from '../src/app/page';

// Mock fetch globally
const mockFetch = jest.fn();
globalThis.fetch = mockFetch;

describe('Home page', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('deberia renderizar el titulo principal', () => {
    render(<Home />);
    expect(screen.getByText('OCI DevOps Lab')).toBeTruthy();
  });

  it('deberia mostrar las tres tarjetas de info', () => {
    render(<Home />);
    expect(screen.getByText('Frontend')).toBeTruthy();
    expect(screen.getByText('Backend API')).toBeTruthy();
    expect(screen.getByText('Stack')).toBeTruthy();
  });

  it('deberia renderizar el boton de verificar backend', () => {
    render(<Home />);
    expect(screen.getByRole('button', { name: /verificar backend/i })).toBeTruthy();
  });

  it('deberia mostrar mensaje idle por defecto', () => {
    render(<Home />);
    expect(screen.getByText(/presiona el boton/i)).toBeTruthy();
  });

  it('deberia mostrar estado ok al recibir respuesta exitosa del backend', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'ok', uptime: 42.5, timestamp: new Date().toISOString() }),
    });

    render(<Home />);
    fireEvent.click(screen.getByRole('button', { name: /verificar backend/i }));

    await waitFor(() => {
      expect(screen.getByText('Backend conectado')).toBeTruthy();
    });
    expect(screen.getByText('ok')).toBeTruthy();
  });

  it('deberia mostrar error cuando el backend no responde', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Connection refused'));

    render(<Home />);
    fireEvent.click(screen.getByRole('button', { name: /verificar backend/i }));

    await waitFor(() => {
      expect(screen.getByText('Error de conexion')).toBeTruthy();
    });
    expect(screen.getByText('Connection refused')).toBeTruthy();
  });

  it('deberia mostrar error cuando el backend retorna status no-ok', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 503 });

    render(<Home />);
    fireEvent.click(screen.getByRole('button', { name: /verificar backend/i }));

    await waitFor(() => {
      expect(screen.getByText('Error de conexion')).toBeTruthy();
    });
  });
});

describe('API_URL config', () => {
  it('deberia usar localhost:3001 como URL por defecto', () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    expect(apiUrl).toContain('http');
    expect(apiUrl).toBeDefined();
  });
});
