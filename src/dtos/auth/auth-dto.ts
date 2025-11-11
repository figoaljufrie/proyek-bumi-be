// dtos/auth/auth-dto.ts
export interface RegisterDTO {
  email: string;
  displayName?: string;
}

export interface LoginDTO {
  email: string;
  displayName: string;
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