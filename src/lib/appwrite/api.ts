import { ID, OAuthProvider } from 'appwrite';
import { account } from './client';

export const signUp = async (email: string, password: string, name: string) => {
    try {
        const newAccount = await account.create(ID.unique(), email, password, name);
        return newAccount;
    } catch (error) {
        console.error('Appwrite signUp error:', error);
        throw error;
    }
};

export const signIn = async (email: string, password: string) => {
    try {
        const session = await account.createEmailPasswordSession(email, password);
        return session;
    } catch (error) {
        console.error('Appwrite signIn error:', error);
        throw error;
    }
};

export const signInWithGoogle = async () => {
    try {
        // Redirects to current page after login
        // You might want to change window.location.origin to a clearer success URL if needed
        // But usually returning to home '/' is good.
        // account.createOAuth2Session('google', 'http://localhost:3000', 'http://localhost:3000/auth')

        // We will use window.location.origin to be dynamic
        const origin = window.location.origin;
        await account.createOAuth2Session(
            OAuthProvider.Google,
            `${origin}/api/auth/oauth`,
            `${origin}/auth`
        );
    } catch (error) {
        console.error('Appwrite signInWithGoogle error:', error);
        throw error;
    }
};

export const signOut = async () => {
    try {
        await account.deleteSession('current');
    } catch (error) {
        console.error('Appwrite signOut error:', error);
        throw error;
    }
};

export const getCurrentUser = async () => {
    try {
        const user = await account.get();
        return user;
    } catch (error: any) {
        // Appwrite returns 401/403 if no session exists or if guest.
        // We return null silently as this is expected behavior for unauthenticated states.
        return null;
    }
};

export const createEmailToken = async (userId: string, email: string) => {
    try {
        const token = await account.createEmailToken(userId, email);
        return token;
    } catch (error) {
        console.error('Appwrite createEmailToken error:', error);
        throw error;
    }
};

export const createPhoneToken = async (userId: string, phone: string) => {
    try {
        const token = await account.createPhoneToken(ID.unique(), phone);
        return token;
    } catch (error) {
        console.error('Appwrite createPhoneToken error:', error);
        throw error;
    }
};

export const verifySession = async (userId: string, secret: string) => {
    try {
        const session = await account.createSession(userId, secret);
        return session;
    } catch (error) {
        console.error('Appwrite verifySession error:', error);
        throw error;
    }
};
