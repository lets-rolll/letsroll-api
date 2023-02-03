import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
        envFilePath: '.env'
    }),
    MongooseModule.forRoot(process.env.MONGO_URL),
    UserModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
