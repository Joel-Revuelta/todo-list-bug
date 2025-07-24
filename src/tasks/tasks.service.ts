import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from '../entities/task.entity';
import { Repository } from 'typeorm';
import { UserPayloadDto } from 'src/auth/dto/user-payload.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private readonly tasksRepository: Repository<Task>,
    ) {}

    async createTask(body: CreateTaskDto, user: UserPayloadDto) {
        const task = this.tasksRepository.create({
            ...body,
            owner: { id: user.id },
        });
        return this.tasksRepository.save(task);
    }

    async listTasks(user: UserPayloadDto) {
        console.log('Listing tasks for user:', user);
        const tasks = await this.tasksRepository.find({
            where: { owner: { id: user.id } },
        });

        return tasks;
    }

    async getTask(id: string, user: UserPayloadDto) {
        const task = await this.tasksRepository
            .createQueryBuilder('task')
            .where(`task.id = :id`, { id })
            .andWhere(`task.owner.id = :ownerId`, { ownerId: user.id })
            .getOne();

        if (!task) {
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
        const result = await this.tasksRepository.update(
            { id, owner: { id: user.id } },
            updateTaskDto,
        );

        if (result.affected === 0) {
            throw new NotFoundException(
                `Task with id ${id} not found for user ${user.id}`,
            );
        }

        return this.getTask(id, user);
    }
}
