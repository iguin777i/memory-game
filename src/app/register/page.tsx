// src/app/register/page.tsx
"use client";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { toast } from "react-hot-toast";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, role, company }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao processar o registro");
      }

      // Registro bem sucedido
      localStorage.setItem('userId', data.userId.toString());
      router.push("/game");
    } catch (error) {
      console.error("Erro ao registrar:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao registrar usuário");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-2">
                <a href="#" className="flex flex-col items-center gap-2 font-medium">
                  <div className="flex size-8 items-center justify-center rounded-md">
                    <svg xmlns="http://www.w3.org/2000/svg" width="46" height="28" viewBox="0 0 46 28" fill="none">
                      <g clipPath="url(#clip0_914_710)">
                        <path d="M21.0159 27.9815V21.9229H9.98461L16.1403 15.8198C16.6787 15.4043 17.025 14.7624 17.025 14.0353C17.025 13.3081 16.69 12.6848 16.1629 12.2692L9.90932 6.0326H21.0121V0.0111335H3.53151C3.50139 0.0111335 3.47504 0.0074234 3.44868 0.0074234C1.54362 0.0074234 0 1.53598 0 3.41699C0 4.40016 0.421673 5.27945 1.09183 5.90275L1.0843 5.9213L9.10738 14.0167L1.0843 22.1752C0.459322 22.7948 0.0715338 23.6481 0.0715338 24.5904C0.0715338 26.4752 1.61516 28 3.51645 28C3.63316 28 3.74611 27.9926 3.85906 27.9815H21.0159Z" fill="#008C77" />
                        <path d="M24.0918 6.38876L37.0921 13.7941L24.1407 21.5556L24.1633 27.9703L44.0799 16.9291V16.9217C45.2282 16.3095 46.0037 15.126 46 13.7718C45.9962 12.3805 45.1717 11.1822 43.9707 10.5886L24.0692 0L24.0918 6.38876Z" fill="#214B63" />
                      </g>
                      <defs>
                        <clipPath id="clip0_914_710">
                          <rect width="46" height="28" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </div>
                  <span className="sr-only">Acme Inc.</span>
                </a>
                <h1 className="text-xl font-bold text-center">
                  Olá, Seja bem vindo ao nosso jogo da memória👋
                </h1>
                <p className="text-center text-sm text-muted-foreground">
                  Coloque seus dados para continuar
                </p>
              </div>
              <div className="flex flex-col gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="ex: Felipe Coleti"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="role">Cargo</Label>
                  <Input
                    id="role"
                    type="text"
                    placeholder="ex: Analista de Sistemas"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="company">Empresa</Label>
                  <Input
                    id="company"
                    type="text"
                    placeholder="ex: Empresa XYZ"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Registrando..." : "Continuar"}
                </Button>
              </div>
            </div>
          </form>
          <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
            Ao clicar em continuar, você concorda com nossos <a href="#">Termos de Serviço</a>{" "}
            e <a href="#">Política de Privacidade</a>.
          </div>
        </div>
      </div>
    </div>
  );
}