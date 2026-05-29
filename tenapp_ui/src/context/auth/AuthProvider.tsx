import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { AuthContext } from './auth-context.tsx';
import { authService, type LoginPayload, type RegisterPayload, type UpdateAccountPayload, type User } from '../../services/auth/auth.service.ts';
import type { AuthContextValue } from './auth-context.interfaces.tsx';

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
        if (loginUser) return setUser(loginUser);

        setUser(await authService.me());
    };

    const register = async (payload: RegisterPayload) => {
        const registeredUser = await authService.register(payload);
        if (registeredUser) return setUser(registeredUser);

        setUser(await authService.me());
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
    };

    const updateAccount = async (payload: UpdateAccountPayload) => {
        const updatedUser = await authService.updateAccount(payload);
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