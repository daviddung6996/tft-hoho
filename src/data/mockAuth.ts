// Mock authentication data for demo purposes
// In production, this would be handled by a backend API

export interface User {
    username: string;
    password: string; // In production, this would be hashed
    role: 'user' | 'admin';
    displayName: string;
}

// Demo users
export const MOCK_USERS: User[] = [
    {
        username: 'player1',
        password: 'demo123',
        role: 'user',
        displayName: 'Player One'
    },
    {
        username: 'player2',
        password: 'demo123',
        role: 'user',
        displayName: 'Player Two'
    },
    {
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        displayName: 'Administrator'
    }
];

// Hex puzzle solution for admin login
export const HEX_PUZZLE_SOLUTION = [0, 2, 1, 3]; // Correct order of hex indices

// Simple authentication helper
export const authenticateUser = (username: string, password: string): User | null => {
    const user = MOCK_USERS.find(u => u.username === username && u.password === password);
    return user || null;
};

// Store auth in localStorage (demo only)
export const saveAuthToken = (user: User) => {
    localStorage.setItem('tft_auth', JSON.stringify({
        username: user.username,
        role: user.role,
        displayName: user.displayName
    }));
};

export const getAuthToken = (): { username: string; role: 'user' | 'admin'; displayName: string } | null => {
    const token = localStorage.getItem('tft_auth');
    return token ? JSON.parse(token) : null;
};

export const clearAuthToken = () => {
    localStorage.removeItem('tft_auth');
};
