import { prisma } from "./prisma";
import { PrismaUrlRepository } from "./prisma-url-repository";
import { UrlService } from "./url-service";

/**
 * Default application-wide instances, wired with the Prisma-backed repository.
 * Routes should import `urlService` from here instead of constructing their own.
 */
export const urlRepository = new PrismaUrlRepository(prisma);
export const urlService = new UrlService(urlRepository);
