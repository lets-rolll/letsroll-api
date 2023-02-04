import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtManager } from 'src/auth/jwt/jwt.manager';
import { User, UserSchema } from './schemas/user.schema';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({    
    imports: [
        MongooseModule.forFeature([
          { name: User.name, schema: UserSchema}])
    ],
    controllers: [UserController],
    providers: [UserService, JwtManager]
  })
export class UserModule {}
