import * as request from 'supertest';

import { INestApplication, ValidationPipe } from '@nestjs/common';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { Test, TestingModule } from '@nestjs/testing';

import { Repository } from 'typeorm';
import { Session as SessionSchema } from '../src/sessions/infrastructure/typeorm/session.schema';
import { SessionsModule } from '../src/sessions/sessions.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('SessionsController (e2e)', () => {
  let app: INestApplication;
  let sessionRepository: Repository<SessionSchema>;
  let postgresContainer: StartedPostgreSqlContainer;

  const customerId = 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22';

  beforeAll(async () => {
    postgresContainer = await new PostgreSqlContainer(
      'postgres:14-alpine',
    ).start();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        SessionsModule,
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: postgresContainer.getHost(),
          port: postgresContainer.getPort(),
          username: postgresContainer.getUsername(),
          password: postgresContainer.getPassword(),
          database: postgresContainer.getDatabase(),
          entities: [SessionSchema],
          synchronize: true,
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();

    sessionRepository = moduleFixture.get<Repository<SessionSchema>>(
      getRepositoryToken(SessionSchema),
    );
  }, 30000);

  beforeEach(async () => {
    await sessionRepository.clear();
  });

  afterAll(async () => {
    await postgresContainer.stop();
    await app.close();
  });

  it('should handle a full customer session lifecycle: /sessions/check-in (POST) -> /sessions/check-out (POST)', async () => {
    const checkInResponse = await request(app.getHttpServer())
      .post('/sessions/check-in')
      .send({ customerId })
      .expect(201);

    expect(checkInResponse.body.customerId).toEqual(customerId);
    expect(checkInResponse.body.status).toEqual('active');
    expect(checkInResponse.body.checkOutTime).toBeNull();

    const checkOutResponse = await request(app.getHttpServer())
      .post('/sessions/check-out')
      .send({ customerId })
      .expect(200);

    expect(checkOutResponse.body.customerId).toEqual(customerId);
    expect(checkOutResponse.body.status).toEqual('completed');
    expect(checkOutResponse.body.checkOutTime).toBeDefined();
    expect(checkOutResponse.body.totalCost).toBeDefined();
  });

  it('should return a 400 Bad Request for an invalid customerId on check-in', async () => {
    await request(app.getHttpServer())
      .post('/sessions/check-in')
      .send({ customerId: 'not-a-valid-uuid' })
      .expect(400);
  });

  it('should return a 409 Conflict when trying to check-in an already active customer', async () => {
    await request(app.getHttpServer())
      .post('/sessions/check-in')
      .send({ customerId });

    await request(app.getHttpServer())
      .post('/sessions/check-in')
      .send({ customerId })
      .expect(409);
  });
});
