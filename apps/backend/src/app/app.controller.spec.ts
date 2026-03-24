import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let controller: AppController;
  let _service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    controller = module.get<AppController>(AppController);
    _service = module.get<AppService>(AppService);
  });

  it('deberia estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('deberia retornar info del proyecto', () => {
    const result = controller.getInfo();
    expect(result).toHaveProperty('name', 'oci-devops-lab');
    expect(result).toHaveProperty('version', '1.0.0');
    expect(result).toHaveProperty('environment');
    expect(result).toHaveProperty('timestamp');
  });
});
