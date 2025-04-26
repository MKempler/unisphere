export interface PostDTO {
  id: string;
  text: string;
  createdAt: string;
  author: {
    id: string;
    handle: string;
  };
  hashtags?: string[];
}

export interface CreatePostDTO {
  text: string;
} 