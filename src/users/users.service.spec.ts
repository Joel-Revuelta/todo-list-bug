import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { ConflictException } from '@nestjs/common';

describe('UsersService', () => {
    let service: UsersService;
    let usersRepository: Repository<User>;

    const mockUser = {
        id: '1',
        email: 'test@example.com',
        fullname: 'Test User',
        pass: 'password',
    };

    const mockUsersRepository = {
        findOneBy: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUsersRepository,
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        usersRepository = module.get<Repository<User>>(
            getRepositoryToken(User),
        );
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create and return a user', async () => {
            const createUserDto = {
                email: 'test@example.com',
                fullname: 'Test User',
                password: 'password',
            };
            mockUsersRepository.findOneBy.mockResolvedValue(null);
            mockUsersRepository.create.mockReturnValue(mockUser);
            mockUsersRepository.save.mockResolvedValue(mockUser);

            const { pass, ...expectedResult } = mockUser;

            const result = await service.create(createUserDto);
            expect(result).toEqual(expectedResult);
            expect(usersRepository.create).toHaveBeenCalledWith({
                email: createUserDto.email,
                fullname: createUserDto.fullname,
                pass: createUserDto.password,
            });
            expect(usersRepository.save).toHaveBeenCalledWith(mockUser);
        });

        it('should throw ConflictException if user already exists', async () => {
            const createUserDto = {
                email: 'test@example.com',
                fullname: 'Test User',
                password: 'password',
            };
            mockUsersRepository.findOneBy.mockResolvedValue(mockUser);

            await expect(service.create(createUserDto)).rejects.toThrow(
                ConflictException,
            );
        });
    });

    describe('findOne', () => {
        it('should return a user if found', async () => {
            mockUsersRepository.findOneBy.mockResolvedValue(mockUser);

            const result = await service.findOne('test@example.com');
            expect(result).toEqual(mockUser);
            expect(usersRepository.findOneBy).toHaveBeenCalledWith({
                email: 'test@example.com',
            });
        });

        it('should return null if user not found', async () => {
            mockUsersRepository.findOneBy.mockResolvedValue(null);

            const result = await service.findOne('test@example.com');
            expect(result).toBeNull();
        });
    });
});
