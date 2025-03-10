import { Router } from "express";
import { PostController } from "./post.controller";
import { authMiddleware } from "../../../shared/middlewares/auth.middleware";

export class PostRoutes {
  private router: Router;
  private postController: PostController;

  constructor() {
    this.router = Router();
    this.postController = new PostController();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get("/:id", this.postController.getPostById);

    this.router.use(authMiddleware);

    this.router.post("/", this.postController.createPost);

    this.router.get("/", this.postController.getPosts);

    this.router.put("/:id", this.postController.updatePost);

    this.router.delete("/:id", this.postController.deletePost);

    this.router.post("/:id/like", this.postController.toggleLike);
  }

  public getRouter(): Router {
    return this.router;
  }
}

export default new PostRoutes().getRouter();
