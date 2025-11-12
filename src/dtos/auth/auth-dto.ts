// src/dtos/auth/auth-dto.ts
export interface RegisterDTO {
  email: string;
  displayName?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface CreateEmailVerificationTokenDTO {
  userId: string;
  token: string;
  expiresAt: Date;
}

export interface CreatePasswordResetTokenDTO {
  userId: string;
  token: string;
  expiresAt: Date;
}

export interface CreateRefreshTokenDTO {
  userId: string;
  token: string;
  expiresAt: Date;
}

export interface RecordLoginAttemptDTO {
  userId: string;
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
  lockedUntil?: Date;
}

export interface VerifyEmailDTO {
  userId: string;
  token: string;
  password: string;
}

export interface ResetPasswordDTO {
  token: string;
  newPassword: string;
}
