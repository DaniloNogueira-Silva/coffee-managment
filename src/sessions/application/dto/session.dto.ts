import { ApiProperty } from '@nestjs/swagger';
import { SessionStatus } from '../../domain/session.entity';

export class SessionDto {
  @ApiProperty({
    description: 'O ID único da sessão no formato UUID v4.',
    example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
  })
  id: string;

  @ApiProperty({
    description: 'O ID do cliente associado à sessão.',
    example: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
  })
  customerId: string;

  @ApiProperty({
    description: 'A data e hora em que o check-in foi realizado.',
    example: '2025-08-30T20:00:00.000Z',
  })
  checkInTime: Date;

  @ApiProperty({
    description: 'A data e hora em que o check-out foi realizado (nulo se a sessão estiver ativa).',
    example: '2025-08-30T22:30:00.000Z',
    required: false
  })
  checkOutTime?: Date;

  @ApiProperty({
    description: 'O status atual da sessão.',
    enum: SessionStatus, 
    example: SessionStatus.COMPLETED,
  })
  status: SessionStatus;

  @ApiProperty({
    description: 'O custo total calculado para a sessão após o check-out.',
    example: 37.5,
    required: false,
  })
  totalCost?: number;
}