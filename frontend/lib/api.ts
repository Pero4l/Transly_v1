const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return "http://localhost:9400"; // Local backend port
    }
  }
  return "https://transly-wr1m.onrender.com"; // Production Render backend
};

const API_BASE_URL = getApiBaseUrl();

export async function apiFetch(endpoint: string, options: RequestInit = {}, token?: string | null) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    
    const headers: Record<string, string> = {
        ...options.headers as Record<string, string>,
    };

    // Automatically set Content-Type to application/json if body is not FormData
    if (options.body && !(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

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
