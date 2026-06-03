import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  // Mock the Authentication service
  const mockAuthService = {
    login: jest.fn(),
    refresh: jest.fn(),
  };

  // Mock the Prisma service
  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call authService.login and return token', async () => {
      const mockResult = { access_token: 'token', refresh_token: 'refresh' };
      mockAuthService.login.mockResolvedValue(mockResult);

      const loginDto = { email: 'test@test.com', password: 'password123' };
      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith('test@test.com', 'password123');
      expect(result).toEqual(mockResult);
    });
  });
});
