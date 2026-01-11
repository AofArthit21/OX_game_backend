import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { Game } from './game.entity';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Game]), UserModule, AuthModule],
  controllers: [GameController],
  providers: [GameService],
  exports: [GameService],
})
export class GameModule {}
