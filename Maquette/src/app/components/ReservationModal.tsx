import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X } from 'lucide-react';

interface ReservationModalProps {
  machineId: string;
  machineName: string;
  day: string;
  dateStr: string;
  timeSlot: string;
  onClose: () => void;
}

export default function ReservationModal({
  machineId,
  machineName,
  day,
  dateStr,
  timeSlot,
  onClose,
}: ReservationModalProps) {
  const { professors, classes, addReservation } = useApp();
  const [selectedProfessor, setSelectedProfessor] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProfessor && selectedClass) {
      addReservation({
        machineId,
        professorId: selectedProfessor,
        classId: selectedClass,
        day,
        dateStr,
        timeSlot,
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Réserver {machineName}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>{day}</strong>
            {dateStr ? ` ${dateStr.split('-').reverse().join('/')}` : ''} · {timeSlot}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Professeur
            </label>
            <select
              value={selectedProfessor}
              onChange={(e) => setSelectedProfessor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Sélectionner un professeur</option>
              {professors.map((prof) => (
                <option key={prof.id} value={prof.id}>
                  {prof.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Classe
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Sélectionner une classe</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Réserver
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
