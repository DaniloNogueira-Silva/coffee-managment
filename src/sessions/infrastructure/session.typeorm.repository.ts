import { Injectable } from '@nestjs/common';
import { ISessionRepository } from '../domain/session.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Session as SessionEntitySchema } from './typeorm/session.schema';
import { Repository as TypeOrmRepository } from 'typeorm';
import { Session, SessionStatus } from '../domain/session.entity';

@Injectable()
export class SessionTypeOrmRepository implements ISessionRepository {
  constructor(
    @InjectRepository(SessionEntitySchema)
    private readonly ormRepository: TypeOrmRepository<Session>,
  ) {}

  async save(session: Session): Promise<Session> {
    const savedSession = await this.ormRepository.save(session);
    return savedSession;
  }

  async findActiveBycustomerId(customerId: string): Promise<Session | null> {
    const activeSession = await this.ormRepository.findOne({
      where: {
        customerId,
        status: SessionStatus.ACTIVE,
      },
    });
    return activeSession;
  }

  async findById(id: string): Promise<Session | null> {
    const session = await this.ormRepository.findOneBy({ id });
    return session;
  }
}
