import { randomInt } from "node:crypto";

const ALPHABET =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

export const DEFAULT_CODE_LENGTH = 7;

/**
 * Generates a random short code using a base62 alphabet and a CSPRNG.
 * With length 7 there are 62^7 (~3.5 trillion) possible codes, which makes
 * collisions extremely unlikely while keeping links short.
 */
export function generateShortCode(length: number = DEFAULT_CODE_LENGTH): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += ALPHABET[randomInt(ALPHABET.length)];
  }
  return code;
}
