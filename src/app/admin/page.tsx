
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
import { allResources, deleteResource, addResource } from "@/lib/data";
import { PlusCircle, Trash2, Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { Resource } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


const resourceSchema = z.object({
    name: z.string().min(1, "Name is required"),
    type: z.string().min(1, "Type is required"),
    location: z.string().min(1, "Location is required"),
    capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
    imageUrl: z.string().url("Must be a valid URL"),
    description: z.string().min(1, "Description is required"),
    resourceFor: z.enum(['student', 'faculty'], { required_error: 'Please select who this resource is for.' }),
});

type ResourceFormValues = z.infer<typeof resourceSchema>;

export default function AdminPage() {
    const [resources, setResources] = React.useState<Resource[]>(allResources);
    const [isDialogOpen, setDialogOpen] = React.useState(false);
    const { toast } = useToast();

    const studentResources = resources.filter(r => r.resourceFor === 'student');
    const facultyResources = resources.filter(r => r.resourceFor === 'faculty');

    const form = useForm<ResourceFormValues>({
        resolver: zodResolver(resourceSchema),
        defaultValues: {
            name: "",
            type: "",
            location: "",
            capacity: 1,
            imageUrl: "https://placehold.co/600x400.png",
            description: "",
        },
    });

    const handleDelete = (id: string) => {
        deleteResource(id);
        const updatedResources = allResources.filter(r => r.id !== id)
        setResources(updatedResources);
        toast({ title: "Resource Deleted", description: "The resource has been successfully removed." });
    };

    const onSubmit = (data: ResourceFormValues) => {
        addResource(data);
        setResources([...allResources]);
        toast({ title: "Resource Added", description: "The new resource is now available." });
        setDialogOpen(false);
        form.reset();
    };

    const ResourceTable = ({ resources }: { resources: Resource[] }) => (
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resources.map((resource) => (
                      <TableRow key={resource.id}>
                        <TableCell className="font-medium">{resource.name}</TableCell>
                        <TableCell><Badge variant="secondary">{resource.type}</Badge></TableCell>
                        <TableCell>{resource.location}</TableCell>
                        <TableCell>{resource.capacity}</TableCell>
                        <TableCell className="text-right">
                           <Button variant="ghost" size="icon" disabled>
                               <Edit className="h-4 w-4" />
                           </Button>
                           <Button variant="ghost" size="icon" onClick={() => handleDelete(resource.id)}>
                               <Trash2 className="h-4 w-4 text-destructive" />
                           </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Resource Management</CardTitle>
            <CardDescription>Add, edit, or delete campus resources for students and faculty.</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Resource
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Resource</DialogTitle>
                    <DialogDescription>Fill in the details for the new resource.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="type" render={({ field }) => (
                            <FormItem><FormLabel>Type</FormLabel><FormControl><Input {...field} placeholder="e.g. Study Room, Court" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="location" render={({ field }) => (
                            <FormItem><FormLabel>Location</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="capacity" render={({ field }) => (
                            <FormItem><FormLabel>Capacity</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField control={form.control} name="imageUrl" render={({ field }) => (
                            <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="resourceFor" render={({ field }) => (
                             <FormItem><FormLabel>Resource For</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select who can book this resource" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="student">Student</SelectItem>
                                        <SelectItem value="faculty">Faculty</SelectItem>
                                    </SelectContent>
                                </Select>
                            <FormMessage /></FormItem>
                        )} />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                            <Button type="submit">Save Resource</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="student">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="student">Student Resources</TabsTrigger>
            <TabsTrigger value="faculty">Faculty Resources</TabsTrigger>
          </TabsList>
          <TabsContent value="student" className="mt-4">
            <ResourceTable resources={studentResources} />
          </TabsContent>
          <TabsContent value="faculty" className="mt-4">
             <ResourceTable resources={facultyResources} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
