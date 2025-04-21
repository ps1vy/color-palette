/**
 * API Client factory for making HTTP requests
 * Provides utility functions for common HTTP operations with retry logic
 */

interface ApiClientOptions {
  baseUrl: string;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

interface ApiClient {
  get<T>(endpoint: string, params?: Record<string, any>): Promise<T>;
  post<T>(endpoint: string, data?: any): Promise<T>;
  put<T>(endpoint: string, data?: any): Promise<T>;
  delete<T>(endpoint: string): Promise<T>;
}

/**
 * Create an API client with the given options
 */
export function createApiClient(options: ApiClientOptions): ApiClient {
  const { baseUrl, headers = {}, timeout = 10000, retries = 3 } = options;

  /**
   * Make an HTTP request with retry logic
   */
  async function makeRequest<T>(
    method: string, 
    endpoint: string, 
    data?: any, 
    params?: Record<string, any>
  ): Promise<T> {
    const url = new URL(`${baseUrl}${endpoint}`);
    
    // Add query parameters if provided
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    // Request options
    const requestOptions: RequestInit = {
      method,
      headers: {
        ...headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    };

    // Handle retries
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        requestOptions.signal = controller.signal;
        
        const response = await fetch(url.toString(), requestOptions);
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}: ${await response.text()}`);
        }
        
        return await response.json();
      } catch (error: any) {
        lastError = error;
        
        // Don't retry if we've reached max retries or if it's an abort error
        if (attempt >= retries - 1 || error.name === 'AbortError') {
          break;
        }
        
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 100;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError || new Error('Request failed with unknown error');
  }

  return {
    get: <T>(endpoint: string, params?: Record<string, any>) => 
      makeRequest<T>('GET', endpoint, undefined, params),
    
    post: <T>(endpoint: string, data?: any) => 
      makeRequest<T>('POST', endpoint, data),
    
    put: <T>(endpoint: string, data?: any) => 
      makeRequest<T>('PUT', endpoint, data),
    
    delete: <T>(endpoint: string) => 
      makeRequest<T>('DELETE', endpoint),
  };
} 