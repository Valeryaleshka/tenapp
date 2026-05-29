import type {LoginPayload, RegisterPayload, UpdateAccountPayload, User} from "../services/auth/auth.service.ts";

export interface AuthContextValue {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (payload: LoginPayload) => Promise<void>;
    register: (payload: RegisterPayload) => Promise<void>;
    updateAccount: (payload: UpdateAccountPayload) => Promise<User>;
    logout: () => Promise<void>;
}