
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
import { User, Mail, Calendar, LogOut, Briefcase, Edit, Clock, BarChart2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
        <div className="space-y-8">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
    );
  }

  const reservationsWithDetails = userReservations.map(res => {
    const resource = allResources.find(r => r.id === res.resourceId);
    return { ...res, resourceName: resource?.name || "Unknown" };
  });

  return (
    <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1 space-y-6">
            <Card>
                <CardHeader className="items-center text-center">
                    <Avatar className="w-24 h-24 mb-4 border-2 border-primary">
                        <AvatarImage src="https://i.pravatar.cc/300" alt={user.username} />
                        <AvatarFallback>{user.username.substring(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
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
                    <Button variant="outline" className="w-full">
                        <Edit className="mr-2" /> Edit Profile
                    </Button>
                     <Button variant="destructive" className="w-full" onClick={logout}>
                        <LogOut className="mr-2" /> Logout
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
