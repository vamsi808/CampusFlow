
import { SectionTimetable } from "@/components/section-timetable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TimetablePage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Section Timetable</CardTitle>
                <CardDescription>Your weekly schedule of classes, labs, and events.</CardDescription>
            </CardHeader>
            <CardContent>
                <SectionTimetable />
            </CardContent>
        </Card>
    )
}
