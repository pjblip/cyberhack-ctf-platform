// API client for NestJS backend
// If VITE_API_URL is missing, default to the local backend port using the exact hostname the user typed in
const fallbackBase = typeof window !== 'undefined' ? `http://${window.location.hostname}:3001` : 'http://localhost:3001';
const API_BASE = import.meta.env.VITE_API_URL || fallbackBase;

function getToken(): string | null {
    return localStorage.getItem('auth_token');
}

export function setToken(token: string) {
    localStorage.setItem('auth_token', token);
}

export function clearToken() {
    localStorage.removeItem('auth_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = getToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(error.message || `Request failed: ${res.status}`);
    }

    // Handle 204 No Content
    if (res.status === 204) return {} as T;

    return res.json();
}

export const api = {
    get: <T>(path: string) => request<T>(path, { method: 'GET' }),
    post: <T>(path: string, data?: any) =>
        request<T>(path, { method: 'POST', body: data ? JSON.stringify(data) : undefined }),
    put: <T>(path: string, data?: any) =>
        request<T>(path, { method: 'PUT', body: data ? JSON.stringify(data) : undefined }),
    patch: <T>(path: string, data?: any) =>
        request<T>(path, { method: 'PATCH', body: data ? JSON.stringify(data) : undefined }),
    delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
