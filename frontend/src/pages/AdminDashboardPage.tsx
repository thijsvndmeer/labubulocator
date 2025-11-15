import React from 'react';

const AdminDashboardPage: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Welcome to Admin Dashboard!</h1>
      <p className="text-gray-700 dark:text-gray-300">
        Use the sidebar navigation to manage characters, sets, variants, collections, site configuration, and search settings.
      </p>
      {/* Add more dashboard content here later, e.g., quick stats, recent activity */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Total Characters</h3>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">125</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Total Sets</h3>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">15</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Published Variants</h3>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">530</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
