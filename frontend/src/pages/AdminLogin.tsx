import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const AdminLogin = () => {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate token with backend
      const response = await api.admin.auth.login(token);
      if (response.success) {
        localStorage.setItem('admin_token', token);
        toast({
          title: 'Login Successful',
          description: 'Redirecting to admin dashboard...',
        });
        navigate('/admin/dashboard');
      } else {
        toast({
          title: 'Login Failed',
          description: response.message || 'Invalid token.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Login Failed',
        description: error.message || 'An error occurred during login.',
        variant: 'destructive',
      });
    }
    setLoading(false);
  }, [token, navigate, toast]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>Enter your secret token to access the admin panel.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="token">Secret Token</Label>
              <Input
                id="token"
                type="password"
                placeholder="Enter your secret token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
