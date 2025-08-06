import { Test, TestingModule } from '@nestjs/testing';
import { RecentActivityController } from './recent-activity.controller';

describe('RecentActivityController', () => {
  let controller: RecentActivityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecentActivityController],
    }).compile();

    controller = module.get<RecentActivityController>(RecentActivityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
