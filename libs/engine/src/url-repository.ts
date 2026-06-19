export interface ShortenedUrlRecord {
  id: string;
  code: string;
  originalUrl: string;
  clicks: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateShortenedUrlInput {
  code: string;
  originalUrl: string;
}

/**
 * Persistence abstraction for shortened URLs. Keeping this as an interface lets
 * the domain logic stay decoupled from Prisma/PostgreSQL and makes it trivial
 * to swap the implementation (e.g. an in-memory repository for tests).
 */
export interface UrlRepository {
  create(input: CreateShortenedUrlInput): Promise<ShortenedUrlRecord>;
  findByCode(code: string): Promise<ShortenedUrlRecord | null>;
  existsByCode(code: string): Promise<boolean>;
  /**
   * Atomically increments the click counter and returns the updated record,
   * or null when no URL exists for the given code.
   */
  registerClick(code: string): Promise<ShortenedUrlRecord | null>;
  list(limit?: number): Promise<ShortenedUrlRecord[]>;
}
