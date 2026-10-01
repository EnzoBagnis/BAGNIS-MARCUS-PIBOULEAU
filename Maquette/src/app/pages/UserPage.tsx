import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { LogOut, Plane } from 'lucide-react';
import AgendaGrid from '../components/AgendaGrid';
import MachineList from '../components/MachineList';

export default function UserPage() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useApp();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Plane className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Réservation des Machines</h1>
              <p className="text-sm text-gray-600">BTS Aéronautique</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <MachineList />
          </div>
          <div className="lg:col-span-3">
            <AgendaGrid />
          </div>
        </div>
      </main>
    </div>
  );
}
