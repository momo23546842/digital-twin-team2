import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * API Proxy route that forwards requests to the backend API
 * Automatically includes the auth token from httpOnly cookies
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, await params, "GET");
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, await params, "POST");
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, await params, "PUT");
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, await params, "PATCH");
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, await params, "DELETE");
}

async function handleRequest(
  request: NextRequest,
  params: { path: string[] },
  method: string
) {
  try {
    const { path } = params;
    const apiPath = path.join("/");

    // Get auth token from httpOnly cookie
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;

    // Build the backend API URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
    const url = `${apiUrl}/${apiPath}`;

    // Prepare headers
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Add auth token if available
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    // Prepare the request body for methods that support it
    let body: string | undefined;
    if (["POST", "PUT", "PATCH"].includes(method)) {
      try {
        const requestBody = await request.json();
        body = JSON.stringify(requestBody);
      } catch {
        // No body or invalid JSON
      }
    }

    // Forward the request to the backend API
    const response = await fetch(url, {
      method,
      headers,
      body,
    });

    // Handle 401 Unauthorized - try to refresh token
    if (response.status === 401) {
      const refreshToken = cookieStore.get("refresh_token")?.value;
      
      if (refreshToken) {
        // Try to refresh the token
        const refreshResponse = await fetch(`${request.nextUrl.origin}/api/auth/refresh`, {
          method: "POST",
        });

        if (refreshResponse.ok) {
          // Retry the original request with the new token
          const newAuthToken = cookieStore.get("auth_token")?.value;
          if (newAuthToken) {
            headers.Authorization = `Bearer ${newAuthToken}`;
            const retryResponse = await fetch(url, {
              method,
              headers,
              body,
            });
            const retryData = await retryResponse.json();
            return NextResponse.json(retryData, { status: retryResponse.status });
          }
        }
      }
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("API proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
