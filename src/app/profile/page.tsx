
"use client";

import * as React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { allResources, userReservations } from '@/lib/data';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { User, Mail, Calendar, LogOut, Briefcase, Edit, Clock, BarChart2, Pencil } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const profileSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
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
    return { ...res, resourceName: resource?.name || "Unknown" };
  });

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
                    <CardDescription className="capitalize">{user.role}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Separator />
                    <div className="space-y-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-3">
                            <User className="w-4 h-4 text-primary" />
                            <span>@{user.username}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-primary" />
                            <span>{user.email || 'No email provided'}</span>
                        </div>
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

        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Booking History</CardTitle>
                    <CardDescription>A record of your past and upcoming reservations.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Resource</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reservationsWithDetails.length > 0 ? (
                                reservationsWithDetails.map((reservation) => (
                                <TableRow key={reservation.id}>
                                    <TableCell className="font-medium">
                                        <Link href={`/resource/${reservation.resourceId}`} className="hover:underline">
                                            {reservation.resourceName}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{format(reservation.startTime, 'MMM d, yyyy')}</TableCell>
                                    <TableCell>{`${format(reservation.startTime, 'h:mm a')} - ${format(reservation.endTime, 'h:mm a')}`}</TableCell>
                                    <TableCell>
                                    <Badge variant={isPast(reservation.endTime) ? "outline" : "default"}>
                                        {isPast(reservation.endTime) ? "Completed" : "Upcoming"}
                                    </Badge>
                                    </TableCell>
                                </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    You have no booking history.
                                </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
