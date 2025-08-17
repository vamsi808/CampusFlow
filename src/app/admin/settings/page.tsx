
"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Users, Settings, Shield, BarChart, HardHat, FileText, Briefcase } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export default function AdminSettingsPage() {
    const [maintenanceDate, setMaintenanceDate] = React.useState<Date | undefined>(new Date())

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Administrator Settings</h2>
        <p className="text-muted-foreground">
          Manage campus-wide settings, user roles, and system configurations.
        </p>
      </div>
      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1 */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><HardHat className="w-5 h-5" /> System & Campus Settings</CardTitle>
                    <CardDescription>Global configurations that affect all users.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                            <Label htmlFor="maintenance-mode" className="font-semibold">System Maintenance Mode</Label>
                            <p className="text-sm text-muted-foreground">Temporarily disable access to the booking system for all users.</p>
                        </div>
                        <Switch id="maintenance-mode" />
                    </div>
                    <div>
                        <Label className="font-semibold">Blackout Dates & Holidays</Label>
                        <p className="text-sm text-muted-foreground mb-2">Define dates when most resources are unavailable for booking (e.g., public holidays).</p>
                        <div className="flex flex-col sm:flex-row gap-2">
                             <Popover>
                                <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className="w-full sm:w-[280px] justify-start text-left font-normal"
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {maintenanceDate ? format(maintenanceDate, "PPP") : <span>Pick a date to add</span>}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={maintenanceDate}
                                    onSelect={setMaintenanceDate}
                                    initialFocus
                                />
                                </PopoverContent>
                            </Popover>
                            <Button disabled>Add Blackout Date</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Briefcase className="w-5 h-5" /> Resource Management</CardTitle>
                    <CardDescription>Define booking policies and manage resource categories.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="max-booking-lead-time" className="font-semibold">Booking Policies</Label>
                        <p className="text-sm text-muted-foreground mb-2">Set general rules for all resource bookings.</p>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="max-lead-time" className="text-xs">Max Lead Time (days)</Label>
                                <Input id="max-lead-time" defaultValue="30" />
                            </div>
                             <div className="space-y-1">
                                <Label htmlFor="max-duration" className="text-xs">Max Booking Duration (hours)</Label>
                                <Input id="max-duration" defaultValue="4" />
                            </div>
                        </div>
                    </div>
                     <div>
                        <Label htmlFor="resource-categories" className="font-semibold">Resource Categories</Label>
                        <p className="text-sm text-muted-foreground mb-2">Add or edit the types of resources available (e.g., Study Room, Lab).</p>
                        <div className="flex gap-2">
                            <Input id="resource-categories" placeholder="Enter new category name" />
                            <Button disabled>Add Category</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
          </div>

          {/* Column 2 */}
          <div className="space-y-6">
              <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" /> Access Management</CardTitle>
                    <CardDescription>Manage user roles and permissions across the platform.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="new-admin-email">Invite New Admin</Label>
                        <div className="flex gap-2">
                            <Input id="new-admin-email" placeholder="user@example.com" type="email" />
                            <Button disabled>Invite</Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Role Permissions</Label>
                        <p className="text-sm text-muted-foreground">Define what different roles can do.</p>
                        <Select defaultValue="faculty">
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="student">Student</SelectItem>
                                <SelectItem value="faculty">Faculty</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" className="w-full" disabled>Configure Permissions</Button>
                    </div>
                </CardContent>
              </Card>

               <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" /> Approval Workflow</CardTitle>
                    <CardDescription>Configure the process for new user account approvals.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="multi-level-approval" className="font-semibold">Multi-level Approval</Label>
                        <Switch id="multi-level-approval" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="approval-delegate">Escalation & Delegates</Label>
                        <p className="text-sm text-muted-foreground">Assign a delegate for pending approvals.</p>
                        <Select disabled>
                            <SelectTrigger><SelectValue placeholder="Select a delegate..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admin2">Admin 2</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
              </Card>
              
               <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BarChart className="w-5 h-5" /> Reporting</CardTitle>
                    <CardDescription>Configure and export system usage reports.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label>Export Usage Data</Label>
                        <Select>
                            <SelectTrigger><SelectValue placeholder="Select report type..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="user-activity">User Activity</SelectItem>
                                <SelectItem value="resource-utilization">Resource Utilization</SelectItem>
                                <SelectItem value="booking-trends">Booking Trends</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button className="w-full" disabled>Generate and Download Report</Button>
                </CardContent>
              </Card>
          </div>
      </div>
    </div>
  )
}
