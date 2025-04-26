import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SearchIndexer } from './search-indexer.service';

@Module({
  imports: [PrismaModule],
  controllers: [SearchController],
  providers: [SearchService, SearchIndexer],
  exports: [SearchService],
})
export class SearchModule {} 