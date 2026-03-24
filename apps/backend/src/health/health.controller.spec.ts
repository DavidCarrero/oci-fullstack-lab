import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('deberia estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('deberia retornar status ok', () => {
    const result = controller.check();
    expect(result).toHaveProperty('status', 'ok');
    expect(result).toHaveProperty('uptime');
    expect(result).toHaveProperty('timestamp');
  });

  it('deberia retornar un uptime numerico', () => {
    const result = controller.check();
    expect(typeof result.uptime).toBe('number');
    expect(result.uptime).toBeGreaterThan(0);
  });
});
