import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signIn.dto';

describe('AuthService', () => {
  let service: AuthService;
  
  const mockUserModel = {
    id: 'some user id',
    firstName: "Юзеров",
    lastName: "Юзер",
    middleName: "Экзамплович",
    email: "user123@example.com",
    password: "password",
    phoneNumber: "79534331282",
    emailConfirmed: true
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [        
        ConfigModule.forRoot({
          envFilePath: '.env'
        }),
      ],
      providers: [
        AuthService,
          {
            provide: 'UserModel',
            useValue: {
              findOne: async (value: any) => mockUserModel,
              findById: async (value: any) => mockUserModel
            }
          }
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => { 
    expect(service).toBeDefined();
  });

  describe("signIn", () => {
    it("signIn", async () => {
      const dto: SignInDto = {        
        email: 'user123@example.com',
        password: 'example123',
        rememberMe: true
      };

      expect(await service.signIn(dto)).toEqual({
        userId: expect.any(String),
        access_token: expect.any(String),
        expires: expect.any(Number),
        refresh_token: expect.any(String),
        refresh_token_expires: expect.any(Number)
      });
    });
  });

  describe("updateRefreshToken", () => {
    it("updateRefreshToken", async () => {
      const token: string = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJzb21lIHVzZXIgaWQiLCJ0eXBlIjoicmVmcmVzaF90b2tlbiIsImlhdCI6MTY3NjEzMjY5NCwiZXhwIjoxNjc4NzI0Njk0fQ.YXmUHH_U-mZdk4Y4XqJ1VeEhEgSrpQBPJVM8FT-Djyk";
      
      expect(await service.updateRefreshToken(token)).toEqual({
        access_token: expect.any(String),
        expires: expect.any(Number),
        refresh_token: expect.any(String),
        refresh_token_expires: expect.any(Number)
      });
    });
  });
});
