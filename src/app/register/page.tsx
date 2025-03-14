// src/app/register/page.tsx
"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "react-hot-toast";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Register({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [loginPassword, setLoginPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const formatPhone = (value: string) => {
    // Remove tudo que não for número
    const numbers = value.replace(/\D/g, '')
    
    // Aplica a máscara
    let formatted = numbers
    if (numbers.length <= 11) {
      // Formata para (DD) 99999-9999
      formatted = numbers.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3')
      
      // Se ainda não tiver todos os números, ajusta a formatação parcial
      if (numbers.length < 11) {
        if (numbers.length > 7) {
          // (DD) 99999-9
          formatted = numbers.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3')
        } else if (numbers.length > 2) {
          // (DD) 99999
          formatted = numbers.replace(/^(\d{2})(\d{0,5}).*/, '($1) $2')
        } else if (numbers.length > 0) {
          // (DD
          formatted = numbers.replace(/^(\d{0,2}).*/, '($1')
        }
      }
    }
    
    return formatted
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setPhone(formatted)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, phone }),
      });

      const data = await response.json();

      if (response.status === 409) {
        // Usuário já existe
        setShowLoginDialog(true);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Algo deu errado");
      }

      // Registro bem sucedido
      setPassword(data.password);
      localStorage.setItem('userId', data.userId.toString());
      setShowPassword(true);
    } catch (error) {
      console.error("Erro ao registrar:", error);
      toast.error("Erro ao registrar usuário");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password: loginPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Credenciais inválidas");
      }

      // Login bem sucedido
      localStorage.setItem('userId', data.userId.toString());
      setShowLoginDialog(false);
      router.push("/game");
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      toast.error(error instanceof Error ? error.message : "Senha incorreta");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateNewPassword = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email, 
          name, 
          phone,
          generateNewPassword: true 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao gerar nova senha");
      }

      // Atualiza a senha e mostra no modal
      setPassword(data.password);
      setShowLoginDialog(false);
      setShowPassword(true);
      localStorage.setItem('userId', data.userId.toString());
      
      toast.success("Nova senha gerada com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar nova senha:", error);
      toast.error("Erro ao gerar nova senha");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Bem-vindo de volta! 👋</DialogTitle>
            <DialogDescription>
              Este email já está registrado. Por favor, insira sua senha para continuar.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLogin}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="login-password">Senha</Label>
                <Input
                  id="login-password"
                  type="text"
                  placeholder="Digite sua senha (ex: A-12)"
                  required
                  value={loginPassword}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase();
                    
                    // Se estiver apagando, permite
                    if (value.length < loginPassword.length) {
                      setLoginPassword(value);
                      return;
                    }

                    // Validação para digitação
                    if (value.length === 1) {
                      // Primeira posição só aceita letra
                      if (/^[A-Z]$/.test(value)) {
                        setLoginPassword(value + '-');
                      }
                    } else if (value.length > 1) {
                      // Após o hífen, só aceita números
                      if (/^[A-Z]-\d{0,2}$/.test(value)) {
                        setLoginPassword(value);
                      }
                    }
                  }}
                  maxLength={4}
                  disabled={loading}
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Esqueceu sua senha? <Button type="button" variant="link" className="p-0 h-auto font-normal" onClick={handleGenerateNewPassword} disabled={loading}>
                    Gerar nova senha
                  </Button>
                </p>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowLoginDialog(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Drawer open={showPassword} onOpenChange={setShowPassword}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm">
            <DrawerHeader>
              <DrawerTitle>Sua senha foi gerada!</DrawerTitle>
              <DrawerDescription>
                Memorize esta senha! Você precisará dela para jogar.
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-4">
              <div className="bg-[#003087] text-white p-8 rounded-lg text-4xl font-bold flex items-center justify-center">
                {password}
              </div>
            </div>
            <DrawerFooter>
              <Button onClick={() => {
                setShowPassword(false);
                router.push("/game");
              }}>
                Começar o Jogo!
              </Button>
              <DrawerClose asChild>
                <Button variant="outline">
                  Fechar
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>

      <div className="w-full max-w-sm">
        <div className={cn("flex flex-col gap-6", className)} {...props}>
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
                <p className="text-sm text-center">
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
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(DD) 99999-9999"
                    required
                    value={phone}
                    onChange={handlePhoneChange}
                    maxLength={15}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  Continuar
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