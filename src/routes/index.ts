import { Router } from "express";
import * as controller from "../controllers/index";
import { validateCreateDrink } from "../middlewares/validation";
import { searchRateLimit, writeRateLimit } from "../middlewares/rateLimit";
import { AuthMiddleware } from "../middlewares/auth";
import { AuthorizationMiddleware } from "../middlewares/authorization";

export const index = Router();

index.get("/", controller.index);

// Drinks routes
index.get("/drinks", searchRateLimit.middleware, controller.getDrinks);
index.post("/drinks", 
    writeRateLimit.middleware, 
    AuthMiddleware.apiKeyAuth, 
    AuthorizationMiddleware.requireWritePermission,
    validateCreateDrink, 
    controller.createDrink,
);
index.patch("/drinks/:id", 
    writeRateLimit.middleware, 
    AuthMiddleware.apiKeyAuth, 
    AuthorizationMiddleware.requireWritePermission,
    validateCreateDrink, 
    controller.updateDrink,
);
index.delete("/drinks/:id", 
    writeRateLimit.middleware, 
    AuthMiddleware.apiKeyAuth, 
    AuthorizationMiddleware.requireDeletePermission,
    controller.deleteDrink,
);
