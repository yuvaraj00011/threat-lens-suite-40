import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: ReactNode;
  requireRole?: string;
  fallbackPath?: string;
}

export const AuthGuard = ({ 
  children, 
  requireRole, 
  fallbackPath = '/login' 
}: AuthGuardProps) => {
  const { user, loading, hasRole } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-cyber-glow mx-auto" />
          <p className="text-cyber-glow font-mono">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  if (requireRole && !hasRole(requireRole)) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-destructive text-6xl font-bold">403</div>
          <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to access this resource. Required role: {requireRole}
          </p>
          <button 
            onClick={() => window.history.back()}
            className="text-cyber-glow hover:underline"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};