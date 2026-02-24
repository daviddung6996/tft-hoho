export type AuthRole = 'admin' | 'user' | 'guest';

export interface UserCredentials {
    email: string;
    password?: string;
    provider?: 'google' | 'local';
}
