import { PrismaClient, User, UserRole } from "@prisma/client";
import { CreateUserDto } from "../domain/auth.dto";

export class AuthRepository {
  constructor(private prisma = new PrismaClient()) {}

  async findRefreshTokenByToken(token: string) {
    return this.prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  async saveRefreshToken(userId: string, token: string, expiresAt: Date) {
    return this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });
  }

  async revokeRefreshToken(token: string) {
    return this.prisma.refreshToken.update({
      where: { token },
      data: { isRevoked: true },
    });
  }

  async revokeAllUserRefreshTokens(userId: string) {
    return this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });
  }

  async cleanExpiredRefreshTokens() {
    return this.prisma.refreshToken.deleteMany({
      where: {
        OR: [{ expiresAt: { lt: new Date() } }, { isRevoked: true }],
      },
    });
  }
}
