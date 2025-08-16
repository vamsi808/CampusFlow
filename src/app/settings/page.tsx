
"use client"

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Switch } from '@/components/ui/switch';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Shield, Smartphone, Monitor } from 'lucide-react';
import { format } from 'date-fns';

const profileSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
});

const passwordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match.",
    path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const { user, isLoading, updateUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [theme, setTheme] = React.useState('light');

  React.useEffect(() => {
    const storedTheme = localStorage.getItem('theme') || 'light';
    setTheme(storedTheme);
    document.documentElement.className = storedTheme;
  }, []);
  
  React.useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: '', email: '', username: '' }
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' }
  });

  React.useEffect(() => {
    if (user) {
      profileForm.reset({
        fullName: user.fullName || '',
        email: user.email || '',
        username: user.username || '',
      });
    }
  }, [user, profileForm]);

  const onProfileSubmit = async (data: ProfileFormValues) => {
    try {
        await updateUser(data);
        toast({ title: "Profile Updated", description: "Your profile information has been successfully updated." });
    } catch (error) {
        toast({ variant: "destructive", title: "Update Failed", description: (error as Error).message });
    }
  };

  const onPasswordSubmit = (data: PasswordFormValues) => {
    // This is a mock function since we don't have a backend to handle password changes.
    console.log("Password change data:", data);
    toast({ title: "Password Updated", description: "Your password has been changed successfully. (This is a demo)" });
    passwordForm.reset();
  };
  
  const handleThemeChange = (newTheme: 'light' | 'dark') => {
      setTheme(newTheme);
      document.documentElement.className = newTheme;
      localStorage.setItem('theme', newTheme);
  }

  const handleFontSizeChange = (size: 'sm' | 'base' | 'lg') => {
    // In a real app, you would likely set a class on the `<html>` or `<body>` tag
    // and use CSS variables to adjust font sizes throughout the application.
    // For this demo, we'll just log the change.
    console.log("Font size changed to:", size);
    toast({ title: "Font Size Updated", description: `Font size set to ${size}. (Demo)`});
  }

  if (isLoading || !user) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-10 w-1/4" />
            <Skeleton className="h-8 w-1/3" />
            <Card>
                <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-1/4 self-end" />
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your account settings, preferences, and appearance.</p>
      </div>
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Public Profile</CardTitle>
          <CardDescription>This information may be visible to others.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
              <FormField control={profileForm.control} name="username" render={({ field }) => (
                  <FormItem><FormLabel>Username</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={profileForm.control} name="fullName" render={({ field }) => (
                  <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={profileForm.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <Button type="submit" disabled={profileForm.formState.isSubmitting}>
                {profileForm.formState.isSubmitting ? "Saving..." : "Update Profile"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>Security &amp; Login</CardTitle>
            <CardDescription>Manage your password, two-factor authentication, and see active sessions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div>
                <h3 className="font-medium mb-2">Change Password</h3>
                <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4 max-w-md">
                <FormField control={passwordForm.control} name="currentPassword" render={({ field }) => (
                    <FormItem><FormLabel>Current Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={passwordForm.control} name="newPassword" render={({ field }) => (
                    <FormItem><FormLabel>New Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={passwordForm.control} name="confirmPassword" render={({ field }) => (
                    <FormItem><FormLabel>Confirm New Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormMessage>
                )} />
                <Button type="submit" disabled={passwordForm.formState.isSubmitting}>Update Password</Button>
                </form>
            </Form>
            </div>
            <Separator />
            <div>
                <h3 className="font-medium mb-2">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between p-4 border rounded-md">
                    <div>
                        <h4 className="font-normal flex items-center gap-2"><Shield className="w-4 h-4 text-primary"/> 2FA is currently disabled</h4>
                        <p className="text-sm text-muted-foreground mt-1">Add an extra layer of security to your account.</p>
                    </div>
                    <Button disabled>Set Up 2FA</Button>
                </div>
            </div>
            <Separator />
             <div>
                <h3 className="font-medium mb-2">Session Management</h3>
                <p className="text-sm text-muted-foreground mb-4">You are currently logged in on these devices. You can log out of sessions you don't recognize.</p>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-md">
                        <div className="flex items-center gap-4">
                            <Monitor className="w-6 h-6 text-primary"/>
                            <div>
                                <h4 className="font-semibold">This Mac</h4>
                                <p className="text-sm text-muted-foreground">Chrome - Current session</p>
                            </div>
                        </div>
                         <Button variant="outline" disabled>Current</Button>
                    </div>
                     <div className="flex items-center justify-between p-4 border rounded-md">
                        <div className="flex items-center gap-4">
                            <Smartphone className="w-6 h-6 text-muted-foreground"/>
                            <div>
                                <h4 className="font-semibold">iPhone 15 Pro</h4>
                                <p className="text-sm text-muted-foreground">Safari - Logged in {format(new Date(), "MMM d, yyyy")}</p>
                            </div>
                        </div>
                         <Button variant="outline" disabled>Log out</Button>
                    </div>
                </div>
                <div className="mt-4 flex justify-between items-center">
                    <Button variant="outline" disabled>View login activity</Button>
                    <Button variant="destructive" disabled>Log out of all other sessions</Button>
                </div>
             </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize the look and feel of the application.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-medium">Theme</h3>
            <p className="text-sm text-muted-foreground">Select the theme for the dashboard.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div 
              className={`cursor-pointer rounded-md border-2 p-1 ${theme === 'light' ? 'border-primary' : 'border-transparent'}`}
              onClick={() => handleThemeChange('light')}
            >
              <div className="items-center rounded-md bg-[#ecedef] p-2">
                <div className="space-y-2 rounded-sm bg-white p-2 shadow-sm">
                  <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
                    <div className="h-2 w-[80px] rounded-lg bg-[#ecedef]" />
                    <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                  </div>
                  <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                    <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                    <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                  </div>
                </div>
              </div>
              <span className="block w-full p-2 text-center font-normal">Light</span>
            </div>

            <div 
              className={`cursor-pointer rounded-md border-2 p-1 ${theme === 'dark' ? 'border-primary' : 'border-transparent'}`}
              onClick={() => handleThemeChange('dark')}
            >
              <div className="items-center rounded-md bg-slate-950 p-2">
                 <div className="space-y-2 rounded-sm bg-slate-800 p-2 shadow-sm">
                  <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                    <div className="h-2 w-[80px] rounded-lg bg-slate-400" />
                    <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                  </div>
                  <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                    <div className="h-4 w-4 rounded-full bg-slate-400" />
                    <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                  </div>
                </div>
              </div>
              <span className="block w-full p-2 text-center font-normal">Dark</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Accessibility</CardTitle>
          <CardDescription>Adjust settings to improve your experience.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
                <h3 className="font-medium">Font Size</h3>
                <p className="text-sm text-muted-foreground">Adjust the application's font size for better readability.</p>
            </div>
             <RadioGroup defaultValue="base" onValueChange={(val) => handleFontSizeChange(val as any)} className="flex items-center gap-4">
                <div className="flex items-center space-x-3 space-y-0">
                    <RadioGroupItem value="sm" id="font-sm" />
                    <Label htmlFor="font-sm" className="font-normal">Small</Label>
                </div>
                <div className="flex items-center space-x-3 space-y-0">
                    <RadioGroupItem value="base" id="font-base" />
                    <Label htmlFor="font-base" className="font-normal">Default</Label>
                </div>
                <div className="flex items-center space-x-3 space-y-0">
                    <RadioGroupItem value="lg" id="font-lg" />
                    <Label htmlFor="font-lg" className="font-normal">Large</Label>
                </div>
            </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Manage how you receive notifications from us.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
             <div className="space-y-4">
                <h3 className="font-medium">Channels</h3>
                 <div className="flex items-center justify-between p-4 border rounded-md">
                     <div>
                        <h4 className="font-normal">Email Notifications</h4>
                        <p className="text-sm text-muted-foreground">Receive notifications via your registered email.</p>
                     </div>
                     <Switch id="email-notifications" defaultChecked />
                 </div>
                 <div className="flex items-center justify-between p-4 border rounded-md">
                     <div>
                        <h4 className="font-normal">SMS Alerts</h4>
                        <p className="text-sm text-muted-foreground">Get critical alerts via text message (charges may apply).</p>
                     </div>
                     <Switch id="sms-alerts" />
                 </div>
                 <div className="flex items-center justify-between p-4 border rounded-md">
                     <div>
                        <h4 className="font-normal">Push Notifications</h4>
                        <p className="text-sm text-muted-foreground">Receive notifications directly on your device.</p>
                     </div>
                     <Switch id="push-notifications" />
                 </div>
             </div>
             <Separator />
             <div className="space-y-4">
                 <h3 className="font-medium">Notification Types</h3>
                 <p className="text-sm text-muted-foreground">Select the types of notifications you want to receive.</p>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-3">
                        <Checkbox id="notif-confirmations" defaultChecked />
                        <div className="grid gap-1.5 leading-none">
                            <label htmlFor="notif-confirmations" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Booking Confirmations</label>
                            <p className="text-sm text-muted-foreground">Get notified when your booking is confirmed.</p>
                        </div>
                    </div>
                    <div className="flex items-start space-x-3">
                        <Checkbox id="notif-reminders" defaultChecked />
                        <div className="grid gap-1.5 leading-none">
                            <label htmlFor="notif-reminders" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Reminders</label>
                            <p className="text-sm text-muted-foreground">Receive reminders for your upcoming bookings.</p>
                        </div>
                    </div>
                     <div className="flex items-start space-x-3">
                        <Checkbox id="notif-approvals" defaultChecked />
                        <div className="grid gap-1.5 leading-none">
                            <label htmlFor="notif-approvals" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Approval Status</label>
                            <p className="text-sm text-muted-foreground">Alerts for your account approval status.</p>
                        </div>
                    </div>
                     <div className="flex items-start space-x-3">
                        <Checkbox id="notif-system" />
                        <div className="grid gap-1.5 leading-none">
                            <label htmlFor="notif-system" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">System Announcements</label>
                            <p className="text-sm text-muted-foreground">Receive news and updates from the platform.</p>
                        </div>
                    </div>
                 </div>
             </div>
        </CardContent>
      </Card>
      
      <Card>
          <CardHeader>
              <CardTitle>Danger Zone</CardTitle>
              <CardDescription>Permanent actions that cannot be undone.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
              <div>
                  <h4 className="font-semibold">Delete Account</h4>
                  <p className="text-sm text-muted-foreground">Once you delete your account, there is no going back. Please be certain.</p>
              </div>
              <Button variant="destructive" disabled>Delete Account</Button>
          </CardContent>
      </Card>
    </div>
  );
}
