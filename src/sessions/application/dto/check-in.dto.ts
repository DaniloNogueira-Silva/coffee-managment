import { IsNotEmpty, IsUUID } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CheckInDto {
  @ApiProperty({
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    description: 'ID do cliente no formato UUID v4.',
  })
  @IsUUID(4, { message: 'O campo customerId deve ser um UUID válido.' })
  @IsNotEmpty({ message: 'O campo customerId não pode estar vazio.' })
  customerId: string;
}