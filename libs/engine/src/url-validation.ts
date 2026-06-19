export class InvalidUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidUrlError";
  }
}

const MAX_URL_LENGTH = 2048;
const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

/**
 * Validates and normalizes a user-provided URL.
 * Throws {@link InvalidUrlError} with a human-friendly message on failure.
 */
export function normalizeAndValidateUrl(input: string): string {
  const trimmed = input.trim();

  if (!trimmed) {
    throw new InvalidUrlError("URL is required.");
  }

  if (trimmed.length > MAX_URL_LENGTH) {
    throw new InvalidUrlError(
      `URL is too long (max ${MAX_URL_LENGTH} characters).`,
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new InvalidUrlError(
      "Enter a valid URL, including http:// or https://.",
    );
  }

  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    throw new InvalidUrlError("Only http and https URLs are allowed.");
  }

  if (!parsed.hostname) {
    throw new InvalidUrlError("URL must include a valid host.");
  }

  return parsed.toString();
}
