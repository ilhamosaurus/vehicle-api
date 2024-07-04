import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { JwtGuard } from 'src/auth/guard';
import { Role } from 'src/decorator';
import { ZodPipe } from 'src/zod/zod.pipe';
import {
  CreateVehicleDto,
  CreateVehicleSchema,
  GetPriceDto,
  UpdateBrandDto,
  UpdateBrandSchema,
  UpdateModelDto,
  UpdateModelSchema,
  UpdatePriceDto,
  UpdatePriceSchema,
  UpdateTypeDto,
  UpdateTypeSchema,
} from './dto';
import { Response } from 'express';

@UseGuards(JwtGuard)
@Controller('/vehicle')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Post('create')
  @Role(['admin'])
  async createVehicle(
    @Body(new ZodPipe(CreateVehicleSchema)) data: CreateVehicleDto,
  ) {
    return this.vehicleService.createVehicle(data);
  }

  @Get('pricelist')
  async getAllPricelists(@Res() res: Response, @Query() filter?: GetPriceDto) {
    try {
      if (
        !filter ||
        Object.keys(filter).length === 0 ||
        (filter.pageSize &&
          filter.pageNumber &&
          !filter.code &&
          !filter.year &&
          !filter.model)
      ) {
        const data = await this.vehicleService.getAllPricelists(
          filter.pageNumber,
          filter.pageSize,
        );

        return res.status(200).json(data);
      }

      const response = filter.code
        ? await this.vehicleService.getPriceByCode(filter.code)
        : await this.vehicleService.getPriceByFilter(filter);

      return res.status(200).json(response);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(error);
      throw new InternalServerErrorException(
        `Failed to get pricelists: ${error}`,
      );
    }
  }

  @Get(':code')
  async getVehicleDetail(@Param('code') code: string, @Res() res: Response) {
    try {
      const data = await this.vehicleService.getVehicleDetail(code);

      res.status(200).json(data);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(error);
      throw new InternalServerErrorException(
        `Failed to get vehicle detail: ${error}`,
      );
    }
  }

  @Patch('price/:code')
  @Role(['admin'])
  async updateVehiclePrice(
    @Param('code') code: string,
    @Body(new ZodPipe(UpdatePriceSchema)) dto: UpdatePriceDto,
  ) {
    return this.vehicleService.updateVehiclePrice(code, dto);
  }

  @Patch('brand/:id')
  @Role(['admin'])
  async updateVehicleBrand(
    @Param('id') id: string,
    @Body(new ZodPipe(UpdateBrandSchema)) dto: UpdateBrandDto,
  ) {
    return this.vehicleService.updateBrand(id, dto);
  }

  @Patch('model/:id')
  @Role(['admin'])
  async updateVehicleModel(
    @Param('id') id: string,
    @Body(new ZodPipe(UpdateModelSchema)) dto: UpdateModelDto,
  ) {
    return this.vehicleService.updateModel(id, dto);
  }

  @Patch('type/:id')
  @Role(['admin'])
  async updateVehicleType(
    @Param('id') id: string,
    @Body(new ZodPipe(UpdateTypeSchema)) dto: UpdateTypeDto,
  ) {
    return this.vehicleService.updateType(id, dto);
  }

  @Delete('price/:code')
  @Role(['admin'])
  async deleteVehiclePrice(@Param('code') code: string) {
    return this.vehicleService.deletePricelist(code);
  }
}
