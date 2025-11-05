import { decodeToken } from "react-jwt";

interface DecodedToken {
  id: number;
  exp: number;
}

export class TokenManager {
  private static ACCESS_TOKEN_KEY = "token";
  private static REFRESH_TOKEN_KEY = "refreshToken";

  /**
   * Get access token from localStorage
   */
  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Get refresh token from localStorage
   */
  static getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Store tokens in localStorage
   */
  static setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  /**
   * Clear tokens from localStorage
   */
  static clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Decode JWT token
   */
  static decodeToken(token: string): DecodedToken | null {
    return decodeToken<DecodedToken>(token);
  }

  /**
   * Check if token is still valid (not expired)
   */
  static isTokenValid(expTimestamp: number): boolean {
    return expTimestamp * 1000 > Date.now();
  }

  /**
   * Get token expiration time in milliseconds
   */
  static getTokenExpiration(token: string): number | null {
    const decoded = this.decodeToken(token);
    return decoded ? decoded.exp * 1000 : null;
  }
}
