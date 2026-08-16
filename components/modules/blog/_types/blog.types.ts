export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  postCount: number;
  status: "active" | "inactive";
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
  image: string;
  altText: string;
  imageTitle: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  content: string;
  status: "published" | "draft" | "archived";
  views: number;
  createdAt: string;
}
