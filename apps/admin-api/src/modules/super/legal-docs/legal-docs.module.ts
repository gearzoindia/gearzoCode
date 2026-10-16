import { Module } from '@nestjs/common';
import { LegalDocsController } from './legal-docs.controller';
import { LegalDocsService } from './legal-docs.service';

@Module({
  controllers: [LegalDocsController],
  providers: [LegalDocsService],
  exports: [LegalDocsService],
})
export class LegalDocsModule {}
