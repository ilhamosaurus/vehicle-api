import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private config: ConfigService,
    private jwt: JwtService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles || roles.length === 0) {
      return true;
    }
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.headers.authorization.split(' ')[1];

    const secret = this.config.get<string>('SECRET');
    const payload = this.jwt.verify(token, {
      secret,
    });

    const userRole = payload.admin ? 'admin' : 'user';

    return roles.some((role) => userRole.includes(role));
  }
}
