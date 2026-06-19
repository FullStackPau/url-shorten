import type { PrismaClient } from "./generated/prisma/client";
import type {
  CreateShortenedUrlInput,
  ShortenedUrlRecord,
  UrlRepository,
} from "./url-repository";

const RECORD_NOT_FOUND = "P2025";

function isRecordNotFound(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === RECORD_NOT_FOUND
  );
}

export class PrismaUrlRepository implements UrlRepository {
  constructor(private readonly prisma: PrismaClient) {}

  create(input: CreateShortenedUrlInput): Promise<ShortenedUrlRecord> {
    return this.prisma.shortenedUrl.create({ data: input });
  }

  findByCode(code: string): Promise<ShortenedUrlRecord | null> {
    return this.prisma.shortenedUrl.findUnique({ where: { code } });
  }

  async existsByCode(code: string): Promise<boolean> {
    const found = await this.prisma.shortenedUrl.findUnique({
      where: { code },
      select: { id: true },
    });
    return found !== null;
  }

  async registerClick(code: string): Promise<ShortenedUrlRecord | null> {
    try {
      return await this.prisma.shortenedUrl.update({
        where: { code },
        data: { clicks: { increment: 1 } },
      });
    } catch (error) {
      if (isRecordNotFound(error)) {
        return null;
      }
      throw error;
    }
  }

  list(limit = 50): Promise<ShortenedUrlRecord[]> {
    return this.prisma.shortenedUrl.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }
}
