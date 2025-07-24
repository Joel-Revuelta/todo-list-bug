import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsOptional, IsString } from 'class-validator';

export class UpdateTaskDto {
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    title?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ required: false })
    @IsBoolean()
    @IsOptional()
    done?: boolean;

    @ApiProperty({ required: false })
    @Type(() => Date)
    @IsDate()
    @IsOptional()
    dueDate?: Date;
}
