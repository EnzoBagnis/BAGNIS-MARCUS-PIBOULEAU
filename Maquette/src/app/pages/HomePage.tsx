import { useNavigate } from 'react-router';
import { Plane, Users } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Plane className="w-16 h-16 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">BTS Aéronautique</h1>
          <p className="text-xl text-gray-600">Système de Gestion des Machines</p>
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => navigate('/login')}
            className="bg-white rounded-xl shadow-lg p-12 hover:shadow-xl transition-all transform hover:scale-105 max-w-md w-full"
          >
            <div className="flex flex-col items-center">
              <Users className="w-20 h-20 text-blue-600 mb-6" />
              <h2 className="text-3xl font-semibold mb-3">Connexion</h2>
              <p className="text-gray-600 text-center text-lg">
                Accès utilisateurs et administration
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
