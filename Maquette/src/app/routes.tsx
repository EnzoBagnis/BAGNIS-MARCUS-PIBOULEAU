import { createBrowserRouter } from "react-router";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import UserPage from "./pages/UserPage";
import AdminPage from "./pages/AdminPage";
import KiosqueInfoPage from "./pages/KiosqueInfoPage";
import KiosqueAgendaPage from "./pages/KiosqueAgendaPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: HomePage,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/user",
    Component: UserPage,
  },
  {
    path: "/admin",
    Component: AdminPage,
  },
  {
    path: "/ecran/info",
    Component: KiosqueInfoPage,
  },
  {
    path: "/ecran/agenda",
    Component: KiosqueAgendaPage,
  },
]);
