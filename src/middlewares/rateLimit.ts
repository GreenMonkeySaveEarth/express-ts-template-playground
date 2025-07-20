import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
    [key: string]: {
        count: number;
        resetTime: number;
    };
}

interface RateLimitOptions {
    windowMs: number; // Time window in milliseconds
    maxRequests: number; // Maximum number of requests per window
    message?: string;
    statusCode?: number;
    keyGenerator?: (req: Request) => string;
}

/**
 * Simple in-memory rate limiter middleware
 * In production, you should use Redis or another external store
 */
export class RateLimiter {
    private store: RateLimitStore = {};
    private options: Required<RateLimitOptions>;

    constructor(options: RateLimitOptions) {
        this.options = {
            windowMs: options.windowMs,
            maxRequests: options.maxRequests,
            message: options.message || 'Too many requests, please try again later',
            statusCode: options.statusCode || 429,
            keyGenerator: options.keyGenerator || this.defaultKeyGenerator,
        };

        // Clean up expired entries every minute
        setInterval(() => {
            this.cleanup();
        }, 60000);
    }

    private defaultKeyGenerator(req: Request): string {
        // Use IP address as the default key
        return req.ip || req.connection.remoteAddress || 'unknown';
    }

    private cleanup(): void {
        const now = Date.now();
        Object.keys(this.store).forEach(key => {
            if (this.store[key].resetTime <= now) {
                delete this.store[key];
            }
        });
    }

    public middleware = (req: Request, res: Response, next: NextFunction): void => {
        const key = this.options.keyGenerator(req);
        const now = Date.now();

        // Initialize or get existing entry
        if (!this.store[key] || this.store[key].resetTime <= now) {
            this.store[key] = {
                count: 1,
                resetTime: now + this.options.windowMs,
            };
        } else {
            this.store[key].count++;
        }

        const current = this.store[key];

        // Add rate limit headers
        res.set({
            'X-RateLimit-Limit': this.options.maxRequests.toString(),
            'X-RateLimit-Remaining': Math.max(0, this.options.maxRequests - current.count).toString(),
            'X-RateLimit-Reset': new Date(current.resetTime).toISOString(),
        });

        // Check if limit exceeded
        if (current.count > this.options.maxRequests) {
            res.status(this.options.statusCode).json({
                error: 'Rate limit exceeded',
                message: this.options.message,
                retryAfter: Math.ceil((current.resetTime - now) / 1000),
            });
            return;
        }

        next();
    };
}

/**
 * Pre-configured rate limiters for different use cases
 */

// For search endpoints - more lenient
export const searchRateLimit = new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // 100 requests per 15 minutes
    message: 'Too many search requests. Please wait before searching again.',
});

// For general API endpoints - moderate
export const apiRateLimit = new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 50, // 50 requests per 15 minutes
    message: 'Too many API requests. Please wait before making more requests.',
});

// For write operations - more strict
export const writeRateLimit = new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10, // 10 requests per 15 minutes
    message: 'Too many write operations. Please wait before creating/updating more resources.',
});

// For authentication endpoints - very strict
export const authRateLimit = new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 requests per 15 minutes
    message: 'Too many authentication attempts. Please wait before trying again.',
});
