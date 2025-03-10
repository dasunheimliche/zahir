import { PostRepository } from "../edata-access/post.repository";
import { CreatePostDto, UpdatePostDto, PostResponseDto } from "./post.dto";
import { ContentType } from "@prisma/client";
import { imageKitService } from "../../../shared/infraestructure/storage/imagekit.service";

export class PostService {
  private postRepository: PostRepository;

  constructor() {
    this.postRepository = new PostRepository();
  }

  async createPost(
    authorId: string,
    postData: CreatePostDto
  ): Promise<PostResponseDto> {
    this.validatePostByType(postData);

    const post = await this.postRepository.create(authorId, postData);
    return post as PostResponseDto;
  }

  async createPostWithMedia(
    authorId: string,
    postData: CreatePostDto,
    mediaBase64?: string,
    mediaFile?: { buffer: Buffer; originalname: string; mimetype: string }
  ): Promise<PostResponseDto> {
    this.validatePostByType(postData);

    if (
      (mediaBase64 || mediaFile) &&
      (postData.type === ContentType.IMAGE ||
        postData.type === ContentType.VIDEO)
    ) {
      try {
        let uploadResult;
        const folder = imageKitService.getUserFolder(authorId, "posts");

        if (mediaFile) {
          const tempPath = `/tmp/${Date.now()}_${mediaFile.originalname}`;
          const fs = require("fs").promises;
          await fs.writeFile(tempPath, mediaFile.buffer);

          const fileName = imageKitService.generateFileName(
            mediaFile.originalname,
            authorId
          );
          uploadResult = await imageKitService.uploadFile(
            tempPath,
            fileName,
            folder
          );
        } else if (mediaBase64) {
          const fileName = `post_${Date.now()}_${authorId}`;
          uploadResult = await imageKitService.uploadBase64(
            mediaBase64,
            fileName,
            folder
          );
        }

        if (uploadResult) {
          postData.mediaUrl = uploadResult.url;
        }
      } catch (error) {
        console.error("Error uploading media:", error);
        throw new Error("Failed to upload media for post");
      }
    }

    const post = await this.postRepository.create(authorId, postData);
    return post as PostResponseDto;
  }

  async getPostById(
    id: string,
    userId?: string
  ): Promise<PostResponseDto | null> {
    return this.postRepository.findById(id, userId);
  }

  async updatePost(
    id: string,
    authorId: string,
    postData: UpdatePostDto
  ): Promise<PostResponseDto> {
    const existingPost = await this.postRepository.findById(id);

    if (!existingPost) {
      throw new Error("Post not found");
    }

    if (existingPost.authorId !== authorId) {
      throw new Error("Not authorized to update this post");
    }

    if (postData.type && postData.type !== existingPost.type) {
      this.validatePostByType({
        ...existingPost,
        ...postData,
      });
    }

    const updatedPost = await this.postRepository.update(
      id,
      authorId,
      postData
    );
    return updatedPost as PostResponseDto;
  }

  async deletePost(id: string, authorId: string): Promise<void> {
    const existingPost = await this.postRepository.findById(id);

    if (!existingPost) {
      throw new Error("Post not found");
    }

    if (existingPost.authorId !== authorId) {
      throw new Error("Not authorized to delete this post");
    }

    if (
      existingPost.mediaUrl &&
      existingPost.mediaUrl.includes("imagekit.io")
    ) {
      try {
        const urlParts = existingPost.mediaUrl.split("/");
        const fileName = urlParts[urlParts.length - 1];
        const fileId = fileName.split(".")[0];

        await imageKitService.deleteFile(fileId).catch((err) => {
          console.warn(
            `Could not delete media file ${fileId} from ImageKit`,
            err
          );
        });
      } catch (error) {
        console.warn("Error deleting media file:", error);
      }
    }

    await this.postRepository.delete(id, authorId);
  }

  async getUserPosts(
    userId: string,
    currentUserId?: string
  ): Promise<PostResponseDto[]> {
    return this.postRepository.findUserPosts(userId, currentUserId);
  }

  async getFollowingPosts(userId: string): Promise<PostResponseDto[]> {
    return this.postRepository.findFollowingPosts(userId);
  }

  async getDiscoverPosts(userId: string): Promise<PostResponseDto[]> {
    return this.postRepository.findDiscoverPosts(userId);
  }

  async toggleLike(
    postId: string,
    userId: string
  ): Promise<{ liked: boolean }> {
    const post = await this.postRepository.findById(postId);

    if (!post) {
      throw new Error("Post not found");
    }

    return this.postRepository.toggleLike(postId, userId);
  }

  private validatePostByType(post: Partial<CreatePostDto>): void {
    switch (post.type) {
      case ContentType.IMAGE:
      case ContentType.VIDEO:
      case ContentType.YOUTUBE:
        if (!post.mediaUrl) {
          throw new Error(`A mediaUrl is required for ${post.type} posts`);
        }
        break;
      case ContentType.TEXT:
        if (!post.content) {
          throw new Error("Content is required for TEXT posts");
        }
        break;
      case ContentType.QUOTE:
        if (!post.content) {
          throw new Error("Content is required for QUOTE posts");
        }
        break;
    }
  }
}
