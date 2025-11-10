export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number = 500, details?: unknown) {
    super(message);
    this.status = status;
    this.name = "ApiError";
    this.details = details;
  }
}

/*
EXAMPLE OF USAGE:
throw new ApiError("User not found", 404, { layer: "service" });

EXAMPLE OF RESPONSE:
ApiError {
  name: "ApiError",
  message: "User not found",
  status: 404,
  details: { layer: "service" }
}
*/