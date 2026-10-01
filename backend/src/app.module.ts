import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RegistersModule } from './modules/register/register.module';
import { MenuModule } from './modules/menu/menu.module';

@Module({
  imports: [ 
    ConfigModule.forRoot({
        isGlobal:true,
        cache:true,
      }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    RegistersModule,
    MenuModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
