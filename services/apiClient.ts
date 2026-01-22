import { Company, Document, Audit, Finding, User } from '../types';

// Configuration
const BASE_URL = process.env.REACT_APP_API_URL || '/api';

// --- Error Handling Strategy ---
export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

interface ApiClientConfig {
  getToken: () => string | null;
  onUnauthorized?: () => void;
}

class ApiClient {
  private config: ApiClientConfig;

  constructor(config: ApiClientConfig) {
    this.config = config;
  }

  /**
   * Core request method that handles headers, token injection, and response parsing.
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.config.getToken();
    
    // Default headers
    const headers: Record<string, string> = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    // Add Content-Type for JSON requests (skip for FormData to let browser handle boundary)
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, config);

      if (response.status === 401 && this.config.onUnauthorized) {
        this.config.onUnauthorized();
      }

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: response.statusText };
        }
        throw new ApiError(response.status, errorData.message || 'API Request Failed', errorData);
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      // Wrap network/unexpected errors
      throw new ApiError(500, (error as Error).message || 'Network Error');
    }
  }

  // --- Auth ---
  async login(email: string): Promise<{ user: User; token: string }> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // --- Companies ---
  async getCompanies(): Promise<Company[]> {
    return this.request('/companies');
  }

  async createCompany(payload: Pick<Company, 'name' | 'industry' | 'country'> & { description?: string }): Promise<Company> {
    return this.request('/companies', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // --- Documents ---
  async getCompanyDocuments(companyId: string): Promise<Document[]> {
    return this.request(`/companies/${companyId}/documents`);
  }

  async uploadDocument(companyId: string, file: File, metadata: { type: string; summary?: string }): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('companyId', companyId);
    formData.append('type', metadata.type);
    if (metadata.summary) {
      formData.append('summary', metadata.summary);
    }

    return this.request('/documents/upload', {
      method: 'POST',
      body: formData,
    });
  }

  // --- Audits ---
  async startAudit(companyId: string): Promise<Audit> {
    return this.request('/audit/start', {
      method: 'POST',
      body: JSON.stringify({ companyId }),
    });
  }

  async getAudit(auditId: string): Promise<Audit> {
    return this.request(`/audit/${auditId}`);
  }

  async getAuditFindings(auditId: string): Promise<Finding[]> {
    return this.request(`/audit/${auditId}/findings`);
  }

  // --- AI Operations ---
  async aiChat(companyId: string | undefined, message: string): Promise<{ role: string; content: string }> {
    return this.request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ companyId, message }),
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient({
  getToken: () => localStorage.getItem('auth_token'),
  onUnauthorized: () => {
    // Handle session expiry (e.g., redirect to login)
    // window.location.href = '/login'; 
    console.warn('Session expired');
  }
});
