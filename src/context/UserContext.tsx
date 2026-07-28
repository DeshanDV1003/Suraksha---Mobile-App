import React, { createContext, useContext } from 'react';

export type UserRole = 'CITIZEN' | 'VOLUNTEER' | 'DMC_OFFICER' | 'ADMIN';

interface UserContextValue {
    role: UserRole;
}

const UserContext = createContext<UserContextValue>({ role: 'CITIZEN' });

export const UserProvider = UserContext.Provider;

export function useUserRole(): UserRole {
    return useContext(UserContext).role;
}

export function useIsVolunteer(): boolean {
    return useContext(UserContext).role === 'VOLUNTEER';
}
