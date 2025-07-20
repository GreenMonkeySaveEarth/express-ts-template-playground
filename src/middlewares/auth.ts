import { Request, Response, NextFunction } from 'express';

// Extend the Request interface to include user information
declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            user?: {
                id: string;
                username: string;
                role: string;
                permissions: string[];
            };
        }
    }
}

interface MockUser {
    id: string;
    username: string;
    role: 'admin' | 'user' | 'moderator';
    permissions: string[];
    apiKey: string;
}

/**
 * Mock user database
 * In production, this would be a real database or external auth service
 */
const mockUsers: MockUser[] = [
    {
        id: 'user_1',
        username: 'admin',
        role: 'admin',
        permissions: ['read', 'write', 'delete', 'manage'],
        apiKey: 'admin-api-key-123456',
    },
    {
        id: 'user_2',
        username: 'bartender',
        role: 'moderator',
        permissions: ['read', 'write'],
        apiKey: 'bartender-api-key-789012',
    },
    {
        id: 'user_3',
        username: 'customer',
        role: 'user',
        permissions: ['read'],
        apiKey: 'customer-api-key-345678',
    },
];

/**
 * Authentication middleware that supports multiple auth methods
 */
export class AuthMiddleware {
    /**
     * API Key authentication
     * Expects Authorization header: "Bearer your-api-key"
     */
    static apiKeyAuth = (req: Request, res: Response, next: NextFunction): void => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader) {
                res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Authorization header is required',
                    hint: 'Include "Authorization: Bearer your-api-key" in your request headers',
                });
                return;
            }

            const [bearer, apiKey] = authHeader.split(' ');

            if (bearer !== 'Bearer' || !apiKey) {
                res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Invalid authorization format',
                    hint: 'Use "Authorization: Bearer your-api-key" format',
                });
                return;
            }

            // Find user by API key
            const user = mockUsers.find(u => u.apiKey === apiKey);

            if (!user) {
                res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Invalid API key',
                    hint: 'Please check your API key and try again',
                });
                return;
            }

            // Attach user to request
            req.user = {
                id: user.id,
                username: user.username,
                role: user.role,
                permissions: user.permissions,
            };

            next();
        } catch (error) {
            console.error('Authentication error:', error);
            res.status(500).json({
                error: 'Internal Server Error',
                message: 'Authentication service error',
            });
        }
    };

    /**
     * JWT Token authentication (mock implementation)
     * In production, use a proper JWT library like jsonwebtoken
     */
    static jwtAuth = (req: Request, res: Response, next: NextFunction): void => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader) {
                res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Authorization header is required',
                });
                return;
            }

            const [bearer, token] = authHeader.split(' ');

            if (bearer !== 'Bearer' || !token) {
                res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Invalid authorization format',
                });
                return;
            }

            // Mock JWT validation (in production, use jwt.verify())
            if (token.startsWith('mock-jwt-')) {
                const userId = token.replace('mock-jwt-', '');
                const user = mockUsers.find(u => u.id === userId);

                if (!user) {
                    res.status(401).json({
                        error: 'Unauthorized',
                        message: 'Invalid token',
                    });
                    return;
                }

                req.user = {
                    id: user.id,
                    username: user.username,
                    role: user.role,
                    permissions: user.permissions,
                };

                next();
            } else {
                res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Invalid token format',
                });
            }
        } catch (error) {
            console.error('JWT authentication error:', error);
            res.status(500).json({
                error: 'Internal Server Error',
                message: 'Authentication service error',
            });
        }
    };
}

/**
 * Helper function to get current user from request
 */
export const getCurrentUser = (req: Request): Express.Request['user'] => req.user;

/**
 * Mock login endpoint helper (for testing purposes)
 */
export const mockLoginHelper = {
    generateApiKey: (username: string): string | null => {
        const user = mockUsers.find(u => u.username === username);
        return user ? user.apiKey : null;
    },

    generateJWTToken: (username: string): string | null => {
        const user = mockUsers.find(u => u.username === username);
        return user ? `mock-jwt-${user.id}` : null;
    },

    getUsers: (): Array<{ id: string; username: string; role: string; permissions: string[] }> => mockUsers.map(u => ({ 
        id: u.id, 
        username: u.username, 
        role: u.role, 
        permissions: u.permissions,
    })),
};
