import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Request,
    UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UserPayloadDto } from 'src/auth/dto/user-payload.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller('tasks')
@UseGuards(AuthGuard)
@ApiBearerAuth('access-token')
export class TasksController {
    constructor(private readonly tasksService: TasksService) {}

    @Post('')
    async createTask(
        @Request() req: { user: UserPayloadDto },
        @Body() createTaskDto: CreateTaskDto,
    ) {
        return this.tasksService.createTask(createTaskDto, req.user);
    }

    @Get('')
    async listTasks(@Request() req: { user: UserPayloadDto }) {
        console.log('Listing tasks for user:', req.user);
        return this.tasksService.listTasks(req.user);
    }

    @Get('/:id')
    async getTask(
        @Request() req: { user: UserPayloadDto },
        @Param('id') id: string,
    ) {
        return this.tasksService.getTask(id, req.user);
    }

    @Patch('/:id')
    async editTask(
        @Param('id') id: string,
        @Request() req: { user: UserPayloadDto },
        @Body() updateTaskDto: UpdateTaskDto,
    ) {
        return this.tasksService.editTask(id, updateTaskDto, req.user);
    }
}
