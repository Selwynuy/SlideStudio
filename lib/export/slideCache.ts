import { Slide, AspectRatio } from "@/types/slide";

interface CachedSlideData {
  slide: Slide;
  aspectRatio: AspectRatio;
  slideIndex?: number;
  expiresAt: number;
}

// In-memory cache for slide data (cleaned up after 5 minutes)
const cache = new Map<string, CachedSlideData>();

// Cleanup expired entries every minute
setInterval(() => {
  const now = Date.now();
  const tokensToDelete: string[] = [];
  cache.forEach((data, token) => {
    if (data.expiresAt < now) {
      tokensToDelete.push(token);
    }
  });
  tokensToDelete.forEach((token) => cache.delete(token));
}, 60_000);

/**
 * Store slide data temporarily and return a token.
 * Data expires after 5 minutes.
 */
export function storeSlideData(
  slide: Slide,
  aspectRatio: AspectRatio,
  slideIndex?: number
): string {
  const token = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  cache.set(token, {
    slide,
    aspectRatio,
    slideIndex,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
  });
  return token;
}

/**
 * Retrieve slide data by token. Returns null if not found or expired.
 */
export function getSlideData(token: string): CachedSlideData | null {
  const data = cache.get(token);
  if (!data) return null;
  if (data.expiresAt < Date.now()) {
    cache.delete(token);
    return null;
  }
  return data;
}
