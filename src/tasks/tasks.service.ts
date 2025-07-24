import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from '../entities/task.entity';
import { Repository } from 'typeorm';
import { UserPayloadDto } from 'src/auth/dto/user-payload.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
    private readonly logger = new Logger(TasksService.name);

    constructor(
        @InjectRepository(Task)
        private readonly tasksRepository: Repository<Task>,
    ) {}

    async createTask(body: CreateTaskDto, user: UserPayloadDto) {
        this.logger.log(`Creating task for user ${user.email}`);

        const task = this.tasksRepository.create({
            ...body,
            owner: { id: user.id },
        });
        return this.tasksRepository.save(task);
    }

    async listTasks(user: UserPayloadDto) {
        this.logger.log(`Listing tasks for user ${user.email}`);
        const tasks = await this.tasksRepository.find({
            where: { owner: { id: user.id } },
        });

        return tasks;
    }

    async getTask(id: string, user: UserPayloadDto) {
        this.logger.log(`Retrieving task with id ${id} for user ${user.email}`);

        const task = await this.tasksRepository
            .createQueryBuilder('task')
            .where(`task.id = :id`, { id })
            .andWhere(`task.owner.id = :ownerId`, { ownerId: user.id })
            .getOne();

        if (!task) {
            this.logger.warn(
                `Task with id ${id} not found for user ${user.email}`,
            );
            throw new NotFoundException(
                `Task with id ${id} not found for user ${user.id}`,
            );
        }

        return task;
    }

    async editTask(
        id: string,
        updateTaskDto: UpdateTaskDto,
        user: UserPayloadDto,
    ) {
        this.logger.log(`Updating task with id ${id} for user ${user.email}`);

        const result = await this.tasksRepository.update(
            { id, owner: { id: user.id } },
            updateTaskDto,
        );

        if (result.affected === 0) {
            this.logger.warn(
                `Task with id ${id} not found for user ${user.email}`,
            );
            throw new NotFoundException(
                `Task with id ${id} not found for user ${user.id}`,
            );
        }

        return this.getTask(id, user);
    }
}
