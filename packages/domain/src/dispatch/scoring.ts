export interface DispatchWeights {
  eta: number; // default: 0.4
  rating: number; // default: 0.2
  reliability: number; // default: 0.15
  fairness: number; // default: 0.15
  specialization: number; // default: 0.1
}

export const DEFAULT_DISPATCH_WEIGHTS: DispatchWeights = {
  eta: 0.4,
  rating: 0.2,
  reliability: 0.15,
  fairness: 0.15,
  specialization: 0.1,
};

export interface MechanicScoringInput {
  id: string;
  etaMinutes: number;
  rating: number; // 0 to 5
  ratingCount?: number;
  acceptanceRate?: number; // 0.0 to 1.0
  completionRate?: number; // 0.0 to 1.0
  jobsCompletedToday?: number; // integer >= 0
  skills?: string[]; // service category IDs or names
  supportedVehicleTypes?: string[];
}

export interface BookingScoringInput {
  serviceId?: string;
  categoryId?: string;
  vehicleType?: string;
  maxEtaMinutes?: number;
}

export interface MechanicScoreBreakdown {
  etaScore: number;
  ratingScore: number;
  reliabilityScore: number;
  fairnessScore: number;
  specializationScore: number;
}

export interface MechanicScore {
  mechanicId: string;
  totalScore: number;
  breakdown: MechanicScoreBreakdown;
}

/**
 * Calculates a composite score for a mechanic relative to a booking.
 * Higher score indicates higher assignment priority.
 */
export function calculateMechanicScore(
  mechanic: MechanicScoringInput,
  booking: BookingScoringInput,
  weights: Partial<DispatchWeights> = {},
): MechanicScore {
  const mergedWeights: DispatchWeights = { ...DEFAULT_DISPATCH_WEIGHTS, ...weights };

  // 1. ETA Score: 0 to 1 (shorter is higher)
  const maxEta = booking.maxEtaMinutes ?? 60;
  const clampedEta = Math.min(Math.max(mechanic.etaMinutes, 0), maxEta);
  const etaScore = 1 - clampedEta / maxEta;

  // 2. Rating Score: 0 to 1 (5 stars = 1.0, 0 stars = 0.5 default for new mechanics)
  let ratingScore = 0.5;
  if (mechanic.ratingCount && mechanic.ratingCount > 0) {
    ratingScore = Math.min(Math.max(mechanic.rating / 5, 0), 1);
  }

  // 3. Reliability Score: blend of acceptance rate and completion rate (0 to 1)
  const acceptance = mechanic.acceptanceRate ?? 0.8;
  const completion = mechanic.completionRate ?? 0.9;
  const reliabilityScore = Math.min(Math.max((acceptance * 0.4) + (completion * 0.6), 0), 1);

  // 4. Fairness / Load Balancing Score: mechanics with fewer jobs today score higher
  const jobsToday = mechanic.jobsCompletedToday ?? 0;
  const maxDailyJobs = 10;
  const fairnessScore = Math.max(0, 1 - jobsToday / maxDailyJobs);

  // 5. Specialization: vehicle type & skill match
  let specializationScore = 0.5;
  let matches = 0;
  let totalChecks = 0;

  if (booking.vehicleType && mechanic.supportedVehicleTypes) {
    totalChecks++;
    if (mechanic.supportedVehicleTypes.includes(booking.vehicleType)) {
      matches++;
    }
  }

  if (booking.categoryId && mechanic.skills) {
    totalChecks++;
    if (mechanic.skills.includes(booking.categoryId)) {
      matches++;
    }
  }

  if (totalChecks > 0) {
    specializationScore = matches / totalChecks;
  }

  // Composite calculation
  const totalScore =
    etaScore * mergedWeights.eta +
    ratingScore * mergedWeights.rating +
    reliabilityScore * mergedWeights.reliability +
    fairnessScore * mergedWeights.fairness +
    specializationScore * mergedWeights.specialization;

  const breakdown: MechanicScoreBreakdown = {
    etaScore: Math.round(etaScore * 1000) / 1000,
    ratingScore: Math.round(ratingScore * 1000) / 1000,
    reliabilityScore: Math.round(reliabilityScore * 1000) / 1000,
    fairnessScore: Math.round(fairnessScore * 1000) / 1000,
    specializationScore: Math.round(specializationScore * 1000) / 1000,
  };

  return {
    mechanicId: mechanic.id,
    totalScore: Math.round(totalScore * 1000) / 1000,
    breakdown,
  };
}

export function scoreMechanic(
  mechanic: MechanicScoringInput,
  booking: BookingScoringInput,
  weights: Partial<DispatchWeights> = {},
): number {
  return calculateMechanicScore(mechanic, booking, weights).totalScore;
}
