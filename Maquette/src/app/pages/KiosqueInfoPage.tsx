import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Plane } from 'lucide-react';

export default function KiosqueInfoPage() {
  const { mediaItems } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (mediaItems.length === 0) return;

    const currentItem = mediaItems[currentIndex];
    const duration = currentItem.duration || 5000;

    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % mediaItems.length);
    }, duration);

    return () => clearTimeout(timer);
  }, [currentIndex, mediaItems]);

  if (mediaItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-8">
        <div className="text-center text-white">
          <Plane className="w-32 h-32 mx-auto mb-6 opacity-50" />
          <h1 className="text-5xl font-bold mb-4">BTS Aéronautique</h1>
          <p className="text-2xl">Aucun contenu disponible</p>
        </div>
      </div>
    );
  }

  const currentItem = mediaItems[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex flex-col">
      <header className="bg-black bg-opacity-30 p-6">
        <div className="flex items-center justify-center">
          <Plane className="w-12 h-12 text-white mr-4" />
          <h1 className="text-4xl font-bold text-white">BTS Aéronautique</h1>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-6xl w-full">
          {currentItem.type === 'text' && (
            <div className="bg-white bg-opacity-95 rounded-2xl p-16 shadow-2xl">
              <p className="text-5xl font-bold text-center text-gray-900">
                {currentItem.content}
              </p>
            </div>
          )}

          {currentItem.type === 'image' && currentItem.url && (
            <div className="bg-white rounded-2xl p-4 shadow-2xl">
              <img
                src={currentItem.url}
                alt="Information"
                className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          )}

          {currentItem.type === 'video' && currentItem.url && (
            <div className="bg-white rounded-2xl p-4 shadow-2xl">
              <video
                src={currentItem.url}
                className="w-full h-auto max-h-[70vh] rounded-lg"
                autoPlay
                muted
                loop
              />
            </div>
          )}
        </div>
      </main>

      <footer className="bg-black bg-opacity-30 p-4">
        <div className="flex justify-center gap-2">
          {mediaItems.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-16 rounded-full ${
                index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-30'
              }`}
            />
          ))}
        </div>
      </footer>
    </div>
  );
}
