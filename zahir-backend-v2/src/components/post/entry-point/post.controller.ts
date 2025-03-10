import { Request, Response } from "express";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { CreatePostDto, UpdatePostDto } from "../domain/post.dto";
import { PostService } from "../domain/post.service";
import { ContentType } from "@prisma/client";

export class PostController {
  private postService: PostService;

  constructor() {
    this.postService = new PostService();
  }

  createPost = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }

      const postDto = plainToInstance(CreatePostDto, req.body);
      const errors = await validate(postDto);

      if (errors.length > 0) {
        res.status(400).json({
          error: "Validation failed",
          details: errors.map((error) => ({
            property: error.property,
            constraints: error.constraints,
          })),
        });
        return;
      }

      if (
        req.files &&
        (postDto.type === ContentType.IMAGE ||
          postDto.type === ContentType.VIDEO)
      ) {
        const mediaFile = req.files.media;

        if (Array.isArray(mediaFile)) {
          res
            .status(400)
            .json({ error: "Only one media file can be uploaded" });
          return;
        }

        const post = await this.postService.createPostWithMedia(
          userId,
          postDto,
          undefined,
          {
            buffer: mediaFile.data,
            originalname: mediaFile.name,
            mimetype: mediaFile.mimetype,
          }
        );

        res.status(201).json(post);
        return;
      }

      if (
        req.body.mediaBase64 &&
        (postDto.type === ContentType.IMAGE ||
          postDto.type === ContentType.VIDEO)
      ) {
        const post = await this.postService.createPostWithMedia(
          userId,
          postDto,
          req.body.mediaBase64
        );

        res.status(201).json(post);
        return;
      }

      const post = await this.postService.createPost(userId, postDto);
      res.status(201).json(post);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  getPosts = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }

      const targetUserId = (req.query.userId as string) || userId;
      const feedType = req.query.feed as "following" | "discover" | undefined;

      if (feedType === "following") {
        const posts = await this.postService.getFollowingPosts(userId);
        res.json(posts);
        return;
      }

      if (feedType === "discover") {
        const posts = await this.postService.getDiscoverPosts(userId);
        res.json(posts);
        return;
      }

      const posts = await this.postService.getUserPosts(targetUserId, userId);
      res.json(posts);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  getPostById = async (req: Request, res: Response): Promise<void> => {
    try {
      const postId = req.params.id;
      const userId = req.user?.userId;

      const post = await this.postService.getPostById(postId, userId);

      if (!post) {
        res.status(404).json({ error: "Post not found" });
        return;
      }

      res.json(post);
    } catch (error) {
      this.handleError(error, res);
    }
  };

  updatePost = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }

      const postId = req.params.id;
      const updatePostDto = plainToInstance(UpdatePostDto, req.body);
      const errors = await validate(updatePostDto);

      if (errors.length > 0) {
        res.status(400).json({
          error: "Validation failed",
          details: errors.map((error) => ({
            property: error.property,
            constraints: error.constraints,
          })),
        });
        return;
      }

      try {
        const updatedPost = await this.postService.updatePost(
          postId,
          userId,
          updatePostDto
        );
        res.json(updatedPost);
      } catch (error: any) {
        if (error.message === "Not authorized to update this post") {
          res.status(403).json({ error: error.message });
        } else if (error.message === "Post not found") {
          res.status(404).json({ error: error.message });
        } else {
          throw error;
        }
      }
    } catch (error) {
      this.handleError(error, res);
    }
  };

  deletePost = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }

      const postId = req.params.id;

      try {
        await this.postService.deletePost(postId, userId);
        res.json({ message: "Post deleted successfully" });
      } catch (error: any) {
        if (error.message === "Not authorized to delete this post") {
          res.status(403).json({ error: error.message });
        } else if (error.message === "Post not found") {
          res.status(404).json({ error: error.message });
        } else {
          throw error;
        }
      }
    } catch (error) {
      this.handleError(error, res);
    }
  };

  toggleLike = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: "Authentication required" });
        return;
      }

      const postId = req.params.id;

      try {
        const result = await this.postService.toggleLike(postId, userId);
        res.json(result);
      } catch (error: any) {
        if (error.message === "Post not found") {
          res.status(404).json({ error: error.message });
        } else {
          throw error;
        }
      }
    } catch (error) {
      this.handleError(error, res);
    }
  };

  private handleError(error: any, res: Response): void {
    console.error("Post error:", error);

    if (error.name === "PrismaClientKnownRequestError") {
      res.status(400).json({
        error: "Database error",
        details: error.message,
      });
      return;
    }

    res.status(500).json({
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}
