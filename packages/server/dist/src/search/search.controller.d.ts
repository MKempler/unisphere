import { SearchService } from './search.service';
export declare class SearchController {
    private readonly searchService;
    constructor(searchService: SearchService);
    search(query: string, cursor?: string, limit?: number): Promise<any>;
    getTrendingTags(limit?: number): Promise<any>;
}
