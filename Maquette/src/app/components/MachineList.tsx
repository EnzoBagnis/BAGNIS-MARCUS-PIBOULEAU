import { useDrag } from 'react-dnd';
import { useApp } from '../context/AppContext';
import { Plane, RotateCw } from 'lucide-react';

interface DraggableMachineProps {
  machine: { id: string; name: string; type: 'avion' | 'helicoptere' };
}

function DraggableMachine({ machine }: DraggableMachineProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'machine',
    item: { machineId: machine.id, machineName: machine.name },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`bg-white border-2 border-blue-200 rounded-lg p-4 cursor-move hover:border-blue-400 transition ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      <div className="flex items-center">
        {machine.type === 'avion' ? (
          <Plane className="w-5 h-5 text-blue-600 mr-2" />
        ) : (
          <RotateCw className="w-5 h-5 text-green-600 mr-2" />
        )}
        <div>
          <p className="font-semibold text-sm">{machine.name}</p>
          <p className="text-xs text-gray-500 capitalize">{machine.type}</p>
        </div>
      </div>
    </div>
  );
}

export default function MachineList() {
  const { machines } = useApp();

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h2 className="text-lg font-bold mb-4">Machines Disponibles</h2>
      <p className="text-sm text-gray-600 mb-4">
        Glissez-déposez une machine sur un créneau libre
      </p>
      <div className="space-y-3">
        {machines.map((machine) => (
          <DraggableMachine key={machine.id} machine={machine} />
        ))}
      </div>
    </div>
  );
}
