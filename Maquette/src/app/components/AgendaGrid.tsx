import { useMemo, useState } from 'react';
import { useDrop } from 'react-dnd';
import { useApp } from '../context/AppContext';
import {
  X,
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import ReservationModal from './ReservationModal';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
const TIME_SLOTS = ['08:00-12:00', '14:00-18:00'];

function getMonday(d: Date) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  return date;
}

function addDays(d: Date, days: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + days);
  return r;
}

function formatDateStr(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatDayShort(d: Date) {
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function formatWeekRange(monday: Date) {
  const sunday = addDays(monday, 6);
  return `${formatDayShort(monday)} → ${formatDayShort(sunday)} ${sunday.getFullYear()}`;
}

interface TimeSlotCellProps {
  day: string;
  dateStr: string;
  timeSlot: string;
}

function TimeSlotCell({ day, dateStr, timeSlot }: TimeSlotCellProps) {
  const { reservations, removeReservation, professors, classes, machines } =
    useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingMachine, setPendingMachine] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const slotReservations = reservations.filter(
    (r) => r.dateStr === dateStr && r.timeSlot === timeSlot
  );

  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: 'machine',
      canDrop: (item: { machineId: string }) =>
        !slotReservations.some((r) => r.machineId === item.machineId),
      drop: (item: { machineId: string; machineName: string }) => {
        if (!slotReservations.some((r) => r.machineId === item.machineId)) {
          setPendingMachine({ id: item.machineId, name: item.machineName });
          setModalOpen(true);
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [slotReservations.map((r) => r.machineId).join('|')]
  );

  let bgClass = 'bg-white';
  if (slotReservations.length > 0) bgClass = 'bg-green-50';
  if (isOver && canDrop) bgClass = 'bg-blue-50 border-blue-400';
  if (isOver && !canDrop) bgClass = 'bg-red-50 border-red-400';

  return (
    <>
      <div
        ref={drop}
        className={`border border-gray-200 p-2 min-h-[120px] transition ${bgClass}`}
      >
        {slotReservations.length > 0 ? (
          <div className="space-y-2">
            {slotReservations.map((reservation) => {
              const professor = professors.find(
                (p) => p.id === reservation.professorId
              );
              const classInfo = classes.find(
                (c) => c.id === reservation.classId
              );
              const machine = machines.find(
                (m) => m.id === reservation.machineId
              );
              return (
                <div
                  key={reservation.id}
                  className="relative bg-white rounded border border-green-300 p-2 pr-6"
                >
                  <button
                    onClick={() => removeReservation(reservation.id)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                    title="Supprimer la réservation"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <p className="font-semibold text-xs text-blue-900 leading-tight">
                    {machine?.name}
                  </p>
                  <p className="text-[11px] text-gray-700">
                    {professor?.name}
                  </p>
                  <p className="text-[11px] text-gray-600">
                    {classInfo?.name}
                  </p>
                </div>
              );
            })}
            <p className="text-[10px] text-gray-400 text-center italic">
              Déposer pour ajouter
            </p>
          </div>
        ) : (
          <div className="text-gray-400 text-xs text-center pt-10">
            Déposer ici
          </div>
        )}
      </div>

      {modalOpen && pendingMachine && (
        <ReservationModal
          machineId={pendingMachine.id}
          machineName={pendingMachine.name}
          day={day}
          dateStr={dateStr}
          timeSlot={timeSlot}
          onClose={() => {
            setModalOpen(false);
            setPendingMachine(null);
          }}
        />
      )}
    </>
  );
}

interface MonthDayCellProps {
  dateStr: string;
  dayNumber: number;
  isWeekend?: boolean;
  isToday?: boolean;
}

function MonthDayCell({
  dateStr,
  dayNumber,
  isWeekend,
  isToday,
}: MonthDayCellProps) {
  const { reservations, machines } = useApp();

  const dayReservations = reservations.filter((r) => r.dateStr === dateStr);
  const reservationCount = dayReservations.length;

  return (
    <div
      className={`border border-gray-200 p-2 min-h-[120px] ${
        isWeekend ? 'bg-gray-100' : 'bg-white'
      } ${isToday ? 'ring-2 ring-blue-400' : ''}`}
    >
      <div
        className={`font-semibold text-sm mb-2 ${
          isToday ? 'text-blue-700' : 'text-gray-600'
        }`}
      >
        {dayNumber}
      </div>
      <div className="space-y-1">
        {dayReservations.slice(0, 3).map((reservation) => {
          const machine = machines.find((m) => m.id === reservation.machineId);
          return (
            <div
              key={reservation.id}
              className="bg-green-100 border border-green-300 rounded px-2 py-1"
            >
              <p className="text-xs font-semibold text-green-900 truncate">
                {machine?.name}
              </p>
              <p className="text-xs text-green-700">{reservation.timeSlot}</p>
            </div>
          );
        })}
        {reservationCount > 3 && (
          <p className="text-xs text-gray-500 text-center">
            +{reservationCount - 3} autre(s)
          </p>
        )}
      </div>
    </div>
  );
}

export default function AgendaGrid() {
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [weekStart, setWeekStart] = useState<Date>(() => getMonday(new Date()));
  const [monthCursor, setMonthCursor] = useState<Date>(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const weekDates = useMemo(
    () => DAYS.map((_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const todayStr = formatDateStr(new Date());

  const renderMonthView = () => {
    const year = monthCursor.getFullYear();
    const month = monthCursor.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const monthNames = [
      'Janvier',
      'Février',
      'Mars',
      'Avril',
      'Mai',
      'Juin',
      'Juillet',
      'Août',
      'Septembre',
      'Octobre',
      'Novembre',
      'Décembre',
    ];

    const weeks: JSX.Element[] = [];
    let currentWeek: JSX.Element[] = [];

    const adjustedStartDay = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    for (let i = 0; i < adjustedStartDay; i++) {
      currentWeek.push(
        <div
          key={`empty-${i}`}
          className="border border-gray-200 bg-gray-50 min-h-[120px]"
        ></div>
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const dateStr = formatDateStr(date);

      currentWeek.push(
        <MonthDayCell
          key={day}
          dateStr={dateStr}
          dayNumber={day}
          isWeekend={isWeekend}
          isToday={dateStr === todayStr}
        />
      );

      if ((adjustedStartDay + day) % 7 === 0 || day === daysInMonth) {
        weeks.push(
          <div key={`week-${weeks.length}`} className="grid grid-cols-7">
            {currentWeek}
          </div>
        );
        currentWeek = [];
      }
    }

    const goPrevMonth = () => {
      setMonthCursor(new Date(year, month - 1, 1));
    };
    const goNextMonth = () => {
      setMonthCursor(new Date(year, month + 1, 1));
    };
    const goCurrentMonth = () => {
      const d = new Date();
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      setMonthCursor(d);
    };

    return (
      <div>
        <div className="mb-4 flex items-center justify-center gap-3">
          <button
            onClick={goPrevMonth}
            className="p-2 rounded hover:bg-gray-100"
            title="Mois précédent"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-bold w-56 text-center">
            {monthNames[month]} {year}
          </h3>
          <button
            onClick={goNextMonth}
            className="p-2 rounded hover:bg-gray-100"
            title="Mois suivant"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={goCurrentMonth}
            className="ml-2 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
          >
            Aujourd'hui
          </button>
        </div>
        <div className="grid grid-cols-7 bg-gray-100 border border-gray-300">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d) => (
            <div
              key={d}
              className="border border-gray-300 p-2 text-center font-semibold text-sm"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="border border-gray-300 border-t-0">{weeks}</div>
      </div>
    );
  };

  const goPrevWeek = () => setWeekStart((d) => addDays(d, -7));
  const goNextWeek = () => setWeekStart((d) => addDays(d, 7));
  const goCurrentWeek = () => setWeekStart(getMonday(new Date()));

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-bold">
          {viewMode === 'week' ? 'Planning Hebdomadaire' : 'Planning Mensuel'}
        </h2>
        <button
          onClick={() => setViewMode(viewMode === 'week' ? 'month' : 'week')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {viewMode === 'week' ? (
            <>
              <CalendarDays className="w-5 h-5" />
              Vue Mensuelle
            </>
          ) : (
            <>
              <Calendar className="w-5 h-5" />
              Vue Hebdomadaire
            </>
          )}
        </button>
      </div>

      {viewMode === 'week' ? (
        <>
          <div className="flex items-center justify-center gap-3 mb-4">
            <button
              onClick={goPrevWeek}
              className="p-2 rounded hover:bg-gray-100"
              title="Semaine précédente"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-medium text-gray-700 w-64 text-center">
              {formatWeekRange(weekStart)}
            </span>
            <button
              onClick={goNextWeek}
              className="p-2 rounded hover:bg-gray-100"
              title="Semaine suivante"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={goCurrentWeek}
              className="ml-2 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
            >
              Cette semaine
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-gray-300 bg-gray-100 p-3 text-left font-semibold">
                    Horaires
                  </th>
                  {DAYS.map((day, i) => {
                    const date = weekDates[i];
                    const isToday = formatDateStr(date) === todayStr;
                    return (
                      <th
                        key={day}
                        className={`border border-gray-300 bg-gray-100 p-3 text-left font-semibold ${
                          isToday ? 'bg-blue-100' : ''
                        }`}
                      >
                        <div>{day}</div>
                        <div className="text-xs font-normal text-gray-600">
                          {formatDayShort(date)}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((timeSlot) => (
                  <tr key={timeSlot}>
                    <td className="border border-gray-300 bg-gray-50 p-3 font-medium text-sm">
                      {timeSlot}
                    </td>
                    {DAYS.map((day, i) => {
                      const dateStr = formatDateStr(weekDates[i]);
                      return (
                        <td
                          key={`${day}-${timeSlot}`}
                          className="border border-gray-300 p-0 align-top"
                        >
                          <TimeSlotCell
                            day={day}
                            dateStr={dateStr}
                            timeSlot={timeSlot}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        renderMonthView()
      )}
    </div>
  );
}
