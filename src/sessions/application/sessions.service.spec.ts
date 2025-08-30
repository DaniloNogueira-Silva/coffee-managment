import { ConflictException, NotFoundException } from '@nestjs/common';
import { Session, SessionStatus } from '../domain/session.entity';
import { Test, TestingModule } from '@nestjs/testing';

import { ISessionRepository } from '../domain/session.repository';
import { SessionsService } from './sessions.service';

describe('SessionsService', () => {
  let service: SessionsService;
  let mockSessionRepository: ISessionRepository;

  const mockRepositoryProvider = {
    provide: ISessionRepository,
    useValue: {
      save: jest.fn(),
      findActiveBycustomerId: jest.fn(),
      findById: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SessionsService, mockRepositoryProvider],
    }).compile();

    service = module.get<SessionsService>(SessionsService);
    mockSessionRepository = module.get<ISessionRepository>(ISessionRepository);
    jest.clearAllMocks();
  });

  describe('checkIn', () => {
    it('should create a new session if user has no active session', async () => {
      const customerId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
      jest.spyOn(mockSessionRepository, 'findActiveBycustomerId').mockResolvedValue(null);
      jest.spyOn(mockSessionRepository, 'save').mockImplementation(async (session) => session);

      const result = await service.checkIn(customerId);

      expect(mockSessionRepository.findActiveBycustomerId).toHaveBeenCalledWith(customerId);
      expect(mockSessionRepository.save).toHaveBeenCalled();
      expect(result.customerId).toBe(customerId);
      expect(result.status).toBe(SessionStatus.ACTIVE);
    });

    it('should throw ConflictException if user already has an active session', async () => {
      const customerId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
      const activeSession: Session = {
        id: 'some-session-id',
        customerId,
        checkInTime: new Date(),
        status: SessionStatus.ACTIVE,
      };
      jest.spyOn(mockSessionRepository, 'findActiveBycustomerId').mockResolvedValue(activeSession);

      await expect(service.checkIn(customerId)).rejects.toThrow(ConflictException);
    });
  });

  describe('checkOut', () => {
    it('should complete an active session for a user', async () => {
      const customerId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
      const checkInTime = new Date(Date.now() - 1000 * 60 * 60); // 1 hour ago
      const activeSession: Session = {
        id: 'some-session-id',
        customerId,
        checkInTime,
        status: SessionStatus.ACTIVE,
      };

      jest.spyOn(mockSessionRepository, 'findActiveBycustomerId').mockResolvedValue(activeSession);
      jest.spyOn(mockSessionRepository, 'save').mockImplementation(async (session) => session);

      const result = await service.checkOut(customerId);

      expect(mockSessionRepository.findActiveBycustomerId).toHaveBeenCalledWith(customerId);
      expect(mockSessionRepository.save).toHaveBeenCalled();
      expect(result.status).toBe(SessionStatus.COMPLETED);
      expect(result.checkOutTime).toBeDefined();
      expect(result.totalCost).toBe(2.0);
    });

    it('should throw NotFoundException if no active session is found', async () => {
      const customerId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
      jest.spyOn(mockSessionRepository, 'findActiveBycustomerId').mockResolvedValue(null);

      await expect(service.checkOut(customerId)).rejects.toThrow(NotFoundException);
    });
  });
});