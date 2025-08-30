export enum SessionStatus {
    ACTIVE = 'active',
    COMPLETED = 'completed',
    CANCELED = 'canceled',
}

export class Session {
    id: string;
    customerId: string;
    checkInTime: Date;
    checkOutTime?: Date;
    status: SessionStatus;
    totalCost?: number;
}

