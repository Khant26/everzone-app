const DEFAULT_API_HOST = 'https://engineering-web-2026-backend-io2r.onrender.com';

const normalizeApiHost = (value) => {
    const rawBaseUrl = (value || DEFAULT_API_HOST).trim().replace(/\/+$/, '');
    return rawBaseUrl.endsWith('/api') ? rawBaseUrl.slice(0, -4) : rawBaseUrl;
};

class ApiService {
    constructor() {
        this.baseURL = normalizeApiHost(import.meta.env.VITE_API_BASE_URL);
    }

    getToken() {
        return localStorage.getItem('access_token');
    }

    clearAuth() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_data');
    }

    async request(path, options = {}, { auth = false } = {}) {
        const headers = {
            Accept: 'application/json',
            ...(options.headers || {})
        };

        if (auth) {
            const token = this.getToken();
            if (!token) {
                return { success: false, error: 'Access token required. Please login.', status: 401 };
            }
            headers.Authorization = `Bearer ${token}`;
        }

        const hasBody = options.body !== undefined;
        
        // Only set Content-Type for non-FormData requests
        if (hasBody && !headers['Content-Type'] && !(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(`${this.baseURL}${path}`, {
            ...options,
            headers
        });

        if (response.status === 401 || response.status === 403) {
            this.clearAuth();
        }

        return this.handleResponse(response);
    }

    async handleResponse(response) {
        let data = null;
        try {
            data = await response.json();
        } catch {
            // ignore: non-JSON response
        }

        if (response.ok) return { success: true, data };

        return {
            success: false,
            error: data?.error || data?.detail || data?.message || 'Request failed',
            status: response.status,
            data
        };
    }

    // ===== Public Endpoints =====

    getServices() {
        return this.request('/api/services');
    }

    getCategories() {
        return this.request('/api/categories');
    }

    getProjects() {
        return this.request('/api/projects');
    }

    // ===== Admin Endpoints (JWT required) =====

    createCategory(category) {
        return this.request('/api/admin/categories', {
            method: 'POST',
            body: JSON.stringify(category)
        }, { auth: true });
    }

    updateCategory(id, category) {
        return this.request(`/api/admin/categories/${id}`, {
            method: 'PUT',
            body: JSON.stringify(category)
        }, { auth: true });
    }

    deleteCategory(id) {
        return this.request(`/api/admin/categories/${id}`, {
            method: 'DELETE'
        }, { auth: true });
    }

    createService(service) {
        return this.request('/api/admin/services', {
            method: 'POST',
            body: service instanceof FormData ? service : JSON.stringify(service)
        }, { auth: true });
    }

    updateService(id, service) {
        return this.request(`/api/admin/services/${id}`, {
            method: 'PUT',
            body: service instanceof FormData ? service : JSON.stringify(service)
        }, { auth: true });
    }

    deleteService(id) {
        return this.request(`/api/admin/services/${id}`, {
            method: 'DELETE'
        }, { auth: true });
    }

    createProject(project) {
        return this.request('/api/admin/projects', {
            method: 'POST',
            body: project instanceof FormData ? project : JSON.stringify(project)
        }, { auth: true });
    }

    updateProject(id, project) {
        return this.request(`/api/admin/projects/${id}`, {
            method: 'PUT',
            body: project instanceof FormData ? project : JSON.stringify(project)
        }, { auth: true });
    }

    deleteProject(id) {
        return this.request(`/api/admin/projects/${id}`, {
            method: 'DELETE'
        }, { auth: true });
    }

    getContactForms() {
        return this.request('/api/admin/contact-forms', {}, { auth: true });
    }

    updateContactFormStatus(id, status) {
        return this.request(`/api/admin/contact-forms/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        }, { auth: true });
    }

    deleteContactForm(id) {
        return this.request(`/api/admin/contact-forms/${id}`, {
            method: 'DELETE'
        }, { auth: true });
    }
}

// Create and export a singleton instance
const apiService = new ApiService();

export default apiService;