import { IsObject, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDispatchSettingsDto {
  @ApiProperty({
    description: 'Scoring weights (distance, rating, idleTime, completionRate)',
    example: { distanceWeight: 0.4, ratingWeight: 0.3, idleTimeWeight: 0.2, completionRateWeight: 0.1 },
  })
  @IsObject()
  scoringWeights!: Record<string, number>;

  @ApiProperty({
    description: 'Wave dispatch configurations and radius step rings',
    example: [
      { wave: 1, radiusKm: 3, timeoutSec: 30, maxCandidates: 3 },
      { wave: 2, radiusKm: 7, timeoutSec: 45, maxCandidates: 6 },
      { wave: 3, radiusKm: 15, timeoutSec: 60, maxCandidates: 10 },
    ],
  })
  @IsObject()
  waveConfiguration!: any;
}
