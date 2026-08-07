import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RegistersModule } from './modules/register/register.module';

@Module({
  imports: [ 
    ConfigModule.forRoot(),
    DatabaseModule,
    AuthModule,
    UsersModule,
    RegistersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
