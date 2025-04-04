
import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginWithMicrosoft, logoutFromMicrosoft, fetchMsUserProfile } from '@/utils/msAuthUtils';
import { toast } from 'sonner';

type User = {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  accessToken?: string;
  microsoftAccount?: boolean;
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithMS: () => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for saved auth in localStorage
    const savedUser = localStorage.getItem('calendar_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // For now, we'll simulate authentication
      // In a real app, this would call an Azure AD endpoint
      if (!email || !email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }
      
      // Mock successful login - in real app, this would come from Azure AD
      const mockUser: User = {
        id: '123456',
        email: email,
        name: email.split('@')[0],
      };
      
      // Store user in localStorage
      localStorage.setItem('calendar_user', JSON.stringify(mockUser));
      setUser(mockUser);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithMS = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const authResult = await loginWithMicrosoft();
      const msProfile = await fetchMsUserProfile(authResult.accessToken);
      
      const msUser: User = {
        id: msProfile.id,
        email: msProfile.mail || msProfile.userPrincipalName,
        name: msProfile.displayName,
        avatar: undefined, // Microsoft Graph doesn't directly provide avatar in basic profile
        accessToken: authResult.accessToken,
        microsoftAccount: true
      };
      
      // Store user in localStorage
      localStorage.setItem('calendar_user', JSON.stringify(msUser));
      setUser(msUser);
      toast.success('Signed in with Microsoft successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Microsoft');
      toast.error('Failed to sign in with Microsoft');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (user?.microsoftAccount) {
        await logoutFromMicrosoft();
      }
      localStorage.removeItem('calendar_user');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if MS logout fails
      localStorage.removeItem('calendar_user');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithMS,
        logout,
        error
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
