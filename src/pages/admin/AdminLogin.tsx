import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo-sarah-franco.png";

const credSchema = z.object({
  email: z.string().trim().email("E-mail inválido").max(255),
  password: z.string().min(8, "Mínimo 8 caracteres").max(72),
});

const AdminLogin = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user && isAdmin) navigate("/admin/pedidos", { replace: true });
  }, [user, isAdmin, loading, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = credSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: { emailRedirectTo: `${window.location.origin}/admin/pedidos` },
        });
        if (error) throw error;
        toast.success("Conta criada! Você já pode entrar.");
        setMode("login");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });
        if (error) throw error;
        toast.success("Bem-vinda!");
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao autenticar.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-burgundy/15 bg-cream">
        <div className="container-narrow flex h-20 items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logo}
              alt="Sarah Franco"
              className="h-9 w-auto"
              style={{ filter: "brightness(0.4) sepia(1) hue-rotate(-20deg) saturate(6)" }}
            />
          </Link>
          <Link to="/" className="text-xs uppercase tracking-[0.25em] text-petrol/70 hover:text-burgundy">
            ← voltar
          </Link>
        </div>
      </header>

      <div className="container-narrow flex min-h-[calc(100vh-5rem)] items-center justify-center py-16">
        <div className="w-full max-w-md">
          <div className="text-center">
            <span className="eyebrow">Área restrita</span>
            <h1 className="mt-6 font-serif text-4xl text-petrol">
              {mode === "login" ? "Entrar" : "Criar conta"}
            </h1>
            <p className="mt-3 text-sm text-petrol/60">
              Acesso exclusivo para administração de pedidos
            </p>
          </div>

          <form onSubmit={submit} className="mt-12 space-y-6 border border-burgundy/15 bg-cream p-8 shadow-soft md:p-10">
            <label className="block">
              <span className="mb-2 block text-[0.7rem] uppercase tracking-[0.25em] text-petrol/70">E-mail</span>
              <input
                type="email"
                autoComplete="email"
                required
                className="w-full border border-burgundy/20 bg-background px-4 py-3 text-sm text-petrol placeholder:text-petrol/40 transition-colors focus:border-burgundy focus:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-[0.7rem] uppercase tracking-[0.25em] text-petrol/70">Senha</span>
              <input
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                required
                minLength={8}
                className="w-full border border-burgundy/20 bg-background px-4 py-3 text-sm text-petrol placeholder:text-petrol/40 transition-colors focus:border-burgundy focus:outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {mode === "signup" && (
                <span className="mt-2 block text-[0.65rem] text-petrol/50">Mínimo 8 caracteres</span>
              )}
            </label>

            <button
              type="submit"
              disabled={busy}
              className="group inline-flex w-full items-center justify-center gap-3 bg-burgundy px-8 py-3.5 text-xs uppercase tracking-[0.25em] text-cream transition-all duration-500 hover:bg-burgundy-deep disabled:opacity-50"
            >
              {busy ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
              <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
            </button>

            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="block w-full text-center text-xs uppercase tracking-[0.25em] text-petrol/60 hover:text-burgundy"
            >
              {mode === "login" ? "Criar conta admin" : "Já tenho conta"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
