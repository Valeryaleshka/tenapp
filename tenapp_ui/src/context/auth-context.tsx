import { createContext } from 'react';
import type { AuthContextValue } from './auth-context.interfaces';

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

