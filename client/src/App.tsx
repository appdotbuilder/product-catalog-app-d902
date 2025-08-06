
import React, { useState, useEffect, useCallback } from 'react';
import { HomePage } from './components/HomePage';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { trpc } from './utils/trpc';
import './App.css';

// Simple routing types
type Route = 'home' | 'admin-login' | 'admin-dashboard';

// Auth context for session management
interface AuthContextType {
  isAuthenticated: boolean;
  sessionToken: string | null;
  login: (token: string) => void;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
  navigate: (route: Route) => void;
}

export const AuthContext = React.createContext<AuthContextType>({} as AuthContextType);

export type { Route, AuthContextType };

function App() {
  const [currentRoute, setCurrentRoute] = useState<Route>('home');
  const [sessionToken, setSessionToken] = useState<string | null>(
    localStorage.getItem('adminSessionToken')
  );
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Simple client-side routing
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/admin/login') {
      setCurrentRoute('admin-login');
    } else if (path === '/admin/dashboard') {
      setCurrentRoute('admin-dashboard');
    } else {
      setCurrentRoute('home');
    }
  }, []);

  const navigate = (route: Route) => {
    setCurrentRoute(route);
    // Update URL without page reload
    const paths: Record<Route, string> = {
      'home': '/',
      'admin-login': '/admin/login',
      'admin-dashboard': '/admin/dashboard'
    };
    window.history.pushState(null, '', paths[route]);
  };

  const checkAuth = useCallback(async (): Promise<boolean> => {
    if (!sessionToken) {
      setIsAuthenticated(false);
      return false;
    }

    try {
      const result = await trpc.admin.verifySession.query({ sessionToken });
      const authenticated = result.isValid || false;
      setIsAuthenticated(authenticated);
      return authenticated;
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      localStorage.removeItem('adminSessionToken');
      setSessionToken(null);
      return false;
    }
  }, [sessionToken]);

  useEffect(() => {
    const verifyAuth = async () => {
      setIsCheckingAuth(true);
      await checkAuth();
      setIsCheckingAuth(false);
    };
    
    verifyAuth();
  }, [checkAuth]);

  const login = (token: string) => {
    setSessionToken(token);
    setIsAuthenticated(true);
    localStorage.setItem('adminSessionToken', token);
    navigate('admin-dashboard');
  };

  const logout = async () => {
    if (sessionToken) {
      try {
        await trpc.admin.logout.mutate({ sessionToken });
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }
    
    setSessionToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('adminSessionToken');
    navigate('home');
  };

  const authValue: AuthContextType = {
    isAuthenticated,
    sessionToken,
    login,
    logout,
    checkAuth,
    navigate
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-green-900">
        <div className="glass-panel p-8 animate-fade-in">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 border-2 border-t-transparent border-green-400 rounded-full animate-spin"></div>
            <span className="text-lg neon-text">Initializing System...</span>
          </div>
        </div>
      </div>
    );
  }

  // Route protection and rendering
  const renderCurrentRoute = () => {
    switch (currentRoute) {
      case 'home':
        return <HomePage />;
      
      case 'admin-login':
        if (isAuthenticated) {
          // Redirect to dashboard if already authenticated
          navigate('admin-dashboard');
          return <AdminDashboard />;
        }
        return <AdminLogin />;
      
      case 'admin-dashboard':
        if (!isAuthenticated) {
          // Redirect to login if not authenticated
          navigate('admin-login');
          return <AdminLogin />;
        }
        return <AdminDashboard />;
      
      default:
        return <HomePage />;
    }
  };

  return (
    <AuthContext.Provider value={authValue}>
      {renderCurrentRoute()}
    </AuthContext.Provider>
  );
}

export default App;
