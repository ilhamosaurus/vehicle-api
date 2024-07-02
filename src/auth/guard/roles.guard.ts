import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  canActivate(context: ExecutionContext) {
    const requiredRoles = this.reflector.getAllAndOverride<string>('role', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const token = request.headers.autorization.split(' ')[1];

    type Payload = {
      sub: string;
      name: string;
      admin: boolean;
    };

    const secret = this.config.get<string>('SECRET');
    const payload: Payload = this.jwtService.verify(token, { secret });

    return requiredRoles.includes(payload.admin ? 'admin' : 'user');
  }
}
