import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { GameModule } from './game/game.module';
import { User } from './user/user.entity';
import { Game } from './game/game.entity';

@Module({
  imports: [
    // ตั้งค่า ConfigModule ก่อนใครเพื่อน เพื่อโหลด .env
    ConfigModule.forRoot({ isGlobal: true }),

    // ตั้งค่า TypeORM การเชื่อมต่อหลัก
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [User, Game],
      synchronize: true,
    }),

    UserModule,
    AuthModule,
    GameModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
