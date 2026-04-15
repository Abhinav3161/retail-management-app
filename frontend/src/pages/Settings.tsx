import { useState } from 'react';
import { User, Mail, Bell, BellOff, Palette, Save, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Profile state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);

  // Notification prefs
  const [notifSales, setNotifSales] = useState(true);
  const [notifStock, setNotifStock] = useState(true);
  const [notifInsights, setNotifInsights] = useState(true);
  const [notifEmail, setNotifEmail] = useState(false);

  const handleSaveProfile = async () => {
    setSaving(true);
    // Simulate save — would call API in real app
    await new Promise((r) => setTimeout(r, 800));
    if (user) {
      const updated = { ...user, name, email };
      localStorage.setItem('auth_user', JSON.stringify(updated));
    }
    setSaving(false);
    toast.success('Profile updated successfully');
  };

  const handleSaveNotifications = () => {
    toast.success('Notification preferences saved');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-muted">
          <TabsTrigger value="profile" className="gap-2"><User className="h-4 w-4" /> Profile</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2"><Bell className="h-4 w-4" /> Notifications</TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2"><Palette className="h-4 w-4" /> Appearance</TabsTrigger>
        </TabsList>

        {/* ── Profile ── */}
        <TabsContent value="profile">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{user?.name || 'User'}</p>
                    <Badge variant="secondary" className="mt-1 capitalize">{user?.role || 'admin'}</Badge>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" placeholder="you@example.com" />
                    </div>
                  </div>
                </div>

                <Button onClick={handleSaveProfile} disabled={saving} className="gap-2">
                  {saving ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : <Save className="h-4 w-4" />}
                  {saving ? 'Saving…' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── Notifications ── */}
        <TabsContent value="notifications">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose what alerts you want to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {[
                    { label: 'Sale Completed', desc: 'Get notified when a sale is completed', value: notifSales, set: setNotifSales },
                    { label: 'Low Stock Alerts', desc: 'Receive alerts when inventory is running low', value: notifStock, set: setNotifStock },
                    { label: 'New Insights', desc: 'Be alerted when new business insights are available', value: notifInsights, set: setNotifInsights },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="flex items-center gap-3">
                        {item.value ? <Bell className="h-5 w-5 text-primary" /> : <BellOff className="h-5 w-5 text-muted-foreground" />}
                        <div>
                          <p className="text-sm font-medium">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                      <Switch checked={item.value} onCheckedChange={item.set} />
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Email Notifications</p>
                      <p className="text-xs text-muted-foreground">Also send notifications to your email</p>
                    </div>
                  </div>
                  <Switch checked={notifEmail} onCheckedChange={setNotifEmail} />
                </div>

                <Button onClick={handleSaveNotifications} className="gap-2">
                  <Check className="h-4 w-4" /> Save Preferences
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ── Appearance ── */}
        <TabsContent value="appearance">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize how RetailPro looks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-sm font-medium mb-3 block">Theme</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {(['light', 'dark'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => { if (theme !== t) toggleTheme(); }}
                        className={`relative rounded-xl border-2 p-4 text-left transition-all ${
                          theme === t ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/30'
                        }`}
                      >
                        {theme === t && (
                          <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-3 w-3 text-primary-foreground" />
                          </div>
                        )}
                        <div className={`h-20 rounded-lg mb-3 ${t === 'light' ? 'bg-[hsl(220,20%,97%)] border border-[hsl(220,13%,91%)]' : 'bg-[hsl(222,47%,7%)] border border-[hsl(222,47%,18%)]'}`}>
                          <div className="flex gap-1 p-2">
                            <div className={`h-2 w-8 rounded ${t === 'light' ? 'bg-[hsl(234,89%,64%)]' : 'bg-[hsl(234,89%,64%)]'}`} />
                            <div className={`h-2 w-6 rounded ${t === 'light' ? 'bg-[hsl(220,13%,91%)]' : 'bg-[hsl(222,47%,18%)]'}`} />
                          </div>
                        </div>
                        <p className="font-medium capitalize">{t}</p>
                        <p className="text-xs text-muted-foreground">{t === 'light' ? 'Clean and bright' : 'Easy on the eyes'}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
