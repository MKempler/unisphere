export interface PostDTO {
  id: string;
  text: string;
  createdAt: string;
  author: {
    id: string;
    handle: string;
  };
  hashtags?: string[];
  federationId?: string;
  mediaUrl?: string;
}

export interface CreatePostDTO {
  text: string;
  mediaUrl?: string;
}

export interface PostTopic {
  id: string;
  name: string;
  createdAt: string;
}

export interface PostLink {
  url: string;
  title?: string;
  description?: string;
  image?: string;
} 