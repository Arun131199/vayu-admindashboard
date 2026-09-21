import { Outlet } from 'react-router-dom';
import './App.css';
import Navbar from './component/navigation/Navbar';
import SideBar from './component/navigation/Sidebar';
import { routesConfig } from './routes/routesConfig';
import { useAuth } from './context/AuthContext';
import { filterMenuByPermissions } from './utils/permissions';

function App() {
  const { permissions, user } = useAuth();

  const navbarData = {
    name: user?.username ?? 'Admin',
    email: user?.email ?? '',
    role: 'Admin',
    profileImage: '',
  };

  const filteredMenu = filterMenuByPermissions(routesConfig, permissions);

  return (
    <div className="flex h-screen overflow-hidden dark:bg-gray-950">

      {/* Sidebar */}
      <SideBar menu={filteredMenu} />

      {/* Right Content */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* Navbar */}
        <Navbar data={navbarData} />

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 bg-gray-100 dark:bg-gray-950">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default App;