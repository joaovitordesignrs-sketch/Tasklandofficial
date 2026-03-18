import { Navigate } from "react-router";

export default function RedirectToProfile() {
  return <Navigate to="/perfil" replace />;
}
