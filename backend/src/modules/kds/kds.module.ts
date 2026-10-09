import { Module } from '@nestjs/common';
import { KdsController } from './kds.controller';
import { KdsService } from './kds.service';
import { KdsRepository } from './kds.repository';

@Module({
  controllers: [KdsController],
  providers: [KdsService, KdsRepository],
  exports: [KdsService, KdsRepository],
})
export class KdsModule {}
