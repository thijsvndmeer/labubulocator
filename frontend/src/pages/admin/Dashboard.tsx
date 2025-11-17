import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AdminDashboard = () => {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <Card>
        <CardHeader>
          <CardTitle>Welcome, Admin!</CardTitle>
          <CardDescription>
            This is your central hub to manage the Labubu Locator website.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Use the sidebar navigation to access different management sections.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;