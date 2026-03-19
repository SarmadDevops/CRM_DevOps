import { Module } from '@nestjs/common';
import { CentrifugoService } from './centrifugo.service';
import { CentrifugoController } from './centrifugo.controller';

@Module({
  controllers: [CentrifugoController],
  providers: [CentrifugoService],
  exports: [CentrifugoService],
})
export class CentrifugoModule {}