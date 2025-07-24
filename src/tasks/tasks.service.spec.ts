import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from '../entities/task.entity';
import { Repository } from 'typeorm';
import { UserPayloadDto } from 'src/auth/dto/user-payload.dto';
import { NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';

describe('TasksService', () => {
    let service: TasksService;
    let tasksRepository: Repository<Task>;

    const mockUser: UserPayloadDto = {
        id: '1',
        email: 'test@example.com',
    };

    const mockTask = {
        id: '1',
        title: 'Test Task',
        description: 'Test Description',
        owner: { id: mockUser.id },
        done: false,
        dueDate: new Date(),
    };

    const mockTasksRepository = {
        find: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
        createQueryBuilder: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            getOne: jest.fn().mockResolvedValue(mockTask),
        }),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TasksService,
                {
                    provide: getRepositoryToken(Task),
                    useValue: mockTasksRepository,
                },
            ],
        }).compile();

        service = module.get<TasksService>(TasksService);
        tasksRepository = module.get<Repository<Task>>(
            getRepositoryToken(Task),
        );
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createTask', () => {
        it('should create and return a task', async () => {
            const createTaskDto: CreateTaskDto = {
                title: 'New Task',
                description: 'New Description',
                done: false,
                dueDate: new Date(),
            };
            mockTasksRepository.create.mockReturnValue(mockTask);
            mockTasksRepository.save.mockResolvedValue(mockTask);

            const result = await service.createTask(createTaskDto, mockUser);
            expect(result).toEqual(mockTask);
            expect(tasksRepository.create).toHaveBeenCalledWith({
                ...createTaskDto,
                owner: { id: mockUser.id },
            });
            expect(tasksRepository.save).toHaveBeenCalledWith(mockTask);
        });
    });

    describe('listTasks', () => {
        it('should return an array of tasks for the given user', async () => {
            const tasks = [mockTask];
            mockTasksRepository.find.mockResolvedValue(tasks);

            const result = await service.listTasks(mockUser);
            expect(result).toEqual(tasks);
            expect(tasksRepository.find).toHaveBeenCalledWith({
                where: { owner: { id: mockUser.id } },
            });
        });

        it('should return an empty array if no tasks are found for the given user', async () => {
            mockTasksRepository.find.mockResolvedValue([]);

            const result = await service.listTasks(mockUser);
            expect(result).toEqual([]);
        });
    });

    describe('getTask', () => {
        it('should return a task if found', async () => {
            mockTasksRepository
                .createQueryBuilder()
                .getOne.mockResolvedValue(mockTask);

            const result = await service.getTask(mockTask.id, mockUser);
            expect(result).toEqual(mockTask);
        });

        it('should throw NotFoundException if task not found', async () => {
            mockTasksRepository
                .createQueryBuilder()
                .getOne.mockResolvedValue(null);

            await expect(
                service.getTask(mockTask.id, mockUser),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('editTask', () => {
        it('should update and return a task', async () => {
            const updateTaskDto = { title: 'Updated Task' };
            const updatedTask = { ...mockTask, ...updateTaskDto };

            mockTasksRepository.update.mockResolvedValue({ affected: 1 });
            jest.spyOn(service, 'getTask').mockResolvedValue(
                updatedTask as any,
            );

            const result = await service.editTask(
                mockTask.id,
                updateTaskDto,
                mockUser,
            );
            expect(result).toEqual(updatedTask);
            expect(tasksRepository.update).toHaveBeenCalledWith(
                { id: mockTask.id, owner: { id: mockUser.id } },
                updateTaskDto,
            );
        });

        it('should throw NotFoundException if task to update is not found', async () => {
            const updateTaskDto = { title: 'Updated Task' };
            mockTasksRepository.update.mockResolvedValue({ affected: 0 });

            await expect(
                service.editTask(mockTask.id, updateTaskDto, mockUser),
            ).rejects.toThrow(NotFoundException);
        });
    });
});
