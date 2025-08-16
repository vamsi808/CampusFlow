
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
import { Check, X, Filter, Users, Building, GraduationCap } from "lucide-react";
import type { User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';

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

export default function AccountApprovalsPage() {
    const [pendingUsers, setPendingUsers] = React.useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = React.useState<User[]>([]);
    const { toast } = useToast();

    const [filters, setFilters] = React.useState({
        role: 'all',
        department: 'all',
        year: 'all',
        search: ''
    });

    React.useEffect(() => {
        const users = getPendingUsers();
        setPendingUsers(users);
        setFilteredUsers(users);
    }, []);

    React.useEffect(() => {
        let newFilteredUsers = pendingUsers.filter(user => {
            const roleMatch = filters.role === 'all' || user.role === filters.role;
            const departmentMatch = filters.department === 'all' || user.department === filters.department;
            const yearMatch = filters.year === 'all' || user.yearOfStudy?.includes(filters.year);
            const searchMatch = filters.search === '' ||
                user.fullName?.toLowerCase().includes(filters.search.toLowerCase()) ||
                user.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
                user.studentId?.toLowerCase().includes(filters.search.toLowerCase());
            return roleMatch && departmentMatch && yearMatch && searchMatch;
        });
        setFilteredUsers(newFilteredUsers);
    }, [filters, pendingUsers]);


    const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
    };

    const handleApproval = (userId: string, status: 'approved' | 'rejected') => {
        updateUserStatus(userId, status);
        const updatedUsers = pendingUsers.filter(user => user.id !== userId);
        setPendingUsers(updatedUsers);
        toast({
            title: `User ${status === 'approved' ? 'Approved' : 'Rejected'}`,
            description: `The user's account has been updated.`
        });
    };

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
                            {user.role === 'student' && `Dept: ${user.department || 'N/A'} | Year: ${user.yearOfStudy || 'N/A'} | Sec: ${user.section || 'N/A'}`}
                            {user.role === 'faculty' && `Dept: ${user.department || 'N/A'} | Job: ${user.jobTitle || 'N/A'}`}
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
                        <TableCell colSpan={5} className="h-24 text-center">No pending requests match the current filters.</TableCell>
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
        <CardDescription>Review and approve new user registration requests. {pendingUsers.length} requests pending.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 border rounded-lg bg-muted/50">
             <Input 
                placeholder="Search by name, email, or ID..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="lg:col-span-4"
             />
            <Select value={filters.role} onValueChange={(value) => handleFilterChange('role', value)}>
                <SelectTrigger><div className="flex items-center gap-2"><Users className="h-4 w-4" /> Role: <SelectValue /></div></SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="faculty">Faculty</SelectItem>
                </SelectContent>
            </Select>
             <Select value={filters.department} onValueChange={(value) => handleFilterChange('department', value)}>
                <SelectTrigger><div className="flex items-center gap-2"><Building className="h-4 w-4" /> Department: <SelectValue /></div></SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map(dep => <SelectItem key={dep} value={dep}>{dep}</SelectItem>)}
                </SelectContent>
            </Select>
            <Select value={filters.year} onValueChange={(value) => handleFilterChange('year', value)}>
                <SelectTrigger><div className="flex items-center gap-2"><GraduationCap className="h-4 w-4" /> Year: <SelectValue /></div></SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    <SelectItem value="1">1st Year</SelectItem>
                    <SelectItem value="2">2nd Year</SelectItem>
                    <SelectItem value="3">3rd Year</SelectItem>
                    <SelectItem value="4">4th Year</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <UserTable users={filteredUsers} />
      </CardContent>
    </Card>
  );
}
