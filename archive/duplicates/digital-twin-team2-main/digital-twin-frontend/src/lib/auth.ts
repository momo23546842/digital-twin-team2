/**
 * Authentication utilities using httpOnly cookies
 * This replaces the previous localStorage-based authentication
 */

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  user?: any;
  error?: string;
}

/**
 * Login user and set httpOnly cookies
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
      credentials: "include", // Important: send cookies
    });

    if (!response.ok) {
      const error = await response.json();
      return { error: error.error || "Login failed" };
    }

    const userData = await response.json();
    return { user: userData };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Network error" };
  }
}

/**
 * Logout user and clear httpOnly cookies
 */
export async function logout(): Promise<void> {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include", // Important: send cookies
    });
  } catch (error) {
    console.error("Logout error:", error);
  }
  
  // Redirect to login page
  window.location.href = "/login";
}

/**
 * Refresh the authentication token
 */
export async function refreshToken(): Promise<boolean> {
  try {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include", // Important: send cookies
    });

    return response.ok;
  } catch (error) {
    console.error("Token refresh error:", error);
    return false;
  }
}
