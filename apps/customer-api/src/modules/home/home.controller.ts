import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { HomeService } from './home.service';
import { HomeQueryDto } from './dto/home.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CustomerAuthGuard } from '../../common/guards/auth.guard';

@ApiTags('Home')
@Controller(['', 'customer'])
@UseGuards(CustomerAuthGuard)
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Public()
  @Get('home')
  @ApiOperation({ summary: 'Get unified home screen feed data' })
  async getHome(
    @CurrentUser('id') customerId?: string,
    @Query() query?: HomeQueryDto,
  ) {
    return this.homeService.getHomeData(customerId, query);
  }

  @Public()
  @Get('app-config')
  @ApiOperation({ summary: 'Get client app configuration, feature flags, versioning' })
  async getAppConfig() {
    return this.homeService.getAppConfig();
  }
}
