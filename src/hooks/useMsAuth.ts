import { useAuth } from './useAuth';

export const useMsAuth = () => {
  const { user } = useAuth();
  
  return {
    msAccount: user?.microsoftAccount || null,
    isMsAuthenticated: !!user?.microsoftAccount
  };
}; 