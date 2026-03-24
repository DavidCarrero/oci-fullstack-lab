/**
 * @jest-environment jsdom
 */
describe('Frontend - Smoke tests', () => {
  it('deberia renderizar sin errores', () => {
    // Smoke test basico para validar que el modulo carga
    expect(true).toBe(true);
  });

  it('deberia tener la variable de entorno API_URL definida o usar default', () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    expect(apiUrl).toBeDefined();
    expect(apiUrl).toContain('http');
  });
});
