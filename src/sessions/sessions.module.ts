import { ISessionRepository } from './domain/session.repository';
import { Module } from '@nestjs/common';
import { Session as SessionEntitySchema } from './infrastructure/typeorm/session.schema';
import { SessionTypeOrmRepository } from './infrastructure/session.typeorm.repository';
import { SessionsController } from './presentation/sessions.controller';
import { SessionsService } from './application/sessions.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([SessionEntitySchema])],
  controllers: [SessionsController],
  providers: [
    SessionsService,
    {
      provide: ISessionRepository,
      useClass: SessionTypeOrmRepository,
    },
  ],
})
export class SessionsModule {}