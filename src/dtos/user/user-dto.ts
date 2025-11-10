import { $Enums } from "../../generated/prisma"

export interface UserDTO {
  email: string,
  passwordHash: string,
  displayName?: string,
  avatarUrl?: string,
  role: $Enums.UserRole
}