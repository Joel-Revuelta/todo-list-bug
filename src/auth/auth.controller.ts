import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { IsPublic } from './is-public.decorator';
import { AuthDto } from './dto/auth.dto';
import { AuthGuard } from './auth.guard';

@Controller('auth')
@UseGuards(AuthGuard)
export class AuthController {
    constructor(private authService: AuthService) {}

    @IsPublic()
    @HttpCode(HttpStatus.OK)
    @Post('login')
    signIn(@Body() authDto: AuthDto) {
        return this.authService.signIn(authDto.email, authDto.pass);
    }
}
