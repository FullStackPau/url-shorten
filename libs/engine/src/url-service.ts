import { DEFAULT_CODE_LENGTH, generateShortCode } from "./short-code";
import { normalizeAndValidateUrl } from "./url-validation";
import type { ShortenedUrlRecord, UrlRepository } from "./url-repository";

const UNIQUE_CONSTRAINT = "P2002";

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === UNIQUE_CONSTRAINT
  );
}

export class CodeGenerationError extends Error {
  constructor() {
    super("Could not generate a unique short code. Please try again.");
    this.name = "CodeGenerationError";
  }
}

export interface UrlServiceOptions {
  codeLength?: number;
  maxRetries?: number;
}

export class UrlService {
  private readonly codeLength: number;
  private readonly maxRetries: number;

  constructor(
    private readonly repository: UrlRepository,
    options: UrlServiceOptions = {},
  ) {
    this.codeLength = options.codeLength ?? DEFAULT_CODE_LENGTH;
    this.maxRetries = options.maxRetries ?? 5;
  }

  /**
   * Validates the URL and stores it under a freshly generated unique code.
   * Retries on the (rare) event of a code collision and falls back to the
   * database unique constraint as the final source of truth.
   */
  async shorten(rawUrl: string): Promise<ShortenedUrlRecord> {
    const originalUrl = normalizeAndValidateUrl(rawUrl);

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      const code = generateShortCode(this.codeLength);

      if (await this.repository.existsByCode(code)) {
        continue;
      }

      try {
        return await this.repository.create({ code, originalUrl });
      } catch (error) {
        if (isUniqueConstraintError(error)) {
          continue;
        }
        throw error;
      }
    }

    throw new CodeGenerationError();
  }

  /**
   * Resolves a code to its original URL while registering the click.
   * Returns null when the code does not exist.
   */
  async resolve(code: string): Promise<string | null> {
    const record = await this.repository.registerClick(code);
    return record?.originalUrl ?? null;
  }

  list(): Promise<ShortenedUrlRecord[]> {
    return this.repository.list();
  }
}
