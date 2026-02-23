import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authService, type LoginPayload, type RegisterPayload, type User } from '../services/auth/auth.service.ts';

interface AuthContextValue {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (payload: LoginPayload) => Promise<void>;
    register: (payload: RegisterPayload) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const bootstrap = async () => {
            try {
                try {
                    const currentUser = await authService.me();
                    setUser(currentUser);
                    return;
                } catch {
                    await authService.refresh();
                    const currentUser = await authService.me();
                    setUser(currentUser);
                }
            } catch {
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        void bootstrap();
    }, []);

    const login = async (payload: LoginPayload) => {
        const loginUser = await authService.login(payload);

        if (loginUser) {
            setUser(loginUser);
            return;
        }

        const currentUser = await authService.me();
        setUser(currentUser);
    };

    const register = async (payload: RegisterPayload) => {
        const registeredUser = await authService.register(payload);

        if (registeredUser) {
            setUser(registeredUser);
            return;
        }

        const currentUser = await authService.me();
        setUser(currentUser);
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
    };

    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            isAuthenticated: user !== null,
            isLoading,
            login,
            register,
            logout,
        }),
        [user, isLoading],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }

    return context;
}
