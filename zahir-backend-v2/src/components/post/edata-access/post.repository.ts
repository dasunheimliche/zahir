import {
  PrismaClient,
  Post,
  ContentStatus,
  InteractionType,
} from "@prisma/client";
import { CreatePostDto, UpdatePostDto } from "../domain/post.dto";

export class PostRepository {
  constructor(private prisma = new PrismaClient()) {}

  async create(authorId: string, postData: CreatePostDto): Promise<Post> {
    return this.prisma.post.create({
      data: {
        ...postData,
        authorId,
        publishedAt: new Date(),
      },
    });
  }

  async findById(id: string, userId?: string): Promise<any> {
    const post = await this.prisma.post.findUnique({
      where: {
        id,
        status: ContentStatus.PUBLISHED,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            profile: {
              select: {
                name: true,
                lastname: true,
                profileImg: true,
              },
            },
          },
        },
        _count: {
          select: {
            comments: true,
            interactions: {
              where: {
                type: InteractionType.LIKE,
              },
            },
          },
        },
      },
    });

    if (!post) return null;

    // If userId is provided, check if the user has liked the post
    let liked = false;
    if (userId) {
      const likeInteraction = await this.prisma.interaction.findUnique({
        where: {
          userId_postId_commentId_type: {
            userId,
            postId: id,
            commentId: null as any,
            type: InteractionType.LIKE,
          },
        },
      });
      liked = !!likeInteraction;
    }

    return {
      ...post,
      likesCount: post._count.interactions,
      commentsCount: post._count.comments,
      liked,
      _count: undefined,
    };
  }

  async update(
    id: string,
    authorId: string,
    data: UpdatePostDto
  ): Promise<Post> {
    return this.prisma.post.update({
      where: {
        id,
        authorId, // Ensure the user updating is the author
      },
      data,
    });
  }

  async delete(id: string, authorId: string): Promise<Post> {
    return this.prisma.post.update({
      where: {
        id,
        authorId, // Ensure the user deleting is the author
      },
      data: {
        status: ContentStatus.DELETED,
      },
    });
  }

  async findUserPosts(userId: string, currentUserId?: string): Promise<any[]> {
    const posts = await this.prisma.post.findMany({
      where: {
        authorId: userId,
        status: ContentStatus.PUBLISHED,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            profile: {
              select: {
                name: true,
                lastname: true,
                profileImg: true,
              },
            },
          },
        },
        _count: {
          select: {
            comments: true,
            interactions: {
              where: {
                type: InteractionType.LIKE,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Check if current user has liked each post
    if (currentUserId) {
      const postIds = posts.map((post) => post.id);
      const userLikes = await this.prisma.interaction.findMany({
        where: {
          userId: currentUserId,
          postId: { in: postIds },
          type: InteractionType.LIKE,
        },
      });

      const likedPostIds = new Set(userLikes.map((like) => like.postId));

      return posts.map((post) => ({
        ...post,
        likesCount: post._count.interactions,
        commentsCount: post._count.comments,
        liked: likedPostIds.has(post.id),
        _count: undefined,
      }));
    }

    return posts.map((post) => ({
      ...post,
      likesCount: post._count.interactions,
      commentsCount: post._count.comments,
      liked: false,
      _count: undefined,
    }));
  }

  async findFollowingPosts(userId: string): Promise<any[]> {
    // Get user's following connections
    const connections = await this.prisma.connection.findMany({
      where: {
        fromUserId: userId,
        type: "FOLLOW",
      },
      select: {
        toUserId: true,
      },
    });

    const followingIds = connections.map((conn) => conn.toUserId);

    const posts = await this.prisma.post.findMany({
      where: {
        authorId: { in: followingIds },
        status: ContentStatus.PUBLISHED,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            profile: {
              select: {
                name: true,
                lastname: true,
                profileImg: true,
              },
            },
          },
        },
        _count: {
          select: {
            comments: true,
            interactions: {
              where: {
                type: InteractionType.LIKE,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Check which posts the user has liked
    const postIds = posts.map((post) => post.id);
    const userLikes = await this.prisma.interaction.findMany({
      where: {
        userId,
        postId: { in: postIds },
        type: InteractionType.LIKE,
      },
    });

    const likedPostIds = new Set(userLikes.map((like) => like.postId));

    return posts.map((post) => ({
      ...post,
      likesCount: post._count.interactions,
      commentsCount: post._count.comments,
      liked: likedPostIds.has(post.id),
      _count: undefined,
    }));
  }

  async findDiscoverPosts(userId: string): Promise<any[]> {
    // Get user's following connections
    const connections = await this.prisma.connection.findMany({
      where: {
        fromUserId: userId,
        type: "FOLLOW",
      },
      select: {
        toUserId: true,
      },
    });

    const followingIds = [...connections.map((conn) => conn.toUserId), userId];

    const posts = await this.prisma.post.findMany({
      where: {
        authorId: { notIn: followingIds },
        status: ContentStatus.PUBLISHED,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            profile: {
              select: {
                name: true,
                lastname: true,
                profileImg: true,
              },
            },
          },
        },
        _count: {
          select: {
            comments: true,
            interactions: {
              where: {
                type: InteractionType.LIKE,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Check which posts the user has liked
    const postIds = posts.map((post) => post.id);
    const userLikes = await this.prisma.interaction.findMany({
      where: {
        userId,
        postId: { in: postIds },
        type: InteractionType.LIKE,
      },
    });

    const likedPostIds = new Set(userLikes.map((like) => like.postId));

    return posts.map((post) => ({
      ...post,
      likesCount: post._count.interactions,
      commentsCount: post._count.comments,
      liked: likedPostIds.has(post.id),
      _count: undefined,
    }));
  }

  async toggleLike(
    postId: string,
    userId: string
  ): Promise<{ liked: boolean }> {
    // Check if the interaction already exists
    const existingLike = await this.prisma.interaction.findUnique({
      where: {
        userId_postId_commentId_type: {
          userId,
          postId,
          commentId: null as any,
          type: InteractionType.LIKE,
        },
      },
    });

    if (existingLike) {
      // Unlike: delete the interaction
      await this.prisma.interaction.delete({
        where: {
          id: existingLike.id,
        },
      });
      return { liked: false };
    } else {
      // Like: create a new interaction
      await this.prisma.interaction.create({
        data: {
          type: InteractionType.LIKE,
          userId,
          postId,
        },
      });
      return { liked: true };
    }
  }
}
