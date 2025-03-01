import { AuthRepository } from "../data-access/auth.repository";
import { UserRepository } from "../../user/data-access/user.repository";
import { JwtService } from "../../../shared/infraestructure/security/jwt.service";
import { PasswordService } from "../../../shared/infraestructure/security/password.service";
import { AuthResponse, CreateUserDto, Login } from "./auth.dto";

export class AuthService {
  private authRepository: AuthRepository;
  private passwordService: PasswordService;
  private jwtService: JwtService;
  private userRepository: UserRepository;

  constructor() {
    this.authRepository = new AuthRepository();
    this.userRepository = new UserRepository();
    this.passwordService = new PasswordService();
    this.jwtService = new JwtService();
  }

  async register(userData: CreateUserDto): Promise<AuthResponse> {
    const existingUser = await this.userRepository.findByEmailOrUsername(
      userData.email,
      userData.username
    );

    if (existingUser) {
      const field =
        existingUser.email === userData.email ? "email" : "username";
      throw new Error(`${field} already exists`);
    }

    const passwordHash = await this.passwordService.hash(userData.password);

    const user = await this.userRepository.createUser({
      ...userData,
      password: passwordHash,
    });

    const tokens = await this.jwtService.generateTokens(user);

    await this.userRepository.update(user.id, { lastLoginAt: new Date() });

    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  async login(loginData: Login): Promise<AuthResponse> {
    const user = await this.userRepository.findBy({
      username: loginData.username,
    });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await this.passwordService.verify(
      loginData.password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    if (!user.isActive) {
      throw new Error("Account is disabled");
    }

    const tokens = await this.jwtService.generateTokens(user);

    await this.userRepository.update(user.id, { lastLoginAt: new Date() });

    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      return await this.jwtService.refreshAccessToken(refreshToken);
    } catch (error) {
      throw new Error("Invalid refresh token");
    }
  }

  async logout(refreshToken: string) {
    try {
      await this.jwtService.revokeRefreshToken(refreshToken);
      return true;
    } catch (error) {
      throw new Error("Error during logout");
    }
  }

  async validateToken(token: string) {
    try {
      return await this.jwtService.verifyAccessToken(token);
    } catch (error) {
      throw new Error("Invalid access token");
    }
  }
}
