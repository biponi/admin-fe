import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useLoginAuth from "../../pages/auth/hooks/useLoginAuth";
import { TokenManager } from "../services/auth/tokenManager";
import { AuthService } from "../services/auth/authService";

export const useAuthInit = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const { token, refreshToken, fetchUserById, signOut, user } = useLoginAuth();
  const navigate = useNavigate();

  const authService = new AuthService(
    refreshToken,
    fetchUserById,
    signOut,
    navigate
  );

  useEffect(() => {
    const initAuth = async () => {
      try {
        const authToken = TokenManager.getAccessToken();
        const refreshTokenValue = TokenManager.getRefreshToken();

        // No tokens at all - redirect to login
        if (!authToken && !refreshTokenValue) {
          setIsAuth(false);
          navigate("/login");
          setIsLoading(false);
          return;
        }

        // Check access token
        if (authToken) {
          const decoded = TokenManager.decodeToken(authToken);

          if (decoded && TokenManager.isTokenValid(decoded.exp)) {
            // Access token is valid - fetch user data
            await authService.fetchUserData(decoded.id);
            setIsAuth(true);
            setIsLoading(false);
            return;
          }
        }

        // Access token is expired or missing, try refresh token
        if (refreshTokenValue) {
          const refreshResult = await authService.refreshUser();

          if (refreshResult.success && refreshResult.token) {
            // Refresh successful - decode new token and fetch user
            const newDecoded = TokenManager.decodeToken(refreshResult.token);

            if (newDecoded && TokenManager.isTokenValid(newDecoded.exp)) {
              await authService.fetchUserData(newDecoded.id);
              setIsAuth(true);
              setIsLoading(false);
              return;
            }
          }
        }

        // Both tokens failed - sign out and redirect
        authService.handleAuthFailure();
        setIsAuth(false);
        setIsLoading(false);
      } catch (error) {
        console.error("Error during authentication initialization:", error);
        authService.handleAuthFailure();
        setIsAuth(false);
        setIsLoading(false);
      }
    };

    initAuth();
    //eslint-disable-next-line
  }, [token]); // Only re-run when token changes

  return { isLoading, isAuth, user };
};
