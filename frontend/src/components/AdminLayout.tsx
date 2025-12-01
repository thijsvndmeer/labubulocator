import { Outlet, Link, useNavigate } from 'react-router-dom';
import { PanelLeft, Boxes, Users, FileText, Menu, Settings, LogOut, LayoutDashboard, Navigation as NavigationIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';

const AdminLayout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    toast({
      title: 'Logged Out',
      description: 'You have been logged out from the admin panel.',
    });
    navigate('/admin/login');
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            to="/admin/dashboard"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <PanelLeft className="h-4 w-4 transition-all group-hover:scale-110" />
            <span className="sr-only">Admin Panel</span>
          </Link>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/admin/dashboard"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                >
                  <LayoutDashboard className="h-5 w-5" />
                  <span className="sr-only">Dashboard</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Dashboard</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/admin/catalog"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                >
                  <Boxes className="h-5 w-5" />
                  <span className="sr-only">Catalog</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Catalog Management</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/admin/users"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                >
                  <Users className="h-5 w-5" />
                  <span className="sr-only">User Management</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">User Management</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/admin/roles"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                >
                  <Users className="h-5 w-5" /> {/* Using Users icon for roles for now */}
                  <span className="sr-only">Roles Management</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Roles Management</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/admin/content"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                >
                  <FileText className="h-5 w-5" />
                  <span className="sr-only">Content Management</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Content Management</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/admin/navigation"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                >
                  <NavigationIcon className="h-5 w-5" />
                  <span className="sr-only">Navigation</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Navigation</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/admin/settings"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                >
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Settings</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Settings</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>
      </aside>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
              <nav className="grid gap-6 text-lg font-medium">
                <Link
                  to="/admin/dashboard"
                  className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
                >
                  <PanelLeft className="h-5 w-5 transition-all group-hover:scale-110" />
                  <span className="sr-only">Admin Panel</span>
                </Link>
                <Link to="/admin/dashboard" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                  <LayoutDashboard className="h-5 w-5" />
                  Dashboard
                </Link>
                <Link to="/admin/catalog" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                  <Boxes className="h-5 w-5" />
                  Catalog Management
                </Link>
                <Link to="/admin/users" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                  <Users className="h-5 w-5" />
                  User Management
                </Link>
                <Link to="/admin/roles" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                  <Users className="h-5 w-5" /> {/* Using Users icon for roles for now */}
                  Roles Management
                </Link>
                <Link to="/admin/content" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                  <FileText className="h-5 w-5" />
                  Content Management
                </Link>
                <Link to="/admin/navigation" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                  <NavigationIcon className="h-5 w-5" />
                  Navigation
                </Link>
                <Link to="/admin/settings" className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                  <Settings className="h-5 w-5" />
                  Settings
                </Link>
                <Button variant="ghost" onClick={handleLogout} className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground">
                  <LogOut className="h-5 w-5" />
                  Logout
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
          <div className="relative ml-auto flex-1 md:grow-0">
            {/* Search or other header elements can go here */}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <img
                  src="https://via.placeholder.com/36" // Placeholder for admin avatar
                  width={36}
                  height={36}
                  alt="Avatar"
                  className="overflow-hidden rounded-full"
                />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/admin/settings')}>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Outlet /> {/* This is where nested admin routes will render */}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;