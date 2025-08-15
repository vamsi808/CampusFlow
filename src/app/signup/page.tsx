
"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { UserPlus } from 'lucide-react';
import Link from 'next/link';

const signupSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  studentId: z.string().min(1, 'ID is required'),
  role: z.enum(['student', 'faculty'], { required_error: 'Please select a role' }),
  department: z.string().optional(),
  yearOfStudy: z.string().optional(),
  jobTitle: z.string().optional(),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      username: '',
      password: '',
      studentId: '',
      department: '',
      yearOfStudy: '',
      jobTitle: '',
    },
  });

  const selectedRole = useWatch({
    control: form.control,
    name: 'role'
  });

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    try {
      await signup(data);
      toast({
        title: 'Account Created',
        description: "You've been successfully signed up. Please log in.",
      });
      router.push('/login');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: (error as Error).message,
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <CardDescription>Join CampusFlow to book resources</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="fullName" render={({ field }) => (
                    <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Enter your full name" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="Enter your email" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="username" render={({ field }) => (
                    <FormItem><FormLabel>Username</FormLabel><FormControl><Input placeholder="Choose a username" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder="Create a password" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="studentId" render={({ field }) => (
                    <FormItem><FormLabel>University ID</FormLabel><FormControl><Input placeholder="Enter your ID" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="role" render={({ field }) => (
                    <FormItem><FormLabel>Role</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select your role" /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="student">Student</SelectItem>
                                <SelectItem value="faculty">Faculty</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />

                {selectedRole === 'student' && (
                    <>
                        <FormField control={form.control} name="department" render={({ field }) => (
                            <FormItem><FormLabel>Department</FormLabel><FormControl><Input placeholder="e.g. Computer Science" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="yearOfStudy" render={({ field }) => (
                            <FormItem><FormLabel>Year of Study</FormLabel><FormControl><Input placeholder="e.g. 3rd Year" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </>
                )}

                {selectedRole === 'faculty' && (
                     <>
                        <FormField control={form.control} name="department" render={({ field }) => (
                            <FormItem><FormLabel>Department</FormLabel><FormControl><Input placeholder="e.g. Physics" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="jobTitle" render={({ field }) => (
                            <FormItem><FormLabel>Job Title</FormLabel><FormControl><Input placeholder="e.g. Associate Professor" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </>
                )}

              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating Account...' : 'Sign Up'}
                <UserPlus className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm">
            <p>Already have an account? <Link href="/login" className="font-semibold text-primary hover:underline">Log In</Link></p>
        </CardFooter>
      </Card>
    </div>
  );
}

