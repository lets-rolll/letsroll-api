import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { RoomModule } from './room/room.module';
import { MessageModule } from './message/message.module';
import { MessageGatewayModule } from './gateways/message-gateway/message.gateway.module';
import { RoomGatewayModule } from './gateways/room-gateway/room.gateway.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
        rootPath: join(__dirname, '..', 'storage/'),
        exclude: ['/api*', '/join']
    }),
    AuthModule,
    ConfigModule.forRoot({
        envFilePath: '.env',
    }),
    MongooseModule.forRoot(process.env.MONGO_URL),
    UserModule,
    RoomModule,
    RoomGatewayModule,
    MessageModule,
    MessageGatewayModule,
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: `smtps://${process.env.SMTP_USERNAME}:${process.env.SMTP_PASSWORD}@${process.env.SMTP_HOST}`,
        defaults: {
          from: `"Lets Roll" <${process.env.SMTP_USERNAME}>`,
        },
        template: {
          dir: __dirname + '/templates',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
