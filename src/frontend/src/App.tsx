import DashboardLayout from '@/components/layout/DashboardLayout';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';


function App() {
    return (
        <DashboardLayout>
            <div className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Employee Engagement Dashboard</CardTitle>
                        <CardDescription>
                            Welcome to the CAMPS (Certainty, Autonomy, Meaning, Progress, Social Inclusion)
                            employee engagement tracker. Select a team from the sidebar to get started.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            Select an employee from the sidebar to view their engagement ratings and action items.
                        </p>
                    </CardContent>
                </Card>

                {/* Dashboard content will go here later */}
                <Card>
                    <CardContent className="p-8">
                        <p className="text-center text-muted-foreground">
                            Dashboard content will be displayed here
                        </p>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}

export default App
