import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const RequireAdmin = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-xs uppercase tracking-[0.3em] text-petrol/50">carregando...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-8 text-center">
        <h1 className="font-serif text-3xl text-petrol">Acesso negado</h1>
        <p className="max-w-md text-sm text-petrol/60">
          Esta conta não tem permissão de administradora. Solicite acesso à equipe.
        </p>
        <a href="/" className="text-xs uppercase tracking-[0.25em] text-burgundy hover:underline">
          ← voltar à página inicial
        </a>
      </div>
    );
  }

  return <>{children}</>;
};
