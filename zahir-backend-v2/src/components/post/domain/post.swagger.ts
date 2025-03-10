export const PostSchemas = {
  CreatePost: {
    type: "object",
    properties: {
      type: {
        type: "string",
        enum: ["TEXT", "IMAGE", "VIDEO", "YOUTUBE", "QUOTE"],
        description: "Type of the post content",
      },
      title: {
        type: "string",
        example: "My First Post",
        description: "Post title",
      },
      subtitle: {
        type: "string",
        example: "An interesting subtitle",
        description: "Optional subtitle",
      },
      content: {
        type: "string",
        example: "This is the main content of my post.",
        description: "Text content of the post",
      },
      mediaUrl: {
        type: "string",
        example: "https://example.com/image.jpg",
        description: "URL to media (image, video)",
      },
      mediaBase64: {
        type: "string",
        description: "Base64 encoded media content (for uploads)",
      },
    },
    required: ["type", "title"],
  },
  UpdatePost: {
    type: "object",
    properties: {
      type: {
        type: "string",
        enum: ["TEXT", "IMAGE", "VIDEO", "YOUTUBE", "QUOTE"],
        description: "Type of the post content",
      },
      title: {
        type: "string",
        example: "Updated Post Title",
        description: "Post title",
      },
      subtitle: {
        type: "string",
        example: "Updated subtitle",
        description: "Optional subtitle",
      },
      content: {
        type: "string",
        example: "Updated content of my post.",
        description: "Text content of the post",
      },
      mediaUrl: {
        type: "string",
        example: "https://example.com/updated-image.jpg",
        description: "URL to media (image, video)",
      },
      status: {
        type: "string",
        enum: ["PUBLISHED", "DELETED"],
        description: "Status of the post",
      },
    },
  },
  PostResponse: {
    type: "object",
    properties: {
      id: {
        type: "string",
        example: "123e4567-e89b-12d3-a456-426614174000",
        description: "Unique identifier for the post",
      },
      type: {
        type: "string",
        enum: ["TEXT", "IMAGE", "VIDEO", "YOUTUBE", "QUOTE"],
        description: "Type of post content",
      },
      status: {
        type: "string",
        enum: ["PUBLISHED", "DELETED"],
        description: "Status of the post",
      },
      title: {
        type: "string",
        example: "My First Post",
        description: "Post title",
      },
      subtitle: {
        type: "string",
        nullable: true,
        example: "An interesting subtitle",
        description: "Optional subtitle",
      },
      content: {
        type: "string",
        nullable: true,
        example: "This is the main content of my post.",
        description: "Text content of the post",
      },
      mediaUrl: {
        type: "string",
        nullable: true,
        example: "https://example.com/image.jpg",
        description: "URL to media (image, video)",
      },
      authorId: {
        type: "string",
        example: "123e4567-e89b-12d3-a456-426614174000",
        description: "ID of the post author",
      },
      author: {
        type: "object",
        properties: {
          id: {
            type: "string",
            example: "123e4567-e89b-12d3-a456-426614174000",
          },
          username: {
            type: "string",
            example: "john_doe",
          },
          profile: {
            type: "object",
            properties: {
              name: {
                type: "string",
                example: "John",
              },
              lastname: {
                type: "string",
                example: "Doe",
              },
              profileImg: {
                type: "string",
                nullable: true,
                example: "https://example.com/profile.jpg",
              },
            },
          },
        },
      },
      createdAt: {
        type: "string",
        format: "date-time",
        description: "Post creation timestamp",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        description: "Last post update timestamp",
      },
      publishedAt: {
        type: "string",
        format: "date-time",
        nullable: true,
        description: "When the post was published",
      },
      likesCount: {
        type: "integer",
        example: 42,
        description: "Number of likes on the post",
      },
      commentsCount: {
        type: "integer",
        example: 7,
        description: "Number of comments on the post",
      },
      liked: {
        type: "boolean",
        description: "Whether the current user has liked this post",
      },
    },
  },
  LikeResponse: {
    type: "object",
    properties: {
      liked: {
        type: "boolean",
        description: "Whether the post is now liked by the user",
      },
    },
  },
  ErrorResponse: {
    type: "object",
    properties: {
      error: {
        type: "string",
        example: "Post not found",
      },
      details: {
        type: "string",
        nullable: true,
        example: "Additional error information",
      },
    },
  },
};

export const PostPaths = {
  "/api/posts": {
    post: {
      tags: ["Posts"],
      summary: "Create a new post",
      security: [
        {
          bearerAuth: [],
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/CreatePost",
            },
          },
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                type: {
                  type: "string",
                  enum: ["TEXT", "IMAGE", "VIDEO", "YOUTUBE", "QUOTE"],
                },
                title: {
                  type: "string",
                },
                subtitle: {
                  type: "string",
                },
                content: {
                  type: "string",
                },
                media: {
                  type: "string",
                  format: "binary",
                  description: "Media file to upload (image/video)",
                },
              },
              required: ["type", "title"],
            },
          },
        },
      },
      responses: {
        "201": {
          description: "Post successfully created",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/PostResponse",
              },
            },
          },
        },
        "400": {
          description: "Validation error",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        "401": {
          description: "Unauthorized",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        "500": {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
      },
    },
    get: {
      tags: ["Posts"],
      summary: "Get posts",
      security: [
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          name: "userId",
          in: "query",
          required: false,
          schema: {
            type: "string",
          },
          description: "User ID to fetch posts for (defaults to current user)",
        },
        {
          name: "feed",
          in: "query",
          required: false,
          schema: {
            type: "string",
            enum: ["following", "discover"],
          },
          description: "Type of feed to return",
        },
      ],
      responses: {
        "200": {
          description: "List of posts",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/PostResponse",
                },
              },
            },
          },
        },
        "401": {
          description: "Unauthorized",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        "500": {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
      },
    },
  },
  "/api/posts/{id}": {
    get: {
      tags: ["Posts"],
      summary: "Get a specific post by ID",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: {
            type: "string",
          },
          description: "Post ID",
        },
      ],
      responses: {
        "200": {
          description: "Post details",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/PostResponse",
              },
            },
          },
        },
        "404": {
          description: "Post not found",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        "500": {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
      },
    },
    put: {
      tags: ["Posts"],
      summary: "Update a post",
      security: [
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: {
            type: "string",
          },
          description: "Post ID",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/UpdatePost",
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Post successfully updated",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/PostResponse",
              },
            },
          },
        },
        "400": {
          description: "Validation error",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        "401": {
          description: "Unauthorized",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        "403": {
          description: "Forbidden - Not the post author",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        "404": {
          description: "Post not found",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        "500": {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
      },
    },
    delete: {
      tags: ["Posts"],
      summary: "Delete a post",
      security: [
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: {
            type: "string",
          },
          description: "Post ID",
        },
      ],
      responses: {
        "200": {
          description: "Post successfully deleted",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    example: "Post deleted successfully",
                  },
                },
              },
            },
          },
        },
        "401": {
          description: "Unauthorized",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        "403": {
          description: "Forbidden - Not the post author",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        "404": {
          description: "Post not found",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        "500": {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
      },
    },
  },
  "/api/posts/{id}/like": {
    post: {
      tags: ["Posts"],
      summary: "Toggle like on a post",
      security: [
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: {
            type: "string",
          },
          description: "Post ID",
        },
      ],
      responses: {
        "200": {
          description: "Like status toggled",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/LikeResponse",
              },
            },
          },
        },
        "401": {
          description: "Unauthorized",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        "404": {
          description: "Post not found",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
        "500": {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
            },
          },
        },
      },
    },
  },
};
