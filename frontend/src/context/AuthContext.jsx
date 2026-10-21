import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  registerUser,
  loginUser,
  getCurrentUser,
} from "../services/authService.js";

const AuthContext = createContext(null);
const TOKEN_KEY = "token";

// Get a readable message without losing the original Axios error.
function getErrorMessage(error, fallback) {
  return error.response?.data?.message || error.message || fallback;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Reuse the initial verification request during React Strict Mode checks.
  const initialCheckRef = useRef(null);

  // A user is authenticated only after a successful login or server verification.
  const isAuthenticated = Boolean(user);

  // Verify an existing token with the backend when the app starts.
  useEffect(() => {
    let isActive = true;

    async function verifySession() {
      const token = localStorage.getItem(TOKEN_KEY);

      if (!token) {
        if (isActive) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      if (!initialCheckRef.current) {
        initialCheckRef.current = (async () => {
          try {
            const result = await getCurrentUser();

            if (!result?.user) {
              throw new Error(
                "The current-user endpoint returned an unexpected response.",
              );
            }

            return { user: result.user, error: null };
          } catch (requestError) {
            return { user: null, error: requestError };
          }
        })();
      }

      const result = await initialCheckRef.current;

      if (!isActive) return;

      if (result.user) {
        setUser(result.user);
        setError(null);
      } else {
        setUser(null);

        const status = result.error?.response?.status;

        if (status === 401 || status === 403) {
          // The server rejected the saved token.
          localStorage.removeItem(TOKEN_KEY);
        }

        // For network/server errors, keep the token so the user can retry.
        setError(
          getErrorMessage(result.error, "Unable to verify your session."),
        );
      }

      setLoading(false);
    }

    verifySession().catch((unexpectedError) => {
      if (isActive) {
        setUser(null);
        setError(
          getErrorMessage(
            unexpectedError,
            "Unable to check your authentication status.",
          ),
        );
        setLoading(false);
      }
    });

    return () => {
      isActive = false;
    };
  }, []);

  // Sign in and save the token only after validating the server response.
  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);

    try {
      const result = await loginUser(credentials);
      const receivedUser = result?.user;
      const receivedToken = result?.token;

      if (
        !receivedUser ||
        typeof receivedToken !== "string" ||
        !receivedToken.trim()
      ) {
        throw new Error(
          "The login response must include a user and an access token.",
        );
      }

      localStorage.setItem(TOKEN_KEY, receivedToken);
      setUser(receivedUser);
      setError(null);

      return {
        success: true,
        user: receivedUser,
        redirectTo: "/",
      };
    } catch (loginError) {
      setUser(null);
      localStorage.removeItem(TOKEN_KEY);

      const message = getErrorMessage(
        loginError,
        "Unable to log in. Please try again.",
      );

      setError(message);

      return {
        success: false,
        message,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Register a new account. Registration does not automatically sign in.
  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await registerUser(userData);

      return {
        success: true,
        message: result?.message || "Registration successful. Please log in.",
        data: result,
        redirectTo: "/login",
      };
    } catch (registrationError) {
      const message = getErrorMessage(
        registrationError,
        "Unable to register. Please try again.",
      );

      setError(message);

      return {
        success: false,
        message,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Local logout. No server logout endpoint is assumed.
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      isAuthenticated,
      login,
      register,
      logout,
      clearError,
    }),
    [
      user,
      loading,
      error,
      isAuthenticated,
      login,
      register,
      logout,
      clearError,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error("useAuth must be used inside an AuthProvider.");
  }

  return context;
}
