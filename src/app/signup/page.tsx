
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
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

const departments = [
    "Computer Science and Engineering",
    "Computer Science and Engineering Specialized in Data Science",
    "Computer Science and Engineering Specialized in Artificial Intelligence & Machine Learning",
    "Information Technology",
    "Electronics and Communication Engineering",
    "Electrical and Electronics Engineering",
    "Mechanical Engineering",
    "Aerospace Engineering"
];

const signupSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, "Please confirm your password"),
  studentId: z.string().min(1, 'ID is required'),
  role: z.enum(['student', 'faculty'], { required_error: 'Please select a role' }),
  department: z.string().optional(),
  yearOfStudy: z.string().optional(),
  jobTitle: z.string().optional(),
  section: z.string().optional().refine(val => !val || /^[A-Z]$/.test(val), {
      message: "Section must be a single uppercase letter.",
  }),
}).refine(data => {
    if (data.role === 'student' && data.yearOfStudy) {
        const year = parseInt(data.yearOfStudy.replace(/\D/g, ''), 10);
        return !isNaN(year) && year <= 4;
    }
    return true;
}, {
    message: "Year of study cannot be greater than 4.",
    path: ['yearOfStudy'],
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      studentId: '',
      department: '',
      yearOfStudy: '',
      jobTitle: '',
      section: '',
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
        title: 'Request Sent',
        description: "Your registration request has been sent to the admin for approval.",
      });
      router.push('/login');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: (error as Error).message,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <CardDescription>Join CampusFlow to book resources. Your account will require admin approval.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="fullName" render={({ field }) => (
                    <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Enter your full name" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="your.name@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="username" render={({ field }) => (
                    <FormItem><FormLabel>Username</FormLabel><FormControl><Input placeholder="Choose a username" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="studentId" render={({ field }) => (
                    <FormItem><FormLabel>University ID</FormLabel><FormControl><Input placeholder="Enter your ID" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem><FormLabel>Password</FormLabel>
                        <FormControl>
                            <div className="relative">
                                <Input type={showPassword ? "text" : "password"} placeholder="Create a password" {...field} />
                                <Button type="button" variant="ghost" size="icon" className="absolute top-0 right-0 h-full px-3" onClick={() => setShowPassword(prev => !prev)}>
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    <span className="sr-only">{showPassword ? "Hide" : "Show"} password</span>
                                </Button>
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                     <FormItem><FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                            <div className="relative">
                                <Input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm your password" {...field} />
                                <Button type="button" variant="ghost" size="icon" className="absolute top-0 right-0 h-full px-3" onClick={() => setShowConfirmPassword(prev => !prev)}>
                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    <span className="sr-only">{showConfirmPassword ? "Hide" : "Show"} password</span>
                                </Button>
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <div className="md:col-span-2">
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
                </div>

                {selectedRole === 'student' && (
                    <>
                        <FormField control={form.control} name="department" render={({ field }) => (
                            <FormItem><FormLabel>Department</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select your department" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {departments.map(dep => <SelectItem key={dep} value={dep}>{dep}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            <FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="yearOfStudy" render={({ field }) => (
                            <FormItem><FormLabel>Year of Study</FormLabel><FormControl><Input placeholder="e.g. 3 or 3rd Year" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField control={form.control} name="section" render={({ field }) => (
                            <FormItem><FormLabel>Section</FormLabel><FormControl><Input placeholder="e.g. A" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </>
                )}

                {selectedRole === 'faculty' && (
                     <>
                        <FormField control={form.control} name="department" render={({ field }) => (
                             <FormItem><FormLabel>Department</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select your department" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {departments.map(dep => <SelectItem key={dep} value={dep}>{dep}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            <FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="jobTitle" render={({ field }) => (
                            <FormItem><FormLabel>Job Title</FormLabel><FormControl><Input placeholder="e.g. Associate Professor" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </>
                )}

              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Submitting Request...' : 'Request Account'}
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
