import { Request, Response } from "express";
import { RegisterService } from "../../services/auth/register";
import {
  errorResponse,
  successResponse,
} from "../../utils/response/response-handler";

export class RegisterController {
  private registerService = new RegisterService();

  public register = async (req: Request, res: Response) => {
    try {
      const result = await this.registerService.register(req.body);

      const { email } = req.body;

      return successResponse(
        res,
        "User registered successfully",
        {
          input: { email },
          result,
        },
        201
      );
    } catch (err) {
      return errorResponse(res, "Failed to register user", 400, err);
    }
  };
}
