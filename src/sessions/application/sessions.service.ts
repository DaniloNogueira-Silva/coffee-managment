import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { ISessionRepository } from '../domain/session.repository';
import { Session, SessionStatus } from '../domain/session.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class SessionsService {
  private readonly COST_PER_HOUR = 2.0;

  constructor(
    @Inject(ISessionRepository)
    private readonly sessionRepository: ISessionRepository,
  ) {}

  async checkIn(customerId: string): Promise<Session> {
    const existingSession = await this.sessionRepository.findActiveBycustomerId(customerId);
    if (existingSession) {
      throw new ConflictException('User already has an active session.');
    }

    const newSession: Session = {
      id: randomUUID(),
      customerId,
      checkInTime: new Date(),
      status: SessionStatus.ACTIVE,
    };

    return this.sessionRepository.save(newSession);
  }

  async checkOut(customerId: string): Promise<Session> {
    const activeSession = await this.sessionRepository.findActiveBycustomerId(customerId);
    if (!activeSession) {
      throw new NotFoundException('No active session found for this customer.');
    }

    const checkOutTime = new Date();
    const durationInMs = checkOutTime.getTime() - activeSession.checkInTime.getTime();
    const durationInHours = durationInMs / (1000 * 60 * 60);

    activeSession.checkOutTime = checkOutTime;
    activeSession.totalCost = this.calculateCost(durationInHours);
    activeSession.status = SessionStatus.COMPLETED;

    return this.sessionRepository.save(activeSession);
  }
  
  private calculateCost(hours: number): number {
    const cost = hours * this.COST_PER_HOUR;
    return parseFloat(cost.toFixed(2));
  }
}