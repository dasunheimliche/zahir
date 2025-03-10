import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { config } from "./shared/infraestructure/config/config";
import { prismaService } from "./shared/infraestructure/config/prisma.config";

import authRoutes from "./components/auth/entry-points/api/auth.routes";
import postRoutes from "./components/post/entry-point/post.routes";

import swaggerUi from "swagger-ui-express";
import { specs } from "./shared/infraestructure/config/swagger.config";
import fileUpload from "express-fileupload";

export class App {
  private app: Application;

  constructor() {
    this.app = express();
    this.setupMiddlewares();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddlewares(): void {
    this.app.use(helmet());

    this.app.use(
      cors({
        origin: process.env.CORS_ORIGIN || "*",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
      })
    );

    this.app.use(
      fileUpload({
        limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max file size
        abortOnLimit: true,
        useTempFiles: false,
        createParentPath: true,
        debug: config.isDevelopment,
      })
    );

    this.app.use(express.json({ limit: "5mb" }));
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser(config.security.cookieSecret));

    if (config.isDevelopment) {
      this.app.use(morgan("dev"));
    }

    this.app.get("/health", (_req, res) => {
      res.json({ status: "ok", timestamp: new Date().toISOString() });
    });
  }

  private setupRoutes(): void {
    this.app.use("/api/auth", authRoutes);
    this.app.use("/api/posts", postRoutes);
    this.app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));
  }

  private setupErrorHandling(): void {
    this.app.use((_req, res) => {
      res.status(404).json({ error: "Not Found" });
    });

    this.app.use((err: any, _req: any, res: any, _next: any) => {
      console.error("Error:", err);

      const statusCode = err.statusCode || 500;
      const message = config.isDevelopment
        ? err.message
        : "Internal Server Error";

      res.status(statusCode).json({
        error: message,
        ...(config.isDevelopment && { stack: err.stack }),
      });
    });
  }

  public async start(): Promise<void> {
    try {
      await prismaService.connect();

      const port = config.port;
      this.app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
        console.log(`Environment: ${process.env.NODE_ENV}`);
      });
    } catch (error) {
      console.error("Failed to start server:", error);
      process.exit(1);
    }
  }

  public getApp(): Application {
    return this.app;
  }
}

if (require.main === module) {
  const app = new App();
  app.start().catch(console.error);
}

export default App;
