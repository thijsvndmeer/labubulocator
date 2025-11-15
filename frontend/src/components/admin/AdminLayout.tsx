import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Home, Settings, Package, User, Layout, Search, Briefcase } from 'lucide-react'; // Example icons

interface AdminSidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const AdminSidebarLink: React.FC<AdminSidebarLinkProps> = ({ to, icon, label }) => {
  return (
    <Link
      to={to}
      className="flex items-center p-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 group"
    >
      {icon}
      <span className="flex-1 ml-3 whitespace-nowrap">{label}</span>
    </Link>
  );
};

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true); // Control sidebar visibility

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700 transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:inset-0`}
        aria-label="Sidebar"
      >
        <div className="h-full px-3 py-4 overflow-y-auto bg-white dark:bg-gray-800">
          <Link to="/admin" className="flex items-center pl-2.5 mb-5">
            <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Admin Dashboard</span>
          </Link>
          <ul className="space-y-2 font-medium">
            <AdminSidebarLink to="/admin" icon={<Home className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />} label="Dashboard" />
            <AdminSidebarLink to="/admin/character" icon={<User className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />} label="Characters" />
            <AdminSidebarLink to="/admin/set" icon={<Layout className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />} label="Sets" />
            <AdminSidebarLink to="/admin/variant" icon={<Package className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />} label="Variants" />
            <AdminSidebarLink to="/admin/collection-category" icon={<Briefcase className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />} label="Collections/Categories" />
            <AdminSidebarLink to="/admin/site-config" icon={<Settings className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />} label="Site Config" />
            <AdminSidebarLink to="/admin/search-settings" icon={<Search className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />} label="Search Settings" />
          </ul>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-64"> {/* Adjust margin for sidebar */}
        {/* Navbar for mobile sidebar toggle */}
        <nav className="lg:hidden bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-500 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700"
          >
            <span className="sr-only">Open sidebar</span>
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path clipRule="evenodd" fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
            </svg>
          </button>
        </nav>
        <main className="p-4 flex-1">
          <Outlet /> {/* Renders the child route components */}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
