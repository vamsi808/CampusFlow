
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
          <CardTitle>Password</CardTitle>
          <CardDescription>Change your password here. Use a strong, unique password for your security.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <FormField control={passwordForm.control} name="currentPassword" render={({ field }) => (
                <FormItem><FormLabel>Current Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={passwordForm.control} name="newPassword" render={({ field }) => (
                <FormItem><FormLabel>New Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={passwordForm.control} name="confirmPassword" render={({ field }) => (
                <FormItem><FormLabel>Confirm New Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <Button type="submit" disabled={passwordForm.formState.isSubmitting}>Update Password</Button>
            </form>
          </Form>
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
