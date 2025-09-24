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

export default function ReservationsPage() {
  // In a real app, you would get the current user's ID and filter reservations.
  // For this example, we'll just show all bookings for simplicity in this view.
  const reservationsWithDetails = allBookings.map(res => {
    const resource = allResources.find(r => r.id === res.resourceId);
    return { ...res, resourceName: resource?.name || "Unknown Resource" };
  });

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
                    You have no reservations. <Link href="/" className="text-primary hover:underline">Browse resources</Link>.
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
