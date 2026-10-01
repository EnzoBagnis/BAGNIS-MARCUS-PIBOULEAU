import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Plane,
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

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

export default function KiosqueAgendaPage() {
  const { reservations, professors, classes, machines } = useApp();
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

  const getSlotReservations = (dateStr: string, timeSlot: string) =>
    reservations.filter(
      (r) => r.dateStr === dateStr && r.timeSlot === timeSlot
    );

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
          className="border border-blue-800 bg-blue-900 bg-opacity-30 min-h-[140px]"
        ></div>
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const dateStr = formatDateStr(date);

      const dayReservations = reservations.filter((r) => r.dateStr === dateStr);

      currentWeek.push(
        <div
          key={day}
          className={`border border-blue-800 p-3 min-h-[140px] ${
            isWeekend
              ? 'bg-blue-900 bg-opacity-40'
              : 'bg-blue-900 bg-opacity-20'
          }`}
        >
          <div className="font-bold text-white text-xl mb-2">{day}</div>
          <div className="space-y-1">
            {dayReservations.slice(0, 2).map((reservation) => {
              const machine = machines.find(
                (m) => m.id === reservation.machineId
              );
              return (
                <div
                  key={reservation.id}
                  className="bg-green-400 rounded px-2 py-1"
                >
                  <p className="text-sm font-bold text-green-900 truncate">
                    {machine?.name}
                  </p>
                  <p className="text-xs text-green-800">
                    {reservation.timeSlot}
                  </p>
                </div>
              );
            })}
            {dayReservations.length > 2 && (
              <p className="text-xs text-blue-200 text-center">
                +{dayReservations.length - 2}
              </p>
            )}
          </div>
        </div>
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

    const goPrevMonth = () => setMonthCursor(new Date(year, month - 1, 1));
    const goNextMonth = () => setMonthCursor(new Date(year, month + 1, 1));
    const goCurrentMonth = () => {
      const d = new Date();
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      setMonthCursor(d);
    };

    return (
      <div>
        <div className="mb-6 flex items-center justify-center gap-4">
          <button
            onClick={goPrevMonth}
            className="p-2 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 text-white"
            title="Mois précédent"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h3 className="text-3xl font-bold text-white w-72 text-center">
            {monthNames[month]} {year}
          </h3>
          <button
            onClick={goNextMonth}
            className="p-2 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 text-white"
            title="Mois suivant"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <button
            onClick={goCurrentMonth}
            className="ml-2 px-4 py-2 text-sm bg-white text-blue-900 rounded-lg hover:bg-blue-50 font-semibold"
          >
            Aujourd'hui
          </button>
        </div>
        <div className="grid grid-cols-7 bg-blue-900 border border-blue-800">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
            <div
              key={day}
              className="border border-blue-800 p-3 text-center font-bold text-xl text-white"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="border border-blue-800 border-t-0">{weeks}</div>
      </div>
    );
  };

  const goPrevWeek = () => setWeekStart((d) => addDays(d, -7));
  const goNextWeek = () => setWeekStart((d) => addDays(d, 7));
  const goCurrentWeek = () => setWeekStart(getMonday(new Date()));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 p-8">
      <header className="bg-black bg-opacity-30 rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1 justify-center">
            <Calendar className="w-12 h-12 text-white mr-4" />
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white">
                {viewMode === 'week'
                  ? 'Planning Hebdomadaire'
                  : 'Planning Mensuel'}
              </h1>
              <p className="text-xl text-blue-200 mt-2">
                BTS Aéronautique - Réservations Machines
              </p>
            </div>
          </div>
          <button
            onClick={() => setViewMode(viewMode === 'week' ? 'month' : 'week')}
            className="flex items-center gap-2 px-6 py-3 bg-white text-blue-900 rounded-lg hover:bg-blue-50 transition font-semibold"
          >
            {viewMode === 'week' ? (
              <>
                <CalendarDays className="w-6 h-6" />
                Vue Mensuelle
              </>
            ) : (
              <>
                <Calendar className="w-6 h-6" />
                Vue Hebdomadaire
              </>
            )}
          </button>
        </div>
      </header>

      <main
        className={`${viewMode === 'week' ? 'bg-white' : 'bg-transparent'} rounded-2xl shadow-2xl overflow-hidden ${viewMode === 'month' ? 'p-4' : ''}`}
      >
        {viewMode === 'week' ? (
          <>
            <div className="flex items-center justify-center gap-4 py-4 bg-blue-50 border-b">
              <button
                onClick={goPrevWeek}
                className="p-2 rounded-lg hover:bg-blue-100"
                title="Semaine précédente"
              >
                <ChevronLeft className="w-6 h-6 text-blue-900" />
              </button>
              <span className="font-bold text-xl text-blue-900 w-80 text-center">
                {formatWeekRange(weekStart)}
              </span>
              <button
                onClick={goNextWeek}
                className="p-2 rounded-lg hover:bg-blue-100"
                title="Semaine suivante"
              >
                <ChevronRight className="w-6 h-6 text-blue-900" />
              </button>
              <button
                onClick={goCurrentWeek}
                className="ml-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                Cette semaine
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-blue-900">
                    <th className="p-4 text-white font-bold text-xl border-r border-blue-800">
                      Horaires
                    </th>
                    {DAYS.map((day, i) => {
                      const date = weekDates[i];
                      const isToday = formatDateStr(date) === todayStr;
                      return (
                        <th
                          key={day}
                          className={`p-4 text-white font-bold text-xl border-r border-blue-800 last:border-r-0 ${
                            isToday ? 'bg-blue-700' : ''
                          }`}
                        >
                          <div>{day}</div>
                          <div className="text-sm font-normal text-blue-200">
                            {formatDayShort(date)}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {TIME_SLOTS.map((timeSlot, slotIndex) => (
                    <tr
                      key={timeSlot}
                      className={
                        slotIndex % 2 === 0 ? 'bg-blue-50' : 'bg-white'
                      }
                    >
                      <td className="p-4 font-bold text-lg text-blue-900 border-r border-gray-200">
                        {timeSlot}
                      </td>
                      {DAYS.map((day, i) => {
                        const dateStr = formatDateStr(weekDates[i]);
                        const slotReservations = getSlotReservations(
                          dateStr,
                          timeSlot
                        );

                        return (
                          <td
                            key={`${day}-${timeSlot}`}
                            className="p-3 border-r border-gray-200 last:border-r-0 align-top"
                          >
                            {slotReservations.length > 0 ? (
                              <div className="space-y-2">
                                {slotReservations.map((reservation) => {
                                  const machine = machines.find(
                                    (m) => m.id === reservation.machineId
                                  );
                                  const professor = professors.find(
                                    (p) => p.id === reservation.professorId
                                  );
                                  const classInfo = classes.find(
                                    (c) => c.id === reservation.classId
                                  );
                                  return (
                                    <div
                                      key={reservation.id}
                                      className="bg-gradient-to-br from-green-400 to-green-500 rounded-lg p-3 shadow-lg"
                                    >
                                      <div className="flex items-start mb-1">
                                        <Plane className="w-5 h-5 text-white mr-2 flex-shrink-0 mt-1" />
                                        <p className="font-bold text-white text-base leading-tight">
                                          {machine?.name}
                                        </p>
                                      </div>
                                      <p className="text-white text-xs font-semibold">
                                        {professor?.name}
                                      </p>
                                      <p className="text-green-100 text-xs">
                                        {classInfo?.name}
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="h-24 flex items-center justify-center">
                                <p className="text-gray-400 text-sm">
                                  Disponible
                                </p>
                              </div>
                            )}
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
      </main>

      <footer className="mt-8 text-center">
        <p className="text-white text-sm opacity-75">
          Mise à jour en temps réel -{' '}
          {new Date().toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </footer>
    </div>
  );
}
