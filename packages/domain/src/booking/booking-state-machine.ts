export type BookingStatus =
  | 'REQUESTED'
  | 'ACCEPTED'
  | 'EN_ROUTE'
  | 'ARRIVED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED'
  | 'RESOLVED';

export type ActorType = 'CUSTOMER' | 'MECHANIC' | 'ADMIN' | 'SYSTEM';

export interface TransitionRule {
  target: BookingStatus;
  allowedActors: ActorType[];
}

export const BOOKING_TRANSITIONS: Record<BookingStatus, TransitionRule[]> = {
  REQUESTED: [
    { target: 'ACCEPTED', allowedActors: ['MECHANIC', 'ADMIN', 'SYSTEM'] },
    { target: 'CANCELLED', allowedActors: ['CUSTOMER', 'ADMIN', 'SYSTEM'] },
  ],
  ACCEPTED: [
    { target: 'EN_ROUTE', allowedActors: ['MECHANIC', 'ADMIN'] },
    { target: 'CANCELLED', allowedActors: ['CUSTOMER', 'MECHANIC', 'ADMIN', 'SYSTEM'] },
  ],
  EN_ROUTE: [
    { target: 'ARRIVED', allowedActors: ['MECHANIC', 'ADMIN'] },
    { target: 'CANCELLED', allowedActors: ['CUSTOMER', 'MECHANIC', 'ADMIN', 'SYSTEM'] },
  ],
  ARRIVED: [
    { target: 'IN_PROGRESS', allowedActors: ['MECHANIC', 'ADMIN'] },
    { target: 'CANCELLED', allowedActors: ['CUSTOMER', 'MECHANIC', 'ADMIN'] },
  ],
  IN_PROGRESS: [
    { target: 'COMPLETED', allowedActors: ['MECHANIC', 'ADMIN'] },
    { target: 'CANCELLED', allowedActors: ['ADMIN'] },
  ],
  COMPLETED: [
    { target: 'DISPUTED', allowedActors: ['CUSTOMER', 'ADMIN'] },
  ],
  CANCELLED: [],
  DISPUTED: [
    { target: 'RESOLVED', allowedActors: ['ADMIN'] },
  ],
  RESOLVED: [],
};

export function validateTransition(
  from: BookingStatus,
  to: BookingStatus,
  actor: ActorType,
): { valid: boolean; error?: string } {
  if (from === to) {
    return { valid: false, error: `Booking is already in status ${from}` };
  }

  const allowedTransitions = BOOKING_TRANSITIONS[from];
  if (!allowedTransitions || allowedTransitions.length === 0) {
    return {
      valid: false,
      error: `Status ${from} is terminal; no further state transitions are allowed`,
    };
  }

  const rule = allowedTransitions.find((t) => t.target === to);
  if (!rule) {
    return {
      valid: false,
      error: `Invalid transition from ${from} to ${to}`,
    };
  }

  if (!rule.allowedActors.includes(actor)) {
    return {
      valid: false,
      error: `Actor '${actor}' is not authorized to transition booking from ${from} to ${to}`,
    };
  }

  return { valid: true };
}

export function getAvailableTransitions(
  status: BookingStatus,
  actor: ActorType,
): BookingStatus[] {
  const transitions = BOOKING_TRANSITIONS[status] || [];
  return transitions
    .filter((t) => t.allowedActors.includes(actor))
    .map((t) => t.target);
}
