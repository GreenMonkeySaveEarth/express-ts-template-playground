# Drinks API Documentation

This document describes the drinks endpoints available in the Express TypeScript template.

## Endpoints

### GET /drinks

Search for drinks using TheCocktailDB API.

**Parameters:**
- `search` (required): The drink name to search for

**Example Request:**
```bash
GET /drinks?search=margarita
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Found 6 drinks for search term: \"margarita\"",
  "data": [
    {
      "idDrink": "11007",
      "strDrink": "Margarita",
      "strDrinkThumb": "https://www.thecocktaildb.com/images/media/drink/5noda61589575158.jpg",
      "strCategory": "Ordinary Drink",
      "strAlcoholic": "Alcoholic",
      "strGlass": "Cocktail glass",
      "strInstructions": "Rub the rim of the glass with the lime slice to make the salt stick to it...",
      "strIngredient1": "Tequila",
      "strIngredient2": "Triple sec",
      "strIngredient3": "Lime juice",
      "strMeasure1": "1 1/2 oz ",
      "strMeasure2": "1/2 oz ",
      "strMeasure3": "1 oz "
    }
  ],
  "total": 6
}
```

**Error Response (400):**
```json
{
  "error": "Bad Request",
  "message": "Search parameter is required",
  "example": "/drinks?search=margarita"
}
```

**Error Response (500):**
```json
{
  "error": "Internal Server Error",
  "message": "Failed to fetch drinks: Request timeout"
}
```

### POST /drinks

Create a new drink (mock endpoint).

**Request Body:**
```json
{
  "name": "Mojito",
  "category": "Cocktail",
  "alcoholic": "Alcoholic",
  "glass": "Highball glass",
  "instructions": "Muddle mint leaves with sugar and lime juice. Add rum and top with soda water.",
  "ingredients": [
    {
      "name": "White rum",
      "measure": "2 oz"
    },
    {
      "name": "Lime juice",
      "measure": "1 oz"
    },
    {
      "name": "Mint leaves",
      "measure": "6-8 leaves"
    },
    {
      "name": "Sugar",
      "measure": "2 tsp"
    },
    {
      "name": "Soda water"
    }
  ],
  "image": "https://example.com/mojito.jpg"
}
```

**Field Validation:**
- `name` (required): String, 1-100 characters
- `category` (required): String, non-empty
- `alcoholic` (required): Must be one of: "Alcoholic", "Non alcoholic", "Optional alcohol"
- `glass` (required): String, non-empty
- `instructions` (required): String, 1-1000 characters
- `ingredients` (required): Array with at least one ingredient
  - `name` (required): String, non-empty
  - `measure` (optional): String
- `image` (optional): String, URL

**Success Response (201):**
```json
{
  "success": true,
  "message": "Drink created successfully",
  "data": {
    "id": "drink_1642678900123_abc123def",
    "name": "Mojito",
    "category": "Cocktail",
    "alcoholic": "Alcoholic",
    "glass": "Highball glass",
    "instructions": "Muddle mint leaves with sugar and lime juice. Add rum and top with soda water.",
    "ingredients": [
      {
        "name": "White rum",
        "measure": "2 oz"
      },
      {
        "name": "Lime juice",
        "measure": "1 oz"
      }
    ],
    "image": "https://example.com/mojito.jpg",
    "createdAt": "2024-01-20T15:35:00.123Z"
  }
}
```

**Error Response (400):**
```json
{
  "error": "Validation failed",
  "message": "Request body contains invalid data",
  "details": [
    "Name is required and must be a non-empty string",
    "Alcoholic must be one of: \"Alcoholic\", \"Non alcoholic\", \"Optional alcohol\""
  ]
}
```

## Error Handling

All endpoints include comprehensive error handling:

- **400 Bad Request**: Invalid input parameters or validation failures
- **500 Internal Server Error**: Server or third-party API errors
- **Timeout Handling**: 5-second timeout for external API calls

## Example Usage with cURL

### Search for drinks:
```bash
curl "http://localhost:3000/drinks?search=mojito"
```

### Create a new drink:
```bash
curl -X POST http://localhost:3000/drinks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Cocktail",
    "category": "Cocktail",
    "alcoholic": "Alcoholic",
    "glass": "Martini Glass",
    "instructions": "Mix ingredients and serve",
    "ingredients": [
      {"name": "Vodka", "measure": "2 oz"},
      {"name": "Lime juice", "measure": "1 oz"}
    ]
  }'
```

## Testing

Run the test suite to verify endpoint functionality:

```bash
npm test
```

The test suite includes:
- Valid request handling
- Error scenarios
- Input validation
- Response format verification
