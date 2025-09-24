
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSections, addSection, deleteSection, departmentList } from "@/lib/data";
import { PlusCircle, Trash2 } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import type { Section } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const sectionSchema = z.object({
    name: z.string().min(1, "Section name is required (e.g., A, B, C).").regex(/^[A-Z]$/, "Must be a single uppercase letter."),
    department: z.string({ required_error: "Department is required." }),
    year: z.string({ required_error: "Year is required." }),
});

type SectionFormValues = z.infer<typeof sectionSchema>;

export default function SectionManagementPage() {
    const [sections, setSections] = React.useState<Section[]>([]);
    const [isDialogOpen, setDialogOpen] = React.useState(false);
    const { toast } = useToast();

    React.useEffect(() => {
        setSections(getSections());
    }, []);

    const form = useForm<SectionFormValues>({
        resolver: zodResolver(sectionSchema),
    });

    const handleDelete = (id: string) => {
        deleteSection(id);
        setSections(getSections());
        toast({ title: "Section Deleted", description: "The section has been successfully removed." });
    };

    const onSubmit = (data: SectionFormValues) => {
        addSection(data);
        setSections(getSections()); 
        toast({ title: "Section Added", description: "The new section is now available." });
        setDialogOpen(false);
        form.reset();
    };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Section Management</CardTitle>
            <CardDescription>Add, edit, or delete class sections for each department and year.</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <Button onClick={() => form.reset()}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Section
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Section</DialogTitle>
                    <DialogDescription>Fill in the details for the new section.</DialogDescription>
                </DialogHeader>
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Section Name</FormLabel><FormControl><Input {...field} placeholder="e.g. A, B, C..." /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="department" render={({ field }) => (
                            <FormItem><FormLabel>Department</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select a department" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {departmentList.map(dep => <SelectItem key={dep} value={dep}>{dep}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            <FormMessage /></FormItem>
                        )} />
                         <FormField control={form.control} name="year" render={({ field }) => (
                            <FormItem><FormLabel>Year</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select a year" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="1">1st Year</SelectItem>
                                        <SelectItem value="2">2nd Year</SelectItem>
                                        <SelectItem value="3">3rd Year</SelectItem>
                                        <SelectItem value="4">4th Year</SelectItem>
                                    </SelectContent>
                                </Select>
                            <FormMessage /></FormItem>
                        )} />
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                            <Button type="submit">Save Section</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Section Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sections.length > 0 ? sections.map((section) => (
                      <TableRow key={section.id}>
                        <TableCell className="font-medium">{section.name}</TableCell>
                        <TableCell>{section.department}</TableCell>
                        <TableCell>{section.year}</TableCell>
                        <TableCell className="text-right">
                           <Button variant="ghost" size="icon" onClick={() => handleDelete(section.id)}>
                               <Trash2 className="h-4 w-4 text-destructive" />
                           </Button>
                        </TableCell>
                      </TableRow>
                    )) : (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">No sections found. Add one to get started.</TableCell>
                    </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
