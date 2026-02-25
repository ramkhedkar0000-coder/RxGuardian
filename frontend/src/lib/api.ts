// This file provides a centralised way to get the backend API URL.
// It checks the environment variable NEXT_PUBLIC_API_URL first, 
// and falls back to localhost:3001 for local development.

export const getApiUrl = () => {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
};
