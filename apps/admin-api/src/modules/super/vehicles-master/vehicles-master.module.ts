import { Module } from '@nestjs/common';
import { VehiclesMasterController } from './vehicles-master.controller';
import { VehiclesMasterService } from './vehicles-master.service';

@Module({
  controllers: [VehiclesMasterController],
  providers: [VehiclesMasterService],
  exports: [VehiclesMasterService],
})
export class VehiclesMasterModule {}
