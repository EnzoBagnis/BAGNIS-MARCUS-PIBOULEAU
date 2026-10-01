import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Lock } from 'lucide-react';

export default function LoginPage() {
  const [credentials, setCredentials] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, loginAdmin } = useApp();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (loginAdmin(credentials)) {
      navigate('/admin');
    } else if (login(credentials)) {
      navigate('/user');
    } else {
      setError('Identifiants invalides');
      setCredentials('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <button
          onClick={() => navigate('/')}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Retour
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-center mb-6">
            <Lock className="w-12 h-12 text-blue-600" />
          </div>

          <h1 className="text-2xl font-bold text-center mb-2">Connexion</h1>
          <p className="text-gray-600 text-center mb-6">
            Entrez vos identifiants
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Clé d'accès ou mot de passe
              </label>
              <input
                type="password"
                value={credentials}
                onChange={(e) => {
                  setCredentials(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Entrez vos identifiants"
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Se connecter
            </button>
          </form>

          <div className="mt-6 space-y-2">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 text-center">
                <strong>Utilisateur :</strong> btsaero2026
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 text-center">
                <strong>Admin :</strong> admin123
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
