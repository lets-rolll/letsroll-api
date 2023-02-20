import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  const mockUserModel = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [        
        ConfigModule.forRoot({
          envFilePath: '.env'
        }),
      ],
      providers: [
        UserService,
          {
            provide: 'UserModel',
            useValue: {
              findOne: async (value: any) => mockUserModel,
              findById: async (value: any) => mockUserModel
            }
          }
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  
});
