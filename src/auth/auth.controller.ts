import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ZodPipe } from 'src/zod/zod.pipe';
import { RegisterDto, RegisterSchema } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body(new ZodPipe(RegisterSchema)) body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post('login')
  async login(@Body(new ZodPipe(RegisterSchema)) body: RegisterDto) {
    return this.authService.login(body);
  }
}
