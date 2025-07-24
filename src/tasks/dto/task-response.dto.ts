import { ApiProperty } from '@nestjs/swagger';

export class TaskResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    title: string;

    @ApiProperty()
    description: string;

    @ApiProperty()
    done: boolean;

    @ApiProperty()
    dueDate: Date;
}
