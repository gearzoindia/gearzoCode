import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LegalDocsService } from './legal-docs.service';
import { CreateLegalDocDto, UpdateLegalDocDto } from './dto';
import { AdminAuthGuard, PermissionsGuard } from '../../../common/guards';
import { Permissions, CurrentAdmin } from '../../../common/decorators';

@ApiTags('Super Admin - Legal Documents')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard, PermissionsGuard)
@Controller('legal-docs')
export class LegalDocsController {
  constructor(private readonly legalDocsService: LegalDocsService) {}

  @Get()
  @Permissions('LEGAL_DOCS_MANAGE')
  @ApiOperation({ summary: 'List published Terms of Service and Privacy Policy versions' })
  async findAll() {
    return this.legalDocsService.findAll();
  }

  @Get(':id')
  @Permissions('LEGAL_DOCS_MANAGE')
  @ApiOperation({ summary: 'Get single legal document record' })
  async findOne(@Param('id') id: string) {
    return this.legalDocsService.findOne(id);
  }

  @Post()
  @Permissions('LEGAL_DOCS_MANAGE')
  @ApiOperation({ summary: 'Publish new legal document version' })
  async create(
    @Body() dto: CreateLegalDocDto,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.legalDocsService.create(dto, adminId);
  }

  @Patch(':id')
  @Permissions('LEGAL_DOCS_MANAGE')
  @ApiOperation({ summary: 'Update legal document URL or publication date' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateLegalDocDto,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.legalDocsService.update(id, dto, adminId);
  }

  @Delete(':id')
  @Permissions('LEGAL_DOCS_MANAGE')
  @ApiOperation({ summary: 'Delete legal document' })
  async remove(
    @Param('id') id: string,
    @CurrentAdmin('id') adminId: string,
  ) {
    return this.legalDocsService.remove(id, adminId);
  }
}
