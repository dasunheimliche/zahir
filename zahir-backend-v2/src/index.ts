import { App } from "./app";
import { prismaService } from "./shared/infraestructure/config/prisma.config";

let server: App;

async function startServer() {
  try {
    server = new App();
    await server.start();
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}

async function gracefulShutdown(signal: string) {
  console.log(`\nReceived ${signal}. Starting graceful shutdown...`);

  try {
    await prismaService.disconnect();
    console.log("Database connections closed.");

    setTimeout(() => {
      console.log("Shutting down application...");
      process.exit(0);
    }, 1000);
  } catch (error) {
    console.error("Error during graceful shutdown:", error);
    process.exit(1);
  }
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  gracefulShutdown("uncaughtException");
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  gracefulShutdown("unhandledRejection");
});

startServer();
