// hooks/types.ts
export interface Blog {
  id: number;
  title: string;
  content: string;
  coverImage?: string;
  authorId: number;
  author?: {
    name?: string;
    profilePic?: string;
  };
}
