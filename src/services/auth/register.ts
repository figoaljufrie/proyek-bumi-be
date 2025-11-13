import { RegisterDTO } from "../../dtos/auth/auth-dto";
import { AuthCrud } from "../../repositories/auth/crud";
import { SendEmailService } from "./send-email";
import { ApiError } from "../../utils/response/api-error";

export class RegisterService {
  private auth = new AuthCrud();
  private sendEmail = new SendEmailService();

  public async register(data: RegisterDTO) {
    if (!data?.email)
      throw new ApiError("Email is required", 400, { layer: "service" });

    const existingUser = await this.auth.findByEmail(data.email);
    if (existingUser)
      throw new ApiError("Email already registered", 409, {
        layer: "service",
      });

    const user = await this.auth.register(data);
    if (!user || !user.id || !user.email)
      throw new ApiError("User registration failed", 500, {
        layer: "service",
      });

    const { message } = await this.sendEmail.sendVerificationEmail(
      user.id,
      user.email
    ).catch((err) => {
      throw new ApiError("Failed to send verification email", 500, {
        layer: "service",
        error: err.message,
      });
    });

    return {
      userId: user.id,
      message: message ?? "Registration successful. Please verify your email.",
    };
  }
}