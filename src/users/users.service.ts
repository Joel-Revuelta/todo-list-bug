import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) {}

    async create(body: CreateUserDto) {
        const existingUser = await this.findOne(body.email);
        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        const user = this.usersRepository.create({
            email: body.email,
            fullname: body.fullname,
            pass: body.password,
        });

        const savedUser = await this.usersRepository.save(user);

        const { pass, ...result } = savedUser;

        return result;
    }

    async findOne(email: string) {
        const user = await this.usersRepository.findOneBy({
            email,
        });

        return user;
    }
}
