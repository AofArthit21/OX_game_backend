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
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      ssl:
        process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
      entities: [User, Game],
      synchronize: process.env.TYPEORM_SYNCHRONIZE !== 'false',
    }),

    UserModule,
    AuthModule,
    GameModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}