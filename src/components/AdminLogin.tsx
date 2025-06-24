
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

interface AdminLoginProps {
  onLogin: () => void;
  onBack: () => void;
}

const AdminLogin = ({ onLogin, onBack }: AdminLoginProps) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (credentials.username === 'Festival_SM_2025' && credentials.password === 'admin') {
      onLogin();
      toast({
        title: "Accesso effettuato",
        description: "Benvenuto nel pannello admin!"
      });
    } else {
      toast({
        title: "Credenziali errate",
        description: "Nome utente o password non validi.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Accesso Admin</h2>
          <p className="text-muted-foreground">
            Inserisci le credenziali per accedere
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username">Nome utente</Label>
            <Input
              id="username"
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Button type="submit" className="w-full">
              Accedi
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full"
              onClick={onBack}
            >
              Torna alla Home
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AdminLogin;
