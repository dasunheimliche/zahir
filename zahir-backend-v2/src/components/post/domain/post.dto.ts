import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsEnum,
  ValidateIf,
} from "class-validator";
import { ContentType, ContentStatus } from "@prisma/client";
import { FromDto } from "../../../shared/types/main";

export class CreatePostDto {
  @IsEnum(ContentType)
  @IsNotEmpty()
  type: ContentType;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  subtitle?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @ValidateIf(
    (o) =>
      o.type === ContentType.IMAGE ||
      o.type === ContentType.VIDEO ||
      o.type === ContentType.YOUTUBE
  )
  @IsUrl()
  mediaUrl?: string;
}

export class UpdatePostDto {
  @IsEnum(ContentType)
  @IsOptional()
  type?: ContentType;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  subtitle?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsUrl()
  @IsOptional()
  mediaUrl?: string;

  @IsEnum(ContentStatus)
  @IsOptional()
  status?: ContentStatus;
}

export class PostResponseDto {
  id: string;
  type: ContentType;
  status: ContentStatus;
  title: string;
  subtitle?: string;
  content?: string;
  mediaUrl?: string;
  authorId: string;
  author?: {
    id: string;
    username: string;
    profile: {
      name: string;
      lastname: string;
      profileImg?: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  likesCount?: number;
  commentsCount?: number;
  liked?: boolean;
}

export type CreatePost = FromDto<CreatePostDto>;
export type UpdatePost = FromDto<UpdatePostDto>;
