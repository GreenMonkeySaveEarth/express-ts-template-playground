import { Request, Response, NextFunction } from 'express';

/**
 * Authorization middleware for checking permissions
 */
export class AuthorizationMiddleware {
    /**
     * Check if user has required permission
     */
    static requirePermission = (permission: string) => {
        return (req: Request, res: Response, next: NextFunction): void => {
            if (!req.user) {
                res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Authentication required',
                });
                return;
            }

            if (!req.user.permissions.includes(permission)) {
                res.status(403).json({
                    error: 'Forbidden',
                    message: `Insufficient permissions. Required: ${permission}`,
                    userPermissions: req.user.permissions,
                });
                return;
            }

            next();
        };
    };

    /**
     * Check if user has required role
     */
    static requireRole = (roles: string | string[]): ((req: Request, res: Response, next: NextFunction) => void) => {
        const requiredRoles = Array.isArray(roles) ? roles : [roles];

        return (req: Request, res: Response, next: NextFunction): void => {
            if (!req.user) {
                res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Authentication required',
                });
                return;
            }

            if (!requiredRoles.includes(req.user.role)) {
                res.status(403).json({
                    error: 'Forbidden',
                    message: `Insufficient role. Required: ${requiredRoles.join(' or ')}`,
                    userRole: req.user.role,
                });
                return;
            }

            next();
        };
    };

    /**
     * Check if user can write (create/update/delete)
     */
    static requireWritePermission = AuthorizationMiddleware.requirePermission('write');

    /**
     * Check if user can delete
     */
    static requireDeletePermission = AuthorizationMiddleware.requirePermission('delete');

    /**
     * Check if user is admin or moderator
     */
    static requireModeratorOrAdmin = AuthorizationMiddleware.requireRole(['admin', 'moderator']);

    /**
     * Check if user is admin
     */
    static requireAdmin = AuthorizationMiddleware.requireRole('admin');
}
