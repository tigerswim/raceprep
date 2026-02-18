// Rate limiting helper
class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  canMakeRequest(service: string, limit: number): boolean {
    const now = Date.now();
    const hour = 60 * 60 * 1000;
    const requests = this.requests.get(service) || [];

    // Remove requests older than 1 hour
    const recentRequests = requests.filter(time => now - time < hour);
    this.requests.set(service, recentRequests);

    if (recentRequests.length >= limit) {
      return false;
    }

    recentRequests.push(now);
    this.requests.set(service, recentRequests);
    return true;
  }
}

export const rateLimiter = new RateLimiter();
