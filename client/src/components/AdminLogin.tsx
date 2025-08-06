import React, { useState, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { trpc } from '@/utils/trpc';
import { AuthContext } from '../App';
import type { AdminLoginInput } from '../../../server/src/schema';

export function AdminLogin() {
  const authContext = useContext(AuthContext);
  const [formData, setFormData] = useState<AdminLoginInput>({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await trpc.admin.login.mutate(formData);
      
      if (response.success && response.sessionToken) {
        authContext.login(response.sessionToken);
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToStore = () => {
    authContext.navigate('home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-green-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-green-400/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <Card className="glass-panel border-green-400/30 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center animate-glow">
              <span className="text-3xl">🔐</span>
            </div>
            <CardTitle className="text-3xl font-bold neon-text-bright">
              ADMIN ACCESS
            </CardTitle>
            <p className="text-green-400/80 text-lg">Secure System Authentication</p>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent mx-auto"></div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert className="bg-red-900/20 border-red-400/30 animate-fade-in">
                  <AlertDescription className="text-red-400">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                <label htmlFor="username" className="text-sm font-medium text-green-400 block">
                  USERNAME
                </label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter administrator username"
                  value={formData.username}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: AdminLoginInput) => ({ ...prev, username: e.target.value }))
                  }
                  required
                  disabled={isLoading}
                  className="glass-panel h-12 bg-black/20 border-green-400/30 text-green-100 placeholder:text-green-400/60 focus:border-green-400 focus:bg-black/30 transition-all duration-300 focus-neon"
                />
              </div>

              <div className="space-y-3">
                <label htmlFor="password" className="text-sm font-medium text-green-400 block">
                  PASSWORD
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter secure password"
                  value={formData.password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: AdminLoginInput) => ({ ...prev, password: e.target.value }))
                  }
                  required
                  disabled={isLoading}
                  className="glass-panel h-12 bg-black/20 border-green-400/30 text-green-100 placeholder:text-green-400/60 focus:border-green-400 focus:bg-black/30 transition-all duration-300 focus-neon"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-black font-bold text-lg transition-all duration-300 hover:shadow-lg hover:shadow-green-400/25 neon-border animate-glow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-5 h-5 border-2 border-t-transparent border-black rounded-full animate-spin"></div>
                    <span>AUTHENTICATING...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>🔑</span>
                    <span>AUTHENTICATE</span>
                  </div>
                )}
              </Button>
            </form>

            <div className="text-center pt-4">
              <Button
                variant="link"
                onClick={handleBackToStore}
                className="text-green-400/80 hover:text-green-300 transition-colors duration-300 text-lg"
              >
                ← RETURN TO CATALOG
              </Button>
            </div>

            {/* Development hint */}
            <div className="mt-6 p-4 glass-panel bg-yellow-900/20 border-yellow-400/30 rounded-lg animate-fade-in">
              <p className="text-sm text-yellow-400 text-center">
                <strong className="text-yellow-300">DEV ACCESS:</strong><br />
                Username: <code className="bg-yellow-900/30 px-1 rounded">admin</code><br />
                Password: <code className="bg-yellow-900/30 px-1 rounded">mysecurepass</code>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security badge */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center space-x-2 glass-panel px-4 py-2 text-sm text-green-400/80">
            <span>🛡️</span>
            <span>SECURED BY QUANTUM ENCRYPTION</span>
            <span>🛡️</span>
          </div>
        </div>
      </div>
    </div>
  );
}