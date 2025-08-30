import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { SessionsService } from '../application/sessions.service';
import { CheckInDto } from '../application/dto/check-in.dto';
import { SessionDto } from '../application/dto/session.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post('check-in')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Inicia uma nova sessão para um cliente (check-in).',
  })
  @ApiResponse({
    status: 201,
    description: 'Sessão iniciada com sucesso.',
    type: SessionDto,
  })
  @ApiResponse({ status: 400, description: 'Dados da requisição inválidos.' })
  @ApiResponse({
    status: 409,
    description: 'Cliente já possui uma sessão ativa.',
  })
  async checkIn(@Body() checkInDto: CheckInDto): Promise<SessionDto> {
    const session = await this.sessionsService.checkIn(checkInDto.customerId);
    return this.mapToDto(session);
  }

  @Post('check-out')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Finaliza a sessão ativa de um cliente (check-out).',
  })
  @ApiResponse({
    status: 200,
    description: 'Sessão finalizada com sucesso.',
    type: SessionDto,
  })
  @ApiResponse({ status: 400, description: 'Dados da requisição inválidos.' })
  @ApiResponse({
    status: 404,
    description: 'Nenhuma sessão ativa encontrada para o cliente.',
  })
  async checkOut(@Body() checkInDto: CheckInDto): Promise<SessionDto> {
    const session = await this.sessionsService.checkOut(checkInDto.customerId);
    return this.mapToDto(session);
  }

  private mapToDto(session: any): SessionDto {
    return {
      id: session.id,
      customerId: session.customerId,
      checkInTime: session.checkInTime,
      checkOutTime: session.checkOutTime,
      status: session.status,
      totalCost: session.totalCost,
    };
  }
}
