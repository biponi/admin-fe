import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useLoginAuth from "../../pages/auth/hooks/useLoginAuth";
import { TokenManager } from "../services/auth/tokenManager";
import { AuthService } from "../services/auth/authService";
import { useNotifications } from "../../notification";
import { useSelector } from "react-redux";
import { setTopicsForNotifications } from "../../utils/helperFunction";

export const useAuthInit = () => {
  const {
    initializeFCM,
    fetchUnreadCount,
    fetchNotifications,
    setupMessageListener,
  } = useNotifications();
  const lastInitializedUserId = useRef<string | null>(null);
  const user = useSelector((state: any) => state?.user);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const { token, refreshToken, fetchUserById, signOut } = useLoginAuth();
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

  useEffect(() => {
    // Early return if no user
    if (!user?.id) return;

    // Skip if we've already initialized for this specific user
    if (lastInitializedUserId.current === user.id) return;

    const init = () => {
      const topics = setTopicsForNotifications(user?.permissions || []);
      initializeFCM(topics);
      fetchUnreadCount();
      fetchNotifications();
      setupMessageListener();
    };

    init();
    lastInitializedUserId.current = user.id;

    // Set up interval
    const interval = setInterval(fetchUnreadCount, 300000);

    // Cleanup function
    return () => {
      clearInterval(interval);
    };
    //eslint-disable-next-line
  }, [user?.id]);

  return { isLoading, isAuth, user };
};
