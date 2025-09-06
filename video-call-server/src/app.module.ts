import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SignalingGateway } from './gateway/signaling-gateway';

@Module({
  imports: [SignalingGateway],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
