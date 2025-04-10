
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const SignInWithMicrosoft: React.FC = () => {
  const { loginWithMS, isLoading } = useAuth();
  const [localLoading, setLocalLoading] = React.useState(false);
  
  const handleMicrosoftSignIn = async () => {
    try {
      setLocalLoading(true);
      await loginWithMS();
    } catch (error: any) {
      console.error('Microsoft sign-in error:', error);
      if (error.message?.includes('redirect URI')) {
        toast.error('Authentication error: Redirect URI mismatch. Please contact support.');
      } else if (error.message?.includes('user_cancelled')) {
        toast.info('Sign-in was cancelled');
      } else {
        toast.error('Failed to sign in with Microsoft. Please try again.');
      }
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <Button 
      className="w-full flex items-center justify-center gap-2 bg-[#0078d4] hover:bg-[#106ebe]"
      onClick={handleMicrosoftSignIn}
      disabled={isLoading || localLoading}
    >
      {(isLoading || localLoading) ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 23 23">
          <path fill="#f3f3f3" d="M0 0h10.931v10.931H0z"/>
          <path fill="#f35325" d="M11.861 0h10.931v10.931H11.861z"/>
          <path fill="#81bc06" d="M0 11.861h10.931v10.931H0z"/>
          <path fill="#05a6f0" d="M11.861 11.861h10.931v10.931H11.861z"/>
        </svg>
      )}
      Sign in with Microsoft
    </Button>
  );
};

export default SignInWithMicrosoft;
