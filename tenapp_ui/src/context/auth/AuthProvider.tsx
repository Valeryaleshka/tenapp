import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { AuthContext } from './auth-context.tsx';
import { AuthService, type LoginPayload, type RegisterPayload, type UpdateAccountPayload, type User } from '../../services/auth/authService.ts';
import type { AuthContextValue } from './auth-context.interfaces.tsx';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const bootstrap = async () => {
            try {
                try {
                    const currentUser = await AuthService.me();
                    setUser(currentUser);
                    return;
                } catch {
                    await AuthService.refresh();
                    const currentUser = await AuthService.me();
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
        const loginUser = await AuthService.login(payload);
        if (loginUser) return setUser(loginUser);

        setUser(await AuthService.me());
    };

    const register = async (payload: RegisterPayload) => {
        const registeredUser = await AuthService.register(payload);
        if (registeredUser) return setUser(registeredUser);

        setUser(await AuthService.me());
    };

    const logout = async () => {
        await AuthService.logout();
        setUser(null);
    };

    const updateAccount = async (payload: UpdateAccountPayload) => {
        const updatedUser = await AuthService.updateAccount(payload);
        setUser(updatedUser);
        return updatedUser;
    };

    const value = useMemo<AuthContextValue>(() => ({
        user,
        isAuthenticated: user !== null,
        isLoading,
        login,
        register,
        updateAccount,
        logout,
    }), [user, isLoading]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}