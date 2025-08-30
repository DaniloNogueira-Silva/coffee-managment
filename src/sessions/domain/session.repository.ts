import { Session } from "./session.entity";

export const ISessionRepository = Symbol('ISessionRepository');

export interface ISessionRepository {
    save(session: Session): Promise<Session>;
    findActiveBycustomerId(customerId: string): Promise<Session | null>;
    findById(id: string): Promise<Session | null>;    
}

