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
        try {
            const response = await api.post('/auth/register', data);

            if (response.data.data) {
                const { access_token, refresh_token } = response.data.data;
                localStorage.setItem('access_token', access_token);
                localStorage.setItem('refresh_token', refresh_token);
            }

            return response.data;
        } catch (error: any) {
            // Improve error messages for common issues
            if (error.response?.data?.detail) {
                const detail = error.response.data.detail;
                
                // Handle duplicate registration number
                if (detail.includes('duplicate key value violates unique constraint "organizations_registration_number_key"')) {
                    throw new Error('This registration number is already in use. Please use a different registration number.');
                }
                
                // Handle duplicate email
                if (detail.includes('Email already registered')) {
                    throw new Error('An account with this email already exists. Please use a different email or try logging in.');
                }
                
                // Handle database integrity errors
                if (detail.includes('Database integrity error')) {
                    throw new Error('Registration failed due to duplicate information. Please check your registration number and email.');
                }
                
                // Return original error if no specific handling
                throw new Error(detail);
            }
            
            throw error;
        }
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
