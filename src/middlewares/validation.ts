import { Request, Response, NextFunction } from 'express';
import { CreateDrinkRequest } from '../types/drinks';

/**
 * Validation middleware for creating drinks
 */
export const validateCreateDrink = (req: Request, res: Response, next: NextFunction): void => {
    const { name, category, alcoholic, glass, instructions, ingredients } = req.body as CreateDrinkRequest;

    const errors: string[] = [];

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        errors.push('Name is required and must be a non-empty string');
    }

    if (!category || typeof category !== 'string' || category.trim().length === 0) {
        errors.push('Category is required and must be a non-empty string');
    }

    if (!alcoholic || !['Alcoholic', 'Non alcoholic', 'Optional alcohol'].includes(alcoholic)) {
        errors.push('Alcoholic must be one of: "Alcoholic", "Non alcoholic", "Optional alcohol"');
    }

    if (!glass || typeof glass !== 'string' || glass.trim().length === 0) {
        errors.push('Glass type is required and must be a non-empty string');
    }

    if (!instructions || typeof instructions !== 'string' || instructions.trim().length === 0) {
        errors.push('Instructions are required and must be a non-empty string');
    }

    // Validate ingredients array
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
        errors.push('Ingredients are required and must be a non-empty array');
    } else {
        ingredients.forEach((ingredient, index) => {
            if (!ingredient.name || typeof ingredient.name !== 'string' || ingredient.name.trim().length === 0) {
                errors.push(`Ingredient ${index + 1}: name is required and must be a non-empty string`);
            }
            if (ingredient.measure && typeof ingredient.measure !== 'string') {
                errors.push(`Ingredient ${index + 1}: measure must be a string if provided`);
            }
        });
    }

    // Validate name length
    if (name && name.length > 100) {
        errors.push('Name must be 100 characters or less');
    }

    // Validate instructions length
    if (instructions && instructions.length > 1000) {
        errors.push('Instructions must be 1000 characters or less');
    }

    if (errors.length > 0) {
        res.status(400).json({
            error: 'Validation failed',
            message: 'Request body contains invalid data',
            details: errors,
        });
        return;
    }

    next();
};
