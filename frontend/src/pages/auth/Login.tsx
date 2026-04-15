import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
      toast.success('Welcome back!');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const detail = (err.response?.data as { detail?: string } | undefined)?.detail;
        toast.error(detail || 'Invalid credentials');
      } else {
        toast.error('Invalid credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-center mb-2"><h2 className="text-xl font-semibold">Sign In</h2><p className="text-sm text-muted-foreground">Enter your credentials to continue</p></div>
          <div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div className="space-y-2"><Label>Password</Label><Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox id="remember" checked={remember} onCheckedChange={(v) => setRemember(!!v)} />
              <Label htmlFor="remember" className="text-sm cursor-pointer">Remember me</Label>
            </div>
            <Button variant="link" className="px-0 text-sm">Forgot password?</Button>
          </div>
          <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Sign In
          </Button>
          <p className="text-center text-sm text-muted-foreground">Don't have an account? <Link to="/register" className="text-primary hover:underline">Sign up</Link></p>
        </form>
      </CardContent>
    </Card>
  );
}
