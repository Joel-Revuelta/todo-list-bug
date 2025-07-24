import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsDate,
    IsNotEmpty,
    IsOptional,
    IsString,
} from 'class-validator';

export class CreateTaskDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({ required: false, default: false })
    @IsBoolean()
    @IsOptional()
    done: boolean;

    @ApiProperty()
    @Type(() => Date)
    @IsDate()
    @IsNotEmpty()
    dueDate: Date;
}
