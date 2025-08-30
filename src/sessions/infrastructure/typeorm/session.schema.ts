import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

import { SessionStatus } from '../../domain/session.entity';

@Entity({ name: 'sessions' })
export class Session {
  @PrimaryColumn('uuid')
  id: string;

  @Index()
  @Column('uuid')
  customerId: string;

  @Column({ type: 'timestamp with time zone' })
  checkInTime: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  checkOutTime: Date;

  @Column({
    type: 'enum',
    enum: SessionStatus,
    default: SessionStatus.ACTIVE,
  })
  status: SessionStatus;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  totalCost: number;
}