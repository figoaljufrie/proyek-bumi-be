import { Response } from "express";

interface SuccessResponse<DataType> {
  success: boolean;
  message: string;
  data: DataType;
  meta?: Record<string, unknown>;
}

interface ErrorResponse {
  success: boolean;
  message: string;
  error?: string;
  details?: unknown;
}

// Use generics for type safety
export const successResponse = <DataType>(
  res: Response,
  message: string,
  data: DataType,
  statusCode = 200,
  meta?: Record<string, unknown>
): Response => {
  const response: SuccessResponse<DataType> = {
    success: true,
    message,
    data,
    ...(meta && { meta }),
  };
  return res.status(statusCode).json(response);
};

// Environment-aware error handler
export const errorResponse = (
  res: Response,
  message: string,
  statusCode = 500,
  error?: unknown
): Response => {
  const isDev = process.env.NODE_ENV === "development";

  const response: ErrorResponse = {
    success: false,
    message,
  };

  if (error) {
    if (error instanceof Error) {
      response.error = error.message;
      // Only include stack/details in development
      if (isDev) {
        response.details = {
          stack: error.stack,
          name: error.name,
        };
      }
    } else if (typeof error === "string") {
      response.error = error;
    } else if (isDev) {
      // Only expose raw error objects in dev
      response.details = error;
    }
  }

  return res.status(statusCode).json(response);
};

/*
EXAMPLE OF USAGE IN CONTROLLER:
try {
    const userId = req.params.id;

    const user = await UserService.getUserById(userId);

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    return sendSuccess(res, "User fetched successfully", {
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    return sendError(res, "Failed to fetch user", 500, err);
  }
*/

/*
EXAMPLE OF RESPONSE:
(success)
{
  "success": true,
  "message": "User fetched successfully",
  "data": {
    "id": "123",
    "name": "Figo Aljufrie",
    "email": "figo@example.com"
  }
}

(user not found)
{
  "success": false,
  "message": "User not found"
}

(Unexpected server error)
{
  "success": false,
  "message": "Failed to fetch user",
  "error": "Cannot read property 'id' of undefined",
  "details": {
    "stack": "Error stack trace here",
    "name": "TypeError"
  }
}

*/
