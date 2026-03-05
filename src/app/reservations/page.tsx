
"use client";

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { allBookings, allResources } from "@/lib/data";
import { format } from "date-fns";
import { isPast } from "date-fns";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from '@/hooks/use-auth';

export default function ReservationsPage() {
  const { user } = useAuth();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const reservationsWithDetails = React.useMemo(() => {
    if (!isClient) return [];
    
    // Filter by the current user's ID or session
    const bookings = user ? allBookings.filter(b => b.userId === user.id || b.userId === 'currentUser') : [];
    
    return bookings.map(res => {
      const resource = allResources.find(r => r.id === res.resourceId);
      return { ...res, resourceName: resource?.name || "Unknown Resource" };
    });
  }, [user, isClient]);

  if (!isClient) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Reservations</CardTitle>
          <CardDescription>Loading your bookings...</CardDescription>
        </CardHeader>
        <CardContent className="h-24 flex items-center justify-center">
          <div className="animate-pulse bg-muted h-8 w-full rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Reservations</CardTitle>
        <CardDescription>View and manage your resource bookings.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resource</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
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
                      <div className="text-sm text-muted-foreground">{reservation.title}</div>
                    </TableCell>
                    <TableCell>{format(reservation.startTime, 'MMM d, yyyy')}</TableCell>
                    <TableCell>{`${format(reservation.startTime, 'h:mm a')} - ${format(reservation.endTime, 'h:mm a')}`}</TableCell>
                    <TableCell>
                      <Badge variant={isPast(reservation.endTime) ? "outline" : "default"}>
                        {isPast(reservation.endTime) ? "Completed" : "Upcoming"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                           <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                           </Button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="end">
                            <DropdownMenuItem>Modify</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Cancel</DropdownMenuItem>
                         </DropdownMenuContent>
                       </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    {user ? (
                      <>You have no reservations. <Link href="/" className="text-primary hover:underline">Browse resources</Link>.</>
                    ) : (
                      <>Please <Link href="/login" className="text-primary hover:underline">log in</Link> to view your reservations.</>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
