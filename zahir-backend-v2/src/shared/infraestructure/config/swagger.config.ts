import swaggerJsdoc from "swagger-jsdoc";
import {
  AuthPaths,
  AuthSchemas,
} from "../../../components/auth/domain/auth.swagger";

import {
  PostPaths,
  PostSchemas,
} from "../../../components/post/domain/post.swagger";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Express API with Swagger",
      version: "1.0.0",
      description: "A simple Express API using Swagger for documentation",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
    components: {
      schemas: {
        ...AuthSchemas,
        ...PostSchemas,
      },
    },
    paths: {
      ...AuthPaths,
      ...PostPaths,
    },
  },
  apis: [],
};

export const specs = swaggerJsdoc(options);
