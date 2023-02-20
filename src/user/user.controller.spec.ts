import { Test, TestingModule } from '@nestjs/testing';
import { createRequest } from 'node-mocks-http';
import { UpdateLocationDto } from './dto/updateLocation.dto';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { DetailsViewModel } from './viewModel/details.viewModel';

const req = createRequest({protocol: "http"});

describe('UserController', () => {
  let controller: UserController;
  
  const mockUserService = {
    getDetails: jest.fn(async (userId: string, hostUrl: string): Promise<DetailsViewModel> => {
      return {
        id: "123",
        firstName: "Юзер",
        lastName: "Юзеров",
        middleName: "Экзамплович",
        email: "user123@example.com"
      };
    }),
    getUsers: jest.fn(async (host: string) => {
      return [
        {
          id: "123",
          firstName: "Юзер",
          lastName: "Юзеров",
          middleName: "Экзамплович"
        }
      ];
    }),
    updateLocation: jest.fn(async (dto: UpdateLocationDto) => {}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService]
    }).overrideProvider(UserService).useValue(mockUserService).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getDetails', () => {
    it('должен возвращать DetailsViewModel', async () => {
      const userId = "123";

      expect(await controller.getDetails(userId, req)).toEqual({
        id: expect.any(String),
        firstName: expect.any(String),
        lastName: expect.any(String),
        middleName: expect.any(String),
        email: expect.any(String)
      })
    });
  });

  describe('getUsers', () => {
    it('должен возвращать UserViewModel[]', async () => {
      expect(await controller.getUsers(req)).toEqual([{
        id: expect.any(String),
        firstName: expect.any(String),
        lastName: expect.any(String),
        middleName: expect.any(String),
      }]);
    });
  });

  it('should be defined', async () => {
    const dto: UpdateLocationDto = {
      userId: "123",
      departure: "ua",
      destination: "kz"
    };
    expect(await controller.updateLocation(dto));
  });
});
