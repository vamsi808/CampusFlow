
"use client";

import * as React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { allResources, userReservations } from '@/lib/data';
import { format, formatDistanceToNow, isPast, isFuture, getMonth } from 'date-fns';
import { User, Mail, Calendar, LogOut, Briefcase, Edit, Clock, BarChart2, Pencil, Building, GraduationCap, Award, CalendarClock, CalendarCheck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ChartRoot, ChartBar, ChartBarRoot, ChartTooltip, ChartTooltipContent, ChartXAxis, ChartYAxis, ChartLegend, ChartLegendContent, ChartPieRoot, ChartPie, ChartGrid } from "@/components/ui/chart";

const profileSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  studentId: z.string().min(1, "ID is required"),
  department: z.string().optional(),
  yearOfStudy: z.string().optional(),
  jobTitle: z.string().optional(),
});


const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const avatarSchema = z.object({
  avatarFile: z
    .any()
    .refine((files) => files?.length == 1, "Image is required.")
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 4MB.`)
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      ".jpg, .jpeg, .png and .webp files are accepted."
    ),
});


type ProfileFormValues = z.infer<typeof profileSchema>;
type AvatarFormValues = z.infer<typeof avatarSchema>;


export default function ProfilePage() {
  const { user, logout, isLoading, updateUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isProfileDialogOpen, setProfileDialogOpen] = React.useState(false);
  const [isAvatarDialogOpen, setAvatarDialogOpen] = React.useState(false);


  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      studentId: user?.studentId || '',
      department: user?.department || '',
      yearOfStudy: user?.yearOfStudy || '',
      jobTitle: user?.jobTitle || '',
    }
  });

  const avatarForm = useForm<AvatarFormValues>({
      resolver: zodResolver(avatarSchema)
  });

  React.useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);
  
  React.useEffect(() => {
    if (user) {
        profileForm.reset({
            fullName: user.fullName || '',
            email: user.email || '',
            studentId: user.studentId || '',
            department: user.department || '',
            yearOfStudy: user.yearOfStudy || '',
            jobTitle: user.jobTitle || '',
        });
    }
  }, [user, profileForm]);


  if (isLoading || !user) {
    return (
        <div className="space-y-8">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
    );
  }
  
  const onProfileSubmit = async (data: ProfileFormValues) => {
    try {
        await updateUser(data);
        toast({ title: "Profile Updated", description: "Your information has been saved." });
        setProfileDialogOpen(false);
    } catch (error) {
        toast({ variant: 'destructive', title: "Update Failed", description: (error as Error).message });
    }
  };

  const onAvatarSubmit = async (data: AvatarFormValues) => {
    const file = data.avatarFile[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
        const avatarUrl = reader.result as string;
        try {
            await updateUser({ avatarUrl });
            toast({ title: "Avatar Updated", description: "Your profile picture has been changed." });
            setAvatarDialogOpen(false);
            avatarForm.reset();
        } catch (error) {
            toast({ variant: 'destructive', title: "Update Failed", description: (error as Error).message });
        }
    };
    reader.onerror = () => {
        toast({ variant: 'destructive', title: "File Read Error", description: "Could not read the selected file." });
    }
  };

  const reservationsWithDetails = userReservations.map(res => {
    const resource = allResources.find(r => r.id === res.resourceId);
    return { ...res, resourceName: resource?.name || "Unknown", resourceType: resource?.type || "Unknown" };
  });

  const getRoleDescription = () => {
    if (user.role === 'student' && user.yearOfStudy) {
        return `${user.yearOfStudy}`;
    }
    if ((user.role === 'faculty' || user.role === 'admin') && user.jobTitle) {
        return user.jobTitle;
    }
    return user.role.charAt(0).toUpperCase() + user.role.slice(1);
  };
  
  const monthlyBookingData = React.useMemo(() => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyCounts = Array(12).fill(0).map((_, i) => ({ month: monthNames[i], total: 0 }));
    
    reservationsWithDetails.forEach(res => {
        const monthIndex = getMonth(res.startTime);
        monthlyCounts[monthIndex].total += 1;
    });

    return monthlyCounts;
  }, [reservationsWithDetails]);

  const resourceTypeData = React.useMemo(() => {
    const typeCounts: {[key: string]: number} = {};
    reservationsWithDetails.forEach(res => {
        typeCounts[res.resourceType] = (typeCounts[res.resourceType] || 0) + 1;
    });
    return Object.entries(typeCounts).map(([type, count], index) => ({
      name: type,
      count: count,
      fill: `hsl(var(--chart-${(index % 5) + 1}))`
    }));
  }, [reservationsWithDetails]);


  return (
    <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1 space-y-6">
            <Card>
                <CardHeader className="items-center text-center">
                    <div className="relative group">
                        <Avatar className="w-24 h-24 mb-4 border-2 border-primary">
                            <AvatarImage src={user.avatarUrl || `https://i.pravatar.cc/300?u=${user.id}`} alt={user.username} />
                            <AvatarFallback>{user.username.substring(0,2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <Dialog open={isAvatarDialogOpen} onOpenChange={setAvatarDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="icon" className="absolute bottom-4 right-0 rounded-full w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background">
                                    <Pencil className="w-4 h-4" />
                                    <span className="sr-only">Edit Profile Picture</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Change Profile Picture</DialogTitle>
                                    <DialogDescription>Upload a new image for your avatar.</DialogDescription>
                                </DialogHeader>
                                <Form {...avatarForm}>
                                    <form onSubmit={avatarForm.handleSubmit(onAvatarSubmit)} className="space-y-4">
                                        <FormField control={avatarForm.control} name="avatarFile" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>New Avatar Image</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        type="file" 
                                                        accept="image/png, image/jpeg, image/webp"
                                                        onChange={(e) => field.onChange(e.target.files)}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <DialogFooter>
                                            <Button type="button" variant="outline" onClick={() => {setAvatarDialogOpen(false); avatarForm.reset()}}>Cancel</Button>
                                            <Button type="submit">Save</Button>
                                        </DialogFooter>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <CardTitle>{user.fullName || user.username}</CardTitle>
                    <CardDescription className="capitalize">{getRoleDescription()}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Separator />
                    <div className="space-y-3 text-sm text-muted-foreground">
                         <div className="flex items-center gap-3">
                            <Award className="w-4 h-4 text-primary" />
                            <span>ID: {user.studentId || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <User className="w-4 h-4 text-primary" />
                            <span>@{user.username}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-primary" />
                            <span>{user.email || 'No email provided'}</span>
                        </div>
                        {user.department && (
                             <div className="flex items-center gap-3">
                                <Building className="w-4 h-4 text-primary" />
                                <span>{user.department}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span>Joined {user.dateJoined ? formatDistanceToNow(new Date(user.dateJoined), { addSuffix: true }) : 'recently'}</span>
                        </div>
                    </div>
                    <Separator />
                    <Dialog open={isProfileDialogOpen} onOpenChange={setProfileDialogOpen}>
                        <DialogTrigger asChild>
                           <Button variant="outline" className="w-full">
                                <Edit className="mr-2 h-4 w-4" /> Edit Profile
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit Profile</DialogTitle>
                                <DialogDescription>Update your personal information.</DialogDescription>
                            </DialogHeader>
                             <Form {...profileForm}>
                                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                                    <FormField control={profileForm.control} name="fullName" render={({ field }) => (
                                        <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={profileForm.control} name="email" render={({ field }) => (
                                        <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={profileForm.control} name="studentId" render={({ field }) => (
                                        <FormItem><FormLabel>University ID</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={profileForm.control} name="department" render={({ field }) => (
                                        <FormItem><FormLabel>Department</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />

                                    {user.role === 'student' && (
                                        <FormField control={profileForm.control} name="yearOfStudy" render={({ field }) => (
                                            <FormItem><FormLabel>Year of Study</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    )}

                                    {(user.role === 'faculty' || user.role === 'admin') && (
                                         <FormField control={profileForm.control} name="jobTitle" render={({ field }) => (
                                            <FormItem><FormLabel>Job Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    )}

                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setProfileDialogOpen(false)}>Cancel</Button>
                                        <Button type="submit">Save Changes</Button>
                                    </DialogFooter>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                     <Button variant="destructive" className="w-full" onClick={logout}>
                        <LogOut className="mr-2 h-4 w-4" /> Logout
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <BarChart2 className="w-5 h-5" /> Usage Stats
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Total Bookings</span>
                        <span className="font-bold">{userReservations.length}</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Active Bookings</span>
                        <span className="font-bold">{userReservations.filter(r => !isPast(r.endTime)).length}</span>
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Monthly Bookings</CardTitle>
                        <CardDescription>Your booking activity over the year.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartRoot config={{
                            total: { label: 'Bookings', color: "hsl(var(--chart-1))" },
                        }} className="h-[200px]">
                            <ChartBarRoot data={monthlyBookingData}>
                                <ChartXAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                                <ChartYAxis hide={true} />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                <ChartBar dataKey="total" radius={8} />
                            </ChartBarRoot>
                        </ChartRoot>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Resource Types</CardTitle>
                        <CardDescription>Your most frequently booked resource types.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center">
                         <ChartRoot config={{
                            count: { label: 'Bookings' },
                            ...resourceTypeData.reduce((acc, cur) => ({...acc, [cur.name]: {label: cur.name, color: cur.fill}}), {})
                         }} className="h-[200px] w-[200px]">
                             <ChartPieRoot>
                                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                                <ChartPie data={resourceTypeData} dataKey="count" nameKey="name" innerRadius={50} />
                             </ChartPieRoot>
                         </ChartRoot>
                    </CardContent>
                </Card>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Your Bookings</CardTitle>
                    <CardDescription>A quick look at your upcoming and recent reservations.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-semibold flex items-center gap-2 mb-3"><CalendarClock className="w-5 h-5 text-primary" /> Upcoming</h3>
                        <div className="space-y-4">
                            {reservationsWithDetails.filter(r => isFuture(r.startTime)).map(res => (
                                <div key={res.id} className="flex items-center">
                                    <div className="flex-1 space-y-1">
                                        <p className="font-medium">{res.resourceName}</p>
                                        <p className="text-sm text-muted-foreground">{format(res.startTime, 'MMM d, yyyy, h:mm a')}</p>
                                    </div>
                                    <Button variant="secondary" size="sm" asChild>
                                        <Link href={`/resource/${res.resourceId}`}>View</Link>
                                    </Button>
                                </div>
                            ))}
                            {reservationsWithDetails.filter(r => isFuture(r.startTime)).length === 0 && (
                                <p className="text-sm text-muted-foreground">No upcoming bookings.</p>
                            )}
                        </div>
                    </div>
                     <div>
                        <h3 className="font-semibold flex items-center gap-2 mb-3"><CalendarCheck className="w-5 h-5 text-muted-foreground" /> Recent</h3>
                        <div className="space-y-4">
                             {reservationsWithDetails.filter(r => isPast(r.endTime)).slice(0,3).map(res => (
                                <div key={res.id} className="flex items-center">
                                    <div className="flex-1 space-y-1">
                                        <p className="font-medium">{res.resourceName}</p>
                                        <p className="text-sm text-muted-foreground">{format(res.endTime, 'MMM d, yyyy')}</p>
                                    </div>
                                    <Badge variant="outline">Completed</Badge>
                                </div>
                            ))}
                            {reservationsWithDetails.filter(r => isPast(r.endTime)).length === 0 && (
                                <p className="text-sm text-muted-foreground">No recent bookings.</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
