import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { JwtGuard } from 'src/auth/guard';
import { Role } from 'src/decorator';
import { ZodPipe } from 'src/zod/zod.pipe';
import { CreateVehicleDto, CreateVehicleSchema } from './dto';
import { Response } from 'express';

@UseGuards(JwtGuard)
@Controller('/')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Role(['admin'])
  @Post('create')
  async createVehicle(
    @Body(new ZodPipe(CreateVehicleSchema)) data: CreateVehicleDto,
  ) {
    return this.vehicleService.createVehicle(data);
  }

  @Get('pricelist')
  async getPriceByCode(@Query('code') code: string, @Res() res: Response) {
    const response = await this.vehicleService.getPriceByCode(code);

    if (!response) {
      res.status(404).json({ message: 'Price not found' });
    }

    res.status(200).json(response);
  }
}
