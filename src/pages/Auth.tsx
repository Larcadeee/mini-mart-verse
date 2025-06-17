
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '@/components/AuthForm';
import { useAuth } from '@/hooks/useAuth';

const Auth = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleAuthSuccess = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return <AuthForm onSuccess={handleAuthSuccess} />;
};

export default Auth;
