import { Test, TestingModule } from '@nestjs/testing';
import { PermissionCacheService } from './permission-cache.service';

describe('PermissionCacheService', () => {
  let service: PermissionCacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PermissionCacheService],
    }).compile();

    service = module.get<PermissionCacheService>(PermissionCacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
