import { RegisterDTO } from "../../dtos/auth/auth-dto";
import { AuthCrud } from "../../repositories/auth/crud";
import { SendEmailService } from "./send-email";

export class RegisterService {
  private auth = new AuthCrud();
  private sendEmail = new SendEmailService();

  public async register(data: RegisterDTO) {
    const existingUser = await this.auth.findByEmail(data.email);
    if (existingUser) throw new Error("Email already registered");

    const user = await this.auth.register(data);

    const { message } = await this.sendEmail.sendVerificationEmail(
      user.id,
      user.email
    );

    return {
      userId: user.id,
      message: message ?? "Registration successful. Please verify your email.",
    };
  }
}
