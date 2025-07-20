import { Request, Response } from "express";
import { cocktailService } from "../services/cocktailService";
import { CreateDrinkRequest, CreateDrinkResponse } from "../types/drinks";

/**
 * GET /
 * Home page.
 */
export const index = async (req: Request, res: Response): Promise<void> => {
    res.render("index", { title: "Express" });
};

/**
 * GET /drinks?search=searchTerm
 * Search for drinks from TheCocktailDB API
 */
export const getDrinks = async (req: Request, res: Response): Promise<void> => {
    try {
        const searchTerm = req.query.search as string;
        console.log('Search term:', searchTerm);

        if (!searchTerm) {
            res.status(400).json({
                error: 'Bad Request',
                message: 'Search parameter is required',
                example: '/drinks?search=margarita',
            });
            return;
        }

        const drinks = await cocktailService.searchDrinks(searchTerm);

        res.status(200).json({
            success: true,
            message: `Found ${drinks.length} drinks for search term: "${searchTerm}"`,
            data: drinks,
            total: drinks.length,
        });

    } catch (error) {
        console.error('Error in getDrinks:', error);
        
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        
        res.status(500).json({
            error: 'Internal Server Error',
            message: errorMessage,
        });
    }
};

/**
 * POST /drinks
 * Mock endpoint for creating a new drink
 */
export const createDrink = async (req: Request, res: Response): Promise<void> => {
    try {
        const drinkData = req.body as CreateDrinkRequest;

        // Generate a mock ID and timestamp
        const mockId = `drink_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const createdAt = new Date().toISOString();

        // Simulate processing delay (optional)
        await new Promise(resolve => setTimeout(resolve, 100));

        const response: CreateDrinkResponse = {
            success: true,
            message: 'Drink created successfully',
            data: {
                id: mockId,
                name: drinkData.name.trim(),
                category: drinkData.category.trim(),
                alcoholic: drinkData.alcoholic,
                glass: drinkData.glass.trim(),
                instructions: drinkData.instructions.trim(),
                ingredients: drinkData.ingredients.map(ingredient => ({
                    name: ingredient.name.trim(),
                    measure: ingredient.measure?.trim() || undefined,
                })),
                image: drinkData.image?.trim() || undefined,
                createdAt,
            },
        };

        // Log the creation for monitoring (in real app, this would go to database)
        console.log('Mock drink created:', {
            id: mockId,
            name: drinkData.name,
            timestamp: createdAt,
        });

        res.status(201).json(response);

    } catch (error) {
        console.error('Error in createDrink:', error);
        
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to create drink',
            details: errorMessage,
        });
    }
};

/**
 * PUT /drinks/:id
 * Mock endpoint for updating an existing drink
 */
export const updateDrink = async (req: Request, res: Response): Promise<void> => {  
    try {
        const drinkId = req.params.id;
        const drinkData = req.body as CreateDrinkRequest;

        // Simulate processing delay (optional)
        await new Promise(resolve => setTimeout(resolve, 100));

        // Here you would typically update the drink in your database
        // For this mock, we just return the updated data
        const response: CreateDrinkResponse = {
            success: true,
            message: 'Drink updated successfully',
            data: {
                id: drinkId,
                name: drinkData.name.trim(),
                category: drinkData.category.trim(),
                alcoholic: drinkData.alcoholic,
                glass: drinkData.glass.trim(),
                instructions: drinkData.instructions.trim(),
                ingredients: drinkData.ingredients.map(ingredient => ({
                    name: ingredient.name.trim(),
                    measure: ingredient.measure?.trim() || undefined,
                })),
                image: drinkData.image?.trim() || undefined,
                createdAt: new Date().toISOString(), // Mock createdAt for simplicity
            },
        };

        res.status(200).json(response);

    } catch (error) {
        console.error('Error in updateDrink:', error);
        
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to update drink',
            details: errorMessage,
        });
    }
};

/**
 * DELETE /drinks/:id
 * Mock endpoint for deleting a drink
 */
export const deleteDrink = async (req: Request, res: Response): Promise<void> => {
    try {
        const drinkId = req.params.id;

        // Simulate processing delay (optional)
        await new Promise(resolve => setTimeout(resolve, 100));

        // Here you would typically delete the drink from your database
        // For this mock, we just return a success message
        res.status(200).json({
            success: true,
            message: `Drink with ID ${drinkId} deleted successfully`,
        });

    } catch (error) {
        console.error('Error in deleteDrink:', error);
        
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to delete drink',
            details: errorMessage,
        });
    }
};
