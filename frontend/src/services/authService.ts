import api from './api';

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    full_name: string;
    phone_number?: string;
    role: string;
    organization_name?: string;
    organization_type?: string;
    registration_number?: string;
}

export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
}

export const authService = {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const formData = new URLSearchParams();
        formData.append('username', credentials.username);
        formData.append('password', credentials.password);

        const response = await api.post('/auth/login', formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const { access_token, refresh_token } = response.data;
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);

        return response.data;
    },

    async register(data: RegisterData): Promise<any> {
        const response = await api.post('/auth/register', data);

        if (response.data.data) {
            const { access_token, refresh_token } = response.data.data;
            localStorage.setItem('access_token', access_token);
            localStorage.setItem('refresh_token', refresh_token);
        }

        return response.data;
    },

    async getCurrentUser(): Promise<any> {
        const response = await api.get('/auth/me');
        return response.data;
    },

    logout() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    },

    isAuthenticated(): boolean {
        return !!localStorage.getItem('access_token');
    },
};
