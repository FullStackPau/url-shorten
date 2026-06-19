export { baseUrl } from "./base-url";
export { prisma } from "./prisma";

export { generateShortCode, DEFAULT_CODE_LENGTH } from "./short-code";
export { normalizeAndValidateUrl, InvalidUrlError } from "./url-validation";

export type {
  UrlRepository,
  ShortenedUrlRecord,
  CreateShortenedUrlInput,
} from "./url-repository";
export { PrismaUrlRepository } from "./prisma-url-repository";
export { UrlService, CodeGenerationError } from "./url-service";
export type { UrlServiceOptions } from "./url-service";

export { urlService, urlRepository } from "./container";
