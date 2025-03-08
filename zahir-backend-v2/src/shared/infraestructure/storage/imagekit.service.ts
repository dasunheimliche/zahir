import ImageKit from "imagekit";
import fs from "fs/promises";
import path from "path";
import { config } from "../config/config";

export interface ImageKitConfig {
  publicKey: string;
  privateKey: string;
  urlEndpoint: string;
}

export interface UploadResponse {
  url: string;
  fileId: string;
  name: string;
  width?: number;
  height?: number;
}

export class ImageKitService {
  private static instance: ImageKitService;
  private imagekit: ImageKit;

  private constructor() {
    this.imagekit = new ImageKit({
      publicKey:
        config.storage?.imagekit?.publicKey ||
        process.env.IMAGEKIT_PUBLIC_KEY ||
        "",
      privateKey:
        config.storage?.imagekit?.privateKey ||
        process.env.IMAGEKIT_PRIVATE_KEY ||
        "",
      urlEndpoint:
        config.storage?.imagekit?.urlEndpoint ||
        process.env.IMAGEKIT_URL_ENDPOINT ||
        "",
    });

    if (
      !this.imagekit.options.publicKey ||
      !this.imagekit.options.privateKey ||
      !this.imagekit.options.urlEndpoint
    ) {
      console.warn(
        "ImageKit not properly configured. Image upload functions will not work."
      );
    }
  }

  public static getInstance(): ImageKitService {
    if (!ImageKitService.instance) {
      ImageKitService.instance = new ImageKitService();
    }
    return ImageKitService.instance;
  }

  public async uploadFile(
    filePath: string,
    fileName: string,
    folder: string
  ): Promise<UploadResponse> {
    try {
      const fileContent = await fs.readFile(filePath);

      const result = await this.imagekit.upload({
        file: fileContent,
        fileName,
        folder,
      });

      await fs.unlink(filePath);

      return {
        url: result.url,
        fileId: result.fileId,
        name: result.name,
        width: result.width,
        height: result.height,
      };
    } catch (error) {
      console.error("Error uploading file to ImageKit:", error);
      throw new Error("Failed to upload image");
    }
  }

  public async uploadBase64(
    base64String: string,
    fileName: string,
    folder: string
  ): Promise<UploadResponse> {
    try {
      const result = await this.imagekit.upload({
        file: base64String,
        fileName,
        folder,
      });

      return {
        url: result.url,
        fileId: result.fileId,
        name: result.name,
        width: result.width,
        height: result.height,
      };
    } catch (error) {
      console.error("Error uploading base64 to ImageKit:", error);
      throw new Error("Failed to upload image");
    }
  }

  public async deleteFile(fileId: string): Promise<boolean> {
    try {
      await this.imagekit.deleteFile(fileId);
      return true;
    } catch (error) {
      console.error("Error deleting file from ImageKit:", error);
      throw new Error("Failed to delete image");
    }
  }

  public generateFileName(originalName: string, userId: string): string {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 9000) + 1000;
    const extension = path.extname(originalName) || ".jpg";

    return `${userId}_${timestamp}_${random}${extension}`;
  }

  public getUserFolder(
    userId: string,
    type: "posts" | "profile" | "cover"
  ): string {
    return `/users/${userId}/${type}`;
  }
}

export const imageKitService = ImageKitService.getInstance();
