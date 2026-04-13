const API_BASE_URL = "https://transly-wr1m.onrender.com";

export async function apiFetch(endpoint: string, options: RequestInit = {}, token?: string | null) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    } as any;

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
        ...options,
        headers,
        credentials: 'include', // Crucial for session cookies on cross-site requests
    };

    const response = await fetch(url, config);
    
    // Auto-handle 401s if needed (could trigger logout here if we had access to context)
    return response;
}
