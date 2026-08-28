export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: "citizen" | "field_worker" | "admin";
  organization?: string;
  createdAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

class ApiClient {
  private getTokens(): AuthTokens | null {
    if (typeof window === "undefined") return null;
    const accessToken = localStorage.getItem("paw_access_token");
    const refreshToken = localStorage.getItem("paw_refresh_token");
    if (!accessToken || !refreshToken) return null;
    return { accessToken, refreshToken };
  }

  public setTokens(tokens: AuthTokens) {
    if (typeof window === "undefined") return;
    localStorage.setItem("paw_access_token", tokens.accessToken);
    localStorage.setItem("paw_refresh_token", tokens.refreshToken);
  }

  public clearTokens() {
    if (typeof window === "undefined") return;
    localStorage.removeItem("paw_access_token");
    localStorage.removeItem("paw_refresh_token");
    localStorage.removeItem("paw_user");
  }

  public setUser(user: UserSession) {
    if (typeof window === "undefined") return;
    localStorage.setItem("paw_user", JSON.stringify(user));
  }

  public getUser(): UserSession | null {
    if (typeof window === "undefined") return null;
    const data = localStorage.getItem("paw_user");
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  public async refreshAuthTokens(): Promise<string | null> {
    const tokens = this.getTokens();
    if (!tokens?.refreshToken) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      });

      if (!response.ok) {
        this.clearTokens();
        return null;
      }

      const resData = await response.json();
      if (resData.success && resData.data?.tokens) {
        this.setTokens(resData.data.tokens);
        return resData.data.tokens.accessToken;
      }
      return null;
    } catch (err) {
      console.warn("Token refresh failed:", err);
      return null;
    }
  }

  public async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; message?: string; error?: any }> {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    const tokens = this.getTokens();
    if (tokens?.accessToken) {
      headers["Authorization"] = `Bearer ${tokens.accessToken}`;
    }

    try {
      let response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 401 and attempt automatic token rotation retry
      if (response.status === 401 && tokens?.refreshToken) {
        const newAccessToken = await this.refreshAuthTokens();
        if (newAccessToken) {
          headers["Authorization"] = `Bearer ${newAccessToken}`;
          response = await fetch(url, {
            ...options,
            headers,
          });
        }
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Network request failed",
        error,
      };
    }
  }

  public get<T = any>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  public post<T = any>(endpoint: string, body: any, options?: RequestInit) {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  public put<T = any>(endpoint: string, body: any, options?: RequestInit) {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  public delete<T = any>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

export const api = new ApiClient();
