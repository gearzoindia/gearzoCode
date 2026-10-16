import { SetMetadata } from '@nestjs/common';
import { MechanicStatus } from '@gearzo/db';

export const MECHANIC_STATUS_KEY = 'requireMechanicStatus';
export const RequireMechanicStatus = (...statuses: (MechanicStatus | string)[]) =>
  SetMetadata(MECHANIC_STATUS_KEY, statuses);
