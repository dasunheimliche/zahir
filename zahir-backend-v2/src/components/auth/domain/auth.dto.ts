import { IsString, IsEmail, IsNotEmpty, MinLength } from "class-validator";
import { UserRole, User } from "@prisma/client";
import { FromDto } from "../../../shared/types/main";

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  lastname: string;
}

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  username: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export type CreateUser = FromDto<CreateUserDto>;

export type Login = FromDto<LoginDto>;

export interface UserProfile {
  name: string;
  lastname: string;
  bio?: string | null;
  mainPanelImg?: string | null;
  profileImg?: string | null;
}

export interface AuthResponse {
  user: {
    id: string;
    username: string;
    email: string;
    role: UserRole;
    profile: UserProfile;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt: Date | null;
    isActive: boolean;
  };
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface TokenPayload {
  userId: string;
  username: string;
  role: UserRole;
}
