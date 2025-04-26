import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

describe('SearchService', () => {
  let service: SearchService;
  let prismaService: PrismaService;

  // Mock data
  const mockPosts = [
    {
      id: '1',
      text: 'Hello world! #unisphere #testing',
      createdAt: new Date(),
      author: { id: 'user1', handle: 'alice' },
      hashtags: [
        { hashtag: { name: 'unisphere' } },
        { hashtag: { name: 'testing' } }
      ]
    },
    {
      id: '2',
      text: 'Another post about #unisphere',
      createdAt: new Date(),
      author: { id: 'user2', handle: 'bob' },
      hashtags: [
        { hashtag: { name: 'unisphere' } }
      ]
    }
  ];

  const mockHashtags = [
    { name: 'unisphere', _count: { posts: 5 } },
    { name: 'testing', _count: { posts: 3 } },
    { name: 'javascript', _count: { posts: 2 } },
  ];

  // Setup mock services
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: PrismaService,
          useValue: {
            post: {
              findMany: jest.fn().mockImplementation((args) => {
                if (args.where?.hashtags?.some?.hashtag?.name?.in?.includes('unisphere')) {
                  return mockPosts;
                }
                if (args.where?.OR?.some(condition => condition.text?.contains === 'world')) {
                  return [mockPosts[0]];
                }
                return [];
              }),
            },
            hashtag: {
              findMany: jest.fn().mockImplementation(() => mockHashtags),
            },
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key, defaultValue) => defaultValue),
          },
        },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('extractHashtags', () => {
    it('should extract hashtags from text', () => {
      const result = service.extractHashtags('Hello #world! #testing123 no-hashtag');
      expect(result).toEqual(['world', 'testing123']);
    });

    it('should return empty array for text without hashtags', () => {
      const result = service.extractHashtags('Hello world! No hashtags here.');
      expect(result).toEqual([]);
    });

    it('should handle empty input', () => {
      const result = service.extractHashtags('');
      expect(result).toEqual([]);
    });

    it('should handle null input', () => {
      const result = service.extractHashtags(null);
      expect(result).toEqual([]);
    });
  });

  describe('search', () => {
    it('should search by hashtags', async () => {
      const result = await service.search('#unisphere');
      expect(prismaService.post.findMany).toHaveBeenCalled();
      expect(result.posts.length).toBe(2);
      expect(result.posts[0].author.handle).toBe('alice');
    });

    it('should search by text content', async () => {
      const result = await service.search('world');
      expect(prismaService.post.findMany).toHaveBeenCalled();
      expect(result.posts.length).toBe(1);
      expect(result.posts[0].author.handle).toBe('alice');
    });

    it('should return empty array for no matches', async () => {
      jest.spyOn(prismaService.post, 'findMany').mockResolvedValueOnce([]);
      const result = await service.search('nonexistent');
      expect(result.posts).toEqual([]);
      expect(result.nextCursor).toBeNull();
    });

    it('should handle empty query', async () => {
      const result = await service.search('');
      expect(result.posts).toEqual([]);
      expect(result.nextCursor).toBeNull();
    });

    it('should filter out stop words', async () => {
      const result = await service.search('the and or');
      expect(result.posts).toEqual([]);
    });
  });

  describe('getTrendingTags', () => {
    it('should return trending hashtags', async () => {
      const result = await service.getTrendingTags();
      expect(prismaService.hashtag.findMany).toHaveBeenCalled();
      expect(result.length).toBe(3);
      expect(result[0].name).toBe('unisphere');
      expect(result[0].count).toBe(5);
    });

    it('should limit results to specified count', async () => {
      const result = await service.getTrendingTags(2);
      expect(result.length).toBe(2);
    });
  });
}); 