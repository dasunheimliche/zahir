export interface DatabaseConfig {
  url: string;
}

export interface JwtConfig {
  accessSecret: string;
  refreshSecret: string;
  accessExpiration: string;
  refreshExpiration: string;
}

export interface SecurityConfig {
  saltRounds: number;
  cookieSecret: string;
}

export interface StorageConfig {
  imagekit: {
    publicKey: string;
    privateKey: string;
    urlEndpoint: string;
  };
}

export interface AppConfig {
  port: number;
  isDevelopment: boolean;
  isProduction: boolean;
  database: DatabaseConfig;
  storage: StorageConfig;
  jwt: JwtConfig;
  security: SecurityConfig;
}

export class Config {
  private static instance: Config;
  private config: AppConfig;

  private constructor() {
    this.config = {
      port: parseInt(process.env.PORT || "3000", 10),
      isDevelopment: process.env.NODE_ENV === "development",
      isProduction: process.env.NODE_ENV === "production",

      database: {
        url: process.env.DATABASE_URL || "mongodb://localhost:27017/mydb",
      },

      storage: {
        imagekit: {
          publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "",
          privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
          urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "",
        },
      },

      jwt: {
        accessSecret: process.env.JWT_ACCESS_SECRET || "default-access-secret",
        refreshSecret:
          process.env.JWT_REFRESH_SECRET || "default-refresh-secret",
        accessExpiration: process.env.JWT_ACCESS_EXPIRATION || "15m",
        refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || "7d",
      },

      security: {
        saltRounds: parseInt(process.env.SALT_ROUNDS || "10", 10),
        cookieSecret: process.env.COOKIE_SECRET || "default-cookie-secret",
      },
    };

    this.validateConfig();
  }

  private validateConfig(): void {
    if (this.config.isProduction) {
      if (
        this.config.jwt.accessSecret === "default-access-secret" ||
        this.config.jwt.refreshSecret === "default-refresh-secret"
      ) {
        throw new Error("Default secrets cannot be used in production");
      }

      if (!this.config.database.url) {
        throw new Error("Database URL is required in production");
      }
    }
  }

  public static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  public get(): AppConfig {
    return this.config;
  }
}

export const requiredEnvVariables = `
  # App Configuration
  PORT=3000
  NODE_ENV=development
  
  # Database Configuration
  DATABASE_URL=mongodb://localhost:27017/mydb
  
  # JWT Configuration
  JWT_ACCESS_SECRET=my-secure-access-secret-key
  JWT_REFRESH_SECRET=my-secure-refresh-secret-key
  JWT_ACCESS_EXPIRATION=15m
  JWT_REFRESH_EXPIRATION=7d
  
  # Security Configuration
  SALT_ROUNDS=10
  `;

export const config = Config.getInstance().get();
