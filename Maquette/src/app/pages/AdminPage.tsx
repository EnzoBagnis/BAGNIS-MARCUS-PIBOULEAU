import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { ArrowLeft, UserPlus, Plus, Trash2, Plane, Image, Video, FileText, LogOut } from 'lucide-react';

export default function AdminPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, logout, professors, addProfessor, machines, addMachine, mediaItems, addMediaItem, removeMediaItem } = useApp();

  const [newProfName, setNewProfName] = useState('');
  const [newMachineName, setNewMachineName] = useState('');
  const [newMachineType, setNewMachineType] = useState<'avion' | 'helicoptere'>('avion');
  const [newMediaType, setNewMediaType] = useState<'image' | 'video' | 'text'>('text');
  const [newMediaContent, setNewMediaContent] = useState('');
  const [newMediaUrl, setNewMediaUrl] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/login');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleAddProfessor = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProfName.trim()) {
      addProfessor(newProfName);
      setNewProfName('');
    }
  };

  const handleAddMachine = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMachineName.trim()) {
      addMachine({ name: newMachineName, type: newMachineType });
      setNewMachineName('');
    }
  };

  const handleAddMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMediaType === 'text' && newMediaContent.trim()) {
      addMediaItem({ type: 'text', content: newMediaContent, duration: 5000 });
      setNewMediaContent('');
    } else if ((newMediaType === 'image' || newMediaType === 'video') && newMediaUrl.trim()) {
      addMediaItem({ type: newMediaType, url: newMediaUrl, duration: 10000 });
      setNewMediaUrl('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-gray-600 hover:text-gray-800 mb-2"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Panneau d'Administration</h1>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <UserPlus className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-bold">Professeurs</h2>
            </div>

            <form onSubmit={handleAddProfessor} className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newProfName}
                  onChange={(e) => setNewProfName(e.target.value)}
                  placeholder="Nom du professeur"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </form>

            <div className="space-y-2">
              {professors.map((prof) => (
                <div key={prof.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span>{prof.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Plane className="w-6 h-6 text-green-600 mr-2" />
              <h2 className="text-xl font-bold">Machines</h2>
            </div>

            <form onSubmit={handleAddMachine} className="mb-4">
              <div className="space-y-2">
                <input
                  type="text"
                  value={newMachineName}
                  onChange={(e) => setNewMachineName(e.target.value)}
                  placeholder="Nom de la machine"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <select
                  value={newMachineType}
                  onChange={(e) => setNewMachineType(e.target.value as 'avion' | 'helicoptere')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="avion">Avion</option>
                  <option value="helicoptere">Hélicoptère</option>
                </select>
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Ajouter
                </button>
              </div>
            </form>

            <div className="space-y-2">
              {machines.map((machine) => (
                <div key={machine.id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-semibold">{machine.name}</p>
                  <p className="text-sm text-gray-600 capitalize">{machine.type}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <FileText className="w-6 h-6 text-purple-600 mr-2" />
              <h2 className="text-xl font-bold">Contenu Kiosque</h2>
            </div>

            <form onSubmit={handleAddMedia} className="mb-4">
              <div className="space-y-2">
                <select
                  value={newMediaType}
                  onChange={(e) => setNewMediaType(e.target.value as 'image' | 'video' | 'text')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="text">Texte</option>
                  <option value="image">Image (URL)</option>
                  <option value="video">Vidéo (URL)</option>
                </select>

                {newMediaType === 'text' ? (
                  <textarea
                    value={newMediaContent}
                    onChange={(e) => setNewMediaContent(e.target.value)}
                    placeholder="Contenu du texte"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={3}
                  />
                ) : (
                  <input
                    type="url"
                    value={newMediaUrl}
                    onChange={(e) => setNewMediaUrl(e.target.value)}
                    placeholder={`URL ${newMediaType === 'image' ? 'de l\'image' : 'de la vidéo'}`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                )}

                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Ajouter
                </button>
              </div>
            </form>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {mediaItems.map((item) => (
                <div key={item.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start">
                    {item.type === 'text' && <FileText className="w-5 h-5 text-gray-600 mr-2 mt-1" />}
                    {item.type === 'image' && <Image className="w-5 h-5 text-blue-600 mr-2 mt-1" />}
                    {item.type === 'video' && <Video className="w-5 h-5 text-red-600 mr-2 mt-1" />}
                    <div className="flex-1">
                      <p className="text-sm font-medium capitalize">{item.type}</p>
                      <p className="text-xs text-gray-600 break-all">
                        {item.content || item.url}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeMediaItem(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
