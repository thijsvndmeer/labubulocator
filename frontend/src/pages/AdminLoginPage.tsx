import { useState, FormEvent, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const AdminLoginPage = () => {
  const [inputValue, setInputValue] = useState('');
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = useCallback((e: FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      // In a real application, you would send this token to your backend for validation.
      // For this example, we're assuming the token itself is sufficient for client-side storage.
      // Backend validation is CRUCIAL here.
      login(inputValue.trim());
      navigate('/admin'); // Redirect to the admin dashboard after "login"
    } else {
      toast({
        title: 'Error',
        description: 'Please enter a valid admin token.',
        variant: 'destructive',
      });
    }
  }, [inputValue, login, navigate, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>Enter your admin token to access the administration panel.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="adminToken">Admin Token</Label>
              <Input
                id="adminToken"
                type="password" // Use password type for token input
                placeholder="••••••••"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLoginPage;