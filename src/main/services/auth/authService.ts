import { TokenManager } from "./tokenManager";

interface RefreshTokenResponse {
  success: boolean;
  token?: string;
  refreshToken?: string;
}

export class AuthService {
  constructor(
    private refreshToken: () => Promise<any>,
    private fetchUserById: (id: number) => Promise<any>,
    private signOut: () => void,
    private navigate: (path: string) => void
  ) {}

  /**
   * Refresh user tokens
   */
  async refreshUser(): Promise<RefreshTokenResponse> {
    try {
      const response = await this.refreshToken();

      if (response?.success && response.token && response.refreshToken) {
        TokenManager.setTokens(response.token, response.refreshToken);
        return {
          success: true,
          token: response.token,
          refreshToken: response.refreshToken,
        };
      }

      return { success: false };
    } catch (error) {
      console.error("Error refreshing token:", error);
      return { success: false };
    }
  }

  /**
   * Fetch user data by ID
   */
  async fetchUserData(id: number): Promise<void> {
    try {
      await this.fetchUserById(id);
    } catch (error) {
      console.error("Error fetching user data:", error);
      throw error;
    }
  }

  /**
   * Handle authentication failure
   */
  handleAuthFailure(): void {
    TokenManager.clearTokens();
    this.signOut();
    this.navigate("/login");
  }
}
