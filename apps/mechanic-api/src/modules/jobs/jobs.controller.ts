import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import {
  ListJobsQueryDto,
  ArrivedDto,
  StartJobDto,
  CompleteJobDto,
  AddExtraDto,
  JobPhotoUploadUrlDto,
  PaymentReceivedDto,
  CancelJobDto,
  RateCustomerDto,
} from './dto/jobs.dto';
import { MechanicAuthGuard } from '../../common/guards/auth.guard';
import { RequireMechanicStatusGuard } from '../../common/guards/mechanic-status.guard';
import { RequireMechanicStatus } from '../../common/decorators/require-mechanic-status.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Jobs')
@Controller(['jobs', 'mechanic/jobs'])
@UseGuards(MechanicAuthGuard, RequireMechanicStatusGuard)
@RequireMechanicStatus('APPROVED')
@ApiBearerAuth()
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  @ApiOperation({ summary: 'List mechanic assigned jobs (upcoming, ongoing, past)' })
  async listJobs(
    @CurrentUser('id') mechanicId: string,
    @Query() query: any,
  ) {
    const result = await this.jobsService.listJobs(mechanicId, query);
    return (result as any).jobs || result;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get full job details with customer address, timeline, checklist' })
  async getJob(
    @CurrentUser('id') mechanicId: string,
    @Param('id') jobId: string,
  ) {
    return this.jobsService.getJob(mechanicId, jobId);
  }

  @Post(':id/step')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update job step (ON_THE_WAY, ARRIVED, IN_PROGRESS, COMPLETED)' })
  async updateStep(
    @CurrentUser('id') mechanicId: string,
    @Param('id') jobId: string,
    @Body() body: any,
  ) {
    const step = body.step;
    if (step === 'ON_THE_WAY') {
      return this.jobsService.startTrip(mechanicId, jobId);
    } else if (step === 'ARRIVED') {
      return this.jobsService.arrived(mechanicId, jobId, { lat: body.lat || 12.9352, lng: body.lng || 77.6772 });
    } else if (step === 'IN_PROGRESS') {
      return this.jobsService.startJob(mechanicId, jobId, { otp: body.otp || '1234' });
    } else if (step === 'COMPLETED') {
      return this.jobsService.completeJob(mechanicId, jobId, { notes: body.notes });
    }
    return this.jobsService.getJob(mechanicId, jobId);
  }

  @Post(':id/start-trip')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Transition job from ACCEPTED to EN_ROUTE' })
  async startTrip(
    @CurrentUser('id') mechanicId: string,
    @Param('id') jobId: string,
  ) {
    return this.jobsService.startTrip(mechanicId, jobId);
  }

  @Post(':id/arrived')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Transition job from EN_ROUTE to ARRIVED with 200m geofence validation' })
  async arrived(
    @CurrentUser('id') mechanicId: string,
    @Param('id') jobId: string,
    @Body() dto: ArrivedDto,
  ) {
    return this.jobsService.arrived(mechanicId, jobId, dto);
  }

  @Post(':id/start')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Start job with customer 4-digit start OTP verification' })
  async startJob(
    @CurrentUser('id') mechanicId: string,
    @Param('id') jobId: string,
    @Body() dto: StartJobDto,
  ) {
    return this.jobsService.startJob(mechanicId, jobId, dto);
  }

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete job (requires AFTER photo and approved extras)' })
  async completeJob(
    @CurrentUser('id') mechanicId: string,
    @Param('id') jobId: string,
    @Body() dto: CompleteJobDto,
  ) {
    return this.jobsService.completeJob(mechanicId, jobId, dto);
  }

  @Post(':id/extras')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Request extra parts/service work requiring customer approval' })
  async addExtra(
    @CurrentUser('id') mechanicId: string,
    @Param('id') jobId: string,
    @Body() dto: AddExtraDto,
  ) {
    return this.jobsService.addExtra(mechanicId, jobId, dto);
  }

  @Post(':id/photos/upload-url')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get signed upload URL for BEFORE / AFTER service photos' })
  async getPhotoUploadUrl(
    @CurrentUser('id') mechanicId: string,
    @Param('id') jobId: string,
    @Body() dto: JobPhotoUploadUrlDto,
  ) {
    return this.jobsService.getPhotoUploadUrl(mechanicId, jobId, dto);
  }

  @Post(':id/payment-received')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Record CASH or UPI_DIRECT collection from customer' })
  async receivePayment(
    @CurrentUser('id') mechanicId: string,
    @Param('id') jobId: string,
    @Body() dto: PaymentReceivedDto,
  ) {
    return this.jobsService.receivePayment(mechanicId, jobId, dto);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel job before arrival and re-offer to dispatch pool' })
  async cancelJob(
    @CurrentUser('id') mechanicId: string,
    @Param('id') jobId: string,
    @Body() dto: CancelJobDto,
  ) {
    return this.jobsService.cancelJob(mechanicId, jobId, dto);
  }

  @Post(':id/customer-no-show')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel job after ARRIVED + 15 min with doorstep visit fee' })
  async customerNoShow(
    @CurrentUser('id') mechanicId: string,
    @Param('id') jobId: string,
  ) {
    return this.jobsService.customerNoShow(mechanicId, jobId);
  }

  @Post(':id/rate-customer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit rating and feedback for customer' })
  async rateCustomer(
    @CurrentUser('id') mechanicId: string,
    @Param('id') jobId: string,
    @Body() dto: RateCustomerDto,
  ) {
    return this.jobsService.rateCustomer(mechanicId, jobId, dto);
  }
}
