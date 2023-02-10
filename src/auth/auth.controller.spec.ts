import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/createUser.dto';
import { SignInDto } from './dto/signIn.dto';
import { SignInViewModel } from './viewModels/sign-in.viewModel';
import { UpdateRefreshTokenViewModel } from './viewModels/updateREfreshToken.viewModel';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    createUser: jest.fn(async (dto) => {
      return '63811fea9f3b19c1289326e2';
    }),

    signIn: jest.fn(async (dto) => {
      return {
        access_token: "token",
        userId: "id",
        expires: Date.now(),
        refresh_token: "r_token",
        refresh_token_expires: Date.now(),
      } as SignInViewModel
    }),

    updateRefreshToken: jest.fn(async (r_token: string) => {
      return {
        access_token: "new access token",
        expires: Date.now(),
        refresh_token: "new refresh token",
        refresh_token_expires: Date.now()
      } as UpdateRefreshTokenViewModel;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService]
      }).overrideProvider(AuthService).useValue(mockAuthService).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signUp', () => {
    it('должен возвращать userId', async () => {
      const dto: CreateUserDto = {
        email: 'user123@example.com',
        password: 'example123'
      };

      expect(await controller.signUp(dto).catch(e => {})).toEqual({
        userId: expect.any(String)
      });
    });
  });

  describe('signIn', () => {
    it('должен возвращать SignInViewModel', async () => {
      const dto: SignInDto = {
        email: 'user123@example.com',
        password: 'example123',
        rememberMe: false
      };

      expect(await controller.signIn(dto).catch(e => {})).toEqual({
        userId: expect.any(String),
        access_token: expect.any(String),
        expires: expect.any(Number),
        refresh_token: expect.any(String),
        refresh_token_expires: expect.any(Number),
      });
    });
  });

  describe("updateRefreshToken", () => {
    it('должен возвращать UpdateRefreshTokenViewModel', async () => {
      expect(await controller.updateRefreshToken("old refresh token").catch(e => {}))
        .toEqual({
          access_token: expect.any(String),
          expires: expect.any(Number),
          refresh_token: expect.any(String),
          refresh_token_expires: expect.any(Number),
        });
    });
  });
});
