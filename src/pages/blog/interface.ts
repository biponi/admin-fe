export interface IBlogPost {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  images: string[];
  categoryId: string;
  tags: string[];
  tagIds: string[];
  authorId: string;
  authorName: string;
  authorImage: string;
  authorBio: string;
  status: "draft" | "published" | "archived";
  publishedAt: string | null;
  active: boolean;
  deletedAt: string | null;

  // SEO
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  focusKeyword: string;
  metaRobots: string;
  canonicalUrl: string;

  // AI-SEO
  faqs: IBlogFaq[];
  howToSteps: IBlogHowToStep[];
  keyTakeaways: string[];

  // Engagement
  views: number;
  readingTime: number;

  createdAt: string;
  updatedAt: string;
}

export interface IBlogFaq {
  question: string;
  answer: string;
}

export interface IBlogHowToStep {
  name: string;
  text: string;
  image: string;
}

export interface IBlogCategory {
  _id: string;
  id: string;
  name: string;
  slug: string;
  description: string;
  img: string;
  seoTitle: string;
  seoDescription: string;
  active: boolean;
  postCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface IBlogFormData {
  title: string;
  content: string;
  excerpt: string;
  categoryId: string;
  tags: string[];
  status: "draft" | "published" | "archived";
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  focusKeyword: string;
  metaRobots: string;
  canonicalUrl: string;
  faqs: IBlogFaq[];
  howToSteps: IBlogHowToStep[];
  keyTakeaways: string[];
}

export interface IKeywordSuggestion {
  suggestedKeywords: string[];
  focusKeyword: string;
  seoTitle: string;
  seoDescription: string;
  wordCount: number;
  readingTime: number;
}

export interface IBlogPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}
