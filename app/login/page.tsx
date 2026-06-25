import type { Metadata } from "next";
import AuthForm from "@/components/sections/AuthForm";

export const metadata: Metadata = {
  title: "Acurated Community | Don Perro Login & Register",
  description: "Join the Don Perro community of pet owners to unlock bespoke rewards, curated nutrition plans, and expert hotel suites reservations.",
};

export default function LoginPage() {
  return (
    <main className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      {/* Decorative ambient background aura spheres */}
      <div className="absolute top-1/4 left-1/10 w-72 h-72 bg-primary-container/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-secondary-container/20 rounded-full blur-3xl pointer-events-none" />
      
      {/* Centered card content */}
      <div className="w-full max-w-5xl relative z-10 flex justify-center">
        <AuthForm />
      </div>
    </main>
  );
}
