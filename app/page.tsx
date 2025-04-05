import { LoginForm } from "@/components/login-form"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-muted/40">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Willkommen</h1>
        <p className="text-muted-foreground">Melden Sie sich an, um auf Ihr Dashboard zuzugreifen.</p>
      </div>
      <LoginForm />
    </main>
  )
}

