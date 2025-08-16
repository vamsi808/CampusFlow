
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
import { getPendingUsers, updateUserStatus } from "@/lib/data";
import { Check, X, Users, School } from "lucide-react";
import type { User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


export default function AccountApprovalsPage() {
    const [pendingUsers, setPendingUsers] = React.useState<User[]>([]);
    const { toast } = useToast();

    React.useEffect(() => {
        setPendingUsers(getPendingUsers());
    }, []);

    const handleApproval = (userId: string, status: 'approved' | 'rejected') => {
        updateUserStatus(userId, status);
        setPendingUsers(currentUsers => currentUsers.filter(user => user.id !== userId));
        toast({
            title: `User ${status === 'approved' ? 'Approved' : 'Rejected'}`,
            description: `The user's account has been updated.`
        });
    };

    const institutionalUsers = pendingUsers.filter(u => u.email?.endsWith('@mlrit.ac.in'));
    const otherUsers = pendingUsers.filter(u => !u.email?.endsWith('@mlrit.ac.in'));

    const UserTable = ({ users }: { users: User[] }) => (
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {users.length > 0 ? users.map((user) => (
                    <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.fullName}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell><Badge variant="secondary" className="capitalize">{user.role}</Badge></TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                            {user.role === 'student' && `Year: ${user.yearOfStudy || 'N/A'}`}
                            {user.role === 'faculty' && `Job: ${user.jobTitle || 'N/A'}`}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                            <Button variant="outline" size="icon" className="text-green-600 hover:text-green-700" onClick={() => handleApproval(user.id, 'approved')}>
                                <Check className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="text-destructive" onClick={() => handleApproval(user.id, 'rejected')}>
                                <X className="h-4 w-4" />
                            </Button>
                        </TableCell>
                    </TableRow>
                )) : (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">No pending requests in this category.</TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
        </div>
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Approvals</CardTitle>
        <CardDescription>Review and approve new user registration requests.</CardDescription>
      </CardHeader>
      <CardContent>
         <Tabs defaultValue="institutional">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="institutional">
                    <School className="mr-2 h-4 w-4" />
                    Institutional Accounts ({institutionalUsers.length})
                </TabsTrigger>
                <TabsTrigger value="other">
                    <Users className="mr-2 h-4 w-4" />
                    Other Accounts ({otherUsers.length})
                </TabsTrigger>
            </TabsList>
            <TabsContent value="institutional" className="mt-4">
               <UserTable users={institutionalUsers} />
            </TabsContent>
            <TabsContent value="other" className="mt-4">
                <UserTable users={otherUsers} />
            </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
