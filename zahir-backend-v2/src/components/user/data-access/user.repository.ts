import { PrismaClient, User, UserRole, Prisma } from "@prisma/client";
import { CreateUserDto } from "../../auth/domain/auth.dto";

export class UserRepository {
  constructor(private prisma = new PrismaClient()) {}

  async createUser(userData: CreateUserDto): Promise<User> {
    const {
      username,
      email,
      password: passwordHash,
      name,
      lastname,
    } = userData;

    return this.prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        role: UserRole.USER,
        profile: {
          name,
          lastname,
        },
      },
    });
  }

  async findBy(
    criteria: Partial<Omit<User, "profile">> & {
      profile?: Partial<User["profile"]>;
    }
  ): Promise<User | null> {
    const { profile, ...directCriteria } = criteria;

    const where: any = { ...directCriteria };

    if (profile) {
      where.profile = profile;
    }

    return this.prisma.user.findFirst({ where });
  }

  async update(
    userId: string,
    data: Partial<Omit<User, "id" | "profile">> & {
      profile?: Partial<User["profile"]>;
    }
  ): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: data as Prisma.UserUpdateInput,
    });
  }

  //   async findByUsername(username: string): Promise<User | null> {
  //     return this.prisma.user.findUnique({
  //       where: { username },
  //     });
  //   }

  //   async findByEmail(email: string): Promise<User | null> {
  //     return this.prisma.user.findUnique({
  //       where: { email },
  //     });
  //   }

  async findByEmailOrUsername(
    email: string,
    username: string
  ): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });
  }

  //   async updateLastLogin(userId: string): Promise<void> {
  //     await this.prisma.user.update({
  //       where: { id: userId },
  //       data: { lastLoginAt: new Date() },
  //     });
  //   }

  //   async updateUserRole(userId: string, role: UserRole) {
  //     return this.prisma.user.update({
  //       where: { id: userId },
  //       data: { role },
  //     });
  //   }

  async deactivateUser(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        refreshTokens: {
          updateMany: {
            where: { userId },
            data: { isRevoked: true },
          },
        },
      },
    });
  }

  async activateUser(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
    });
  }
}
