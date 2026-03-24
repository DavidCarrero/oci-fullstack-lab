import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(() => {
    service = new AppService();
  });

  it('deberia estar definido', () => {
    expect(service).toBeDefined();
  });

  it('deberia retornar el nombre correcto del proyecto', () => {
    const result = service.getInfo();
    expect(result.name).toBe('oci-devops-lab');
  });

  it('deberia retornar version 1.0.0', () => {
    const result = service.getInfo();
    expect(result.version).toBe('1.0.0');
  });

  it('deberia retornar un campo environment', () => {
    const result = service.getInfo();
    expect(result.environment).toBeDefined();
    expect(typeof result.environment).toBe('string');
  });

  it('deberia retornar un timestamp en formato ISO', () => {
    const result = service.getInfo();
    expect(result.timestamp).toBeDefined();
    expect(() => new Date(result.timestamp)).not.toThrow();
    expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
  });

  it('deberia retornar timestamps distintos en llamadas separadas', async () => {
    const first = service.getInfo();
    await new Promise((r) => setTimeout(r, 5));
    const second = service.getInfo();
    expect(first.timestamp).not.toBe(second.timestamp);
  });
});
