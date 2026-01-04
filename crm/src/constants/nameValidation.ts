
import * as z from "zod";

/**
 * Regex for allowing only letters, numbers, spaces, dots (.), and @.
 */
export const ALLOWED_NAME_CHARS_REGEX = /^[a-zA-Z0-9\s.@]+$/;

/**
 * Regex for input sanitization (removing invalid characters).
 * Replace matches of this regex with an empty string.
 */
export const INVALID_NAME_CHARS_REGEX = /[^a-zA-Z0-9\s.@]/g;

/**
 * Zod schema refinement for validating names.
 * - Checks allowed characters.
 * - explicitly disallows ".com" and ".in".
 */
export const nameValidationSchema = z.string()
    .min(1, "Name is required")
    .regex(ALLOWED_NAME_CHARS_REGEX, "Only letters, numbers, spaces, dots (.), and @ are allowed.")
    .refine(val => !/\.com/i.test(val) && !/\.in/i.test(val), "Domain extensions like .com and .in are not allowed.");
