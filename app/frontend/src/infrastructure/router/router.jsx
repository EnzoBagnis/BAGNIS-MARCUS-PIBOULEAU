import { createBrowserRouter, Navigate } from 'react-router';
import EcranLayout from '@/app/layouts/EcranLayout.jsx';
import EcranSelectPage from '@/app/pages/EcranSelectPage.jsx';
import EcranRotationPage from '@/app/pages/EcranRotationPage.jsx';
import LoginPage from '@/features/auth/pages/LoginPage.jsx';
import ProfHomePlaceholderPage from '@/features/auth/pages/ProfHomePlaceholderPage.jsx';
import AdminHomePlaceholderPage from '@/features/auth/pages/AdminHomePlaceholderPage.jsx';
import RequireAuth from '@/features/auth/components/RequireAuth.jsx';
import InformationPage from '@/features/information/pages/InformationPage.jsx';
import AgendaPage from '@/features/agenda/pages/AgendaPage.jsx';
import AdminPanel from '@/features/admin/pages/AdminPanel.jsx';
import NotFoundPage from '@/app/pages/NotFoundPage.jsx';
import MachineCalendar from '@/features/agenda/pages/MachineCalendar.jsx';

export const ROUTES = {
  root: '/',
  login: '/login',
  ecran: '/ecran',
  ecranInfo: '/ecran/info',
  ecranAgenda: '/ecran/agenda',
  ecranRotation: '/ecran/rotation',
  profHome: '/prof',
  adminHome: '/admin',
  calendar: '/calendar',
  agenda: '/agenda',
};

export const router = createBrowserRouter([
  {
    path: ROUTES.root,
    element: <Navigate to={ROUTES.login} replace />,
  },
  {
    path: ROUTES.login,
    element: <LoginPage />,
  },
  {
    path: ROUTES.calendar,
    element: <MachineCalendar />,
  },
  {
    path: ROUTES.agenda,
    element: <AgendaPage />,
  },
  {
    path: ROUTES.ecran,
    element: <EcranLayout />,
    children: [
      { index: true, element: <EcranSelectPage /> },
      { path: 'info', element: <InformationPage /> },
      { path: 'agenda', element: <AgendaPage /> },
      { path: 'rotation', element: <EcranRotationPage /> },
    ],
  },
  {
    path: ROUTES.profHome,
    element: (
      <RequireAuth role="prof">
        <AgendaPage />
      </RequireAuth>
    ),
  },
  {
    path: ROUTES.adminHome,
    element: (
      <RequireAuth role="admin">
        <AdminPanel />
      </RequireAuth>
    ),
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
