import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private jwt: JwtService,
  ) {}

  async getUsers(offset?: number, limit?: number) {
    try {
      const skip = offset ? offset - 1 : 0;
      const take = limit ? limit : 10;

      const [users, total] = await this.prisma.$transaction([
        this.prisma.user.findMany({
          skip: skip * take,
          take: take,
          orderBy: {
            createdAt: 'desc',
          },
        }),
        this.prisma.user.count({}),
      ]);

      if (!users || users.length === 0) {
        return null;
      }

      return {
        total,
        data: users,
        page: offset ? offset : 1,
        limit: take < total ? take : total,
      };
    } catch (error) {
      console.error(error);
      throw new Error(`Failed to get all users data: ${error}`);
    }
  }

  async getUserById(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          isAdmin: true,
        },
      });

      if (!user) {
        return null;
      }

      return user;
    } catch (error) {
      console.error(error);
      throw new Error(`Failed to get user data: ${error}`);
    }
  }

  /**
   * Retrieves a user by their name.
   * @param name The name of the user.
   * @returns The user object if found, otherwise null.
   * @throws {Error} If there is an error retrieving the user data.
   */
  async getUserByName(name: string): Promise<User | null> {
    try {
      const user: User | null = await this.prisma.user.findUnique({
        where: { name },
      });

      return user;
    } catch (error) {
      console.error(error);
      throw new Error(`Failed to get user data: ${error}`);
    }
  }

  async register(dto: RegisterDto) {
    const { name, password } = dto;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      await this.prisma.user.create({
        data: {
          name,
          password: hashedPassword,
          isAdmin: false,
        },
      });

      return { message: 'Registered successfully, please login!' };
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ForbiddenException('User already exists');
      }
      console.error(error);
      throw new InternalServerErrorException(
        `Failed to register user: ${error}`,
      );
    }
  }

  async login(dto: RegisterDto) {
    const { name, password } = dto;
    const user = await this.getUserByName(name);
    if (!user) {
      throw new UnauthorizedException('Invalid Credentials');
    }
    const passwordMatched = await bcrypt.compare(password, user.password);

    if (!passwordMatched) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    const token = await this.generateToken(user.id, user.name, user.isAdmin);
    return { access_token: token };
  }

  async generateToken(userId: string, name: string, isAdmin: boolean) {
    const payload = {
      sub: userId,
      name,
      admin: isAdmin,
    };

    const secret = this.config.get<string>('SECRET');
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '3h',
      secret,
      algorithm: 'HS256',
    });

    return token;
  }
}
