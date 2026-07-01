import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

type SearchParams = Record<string, string | string[] | undefined>;

interface LoginPageProps {
  searchParams?: Promise<SearchParams> | SearchParams;
}

export const metadata: Metadata = {
  title: "Sign In | Don Perro",
  description: "Sign in to your Don Perro account through Shopify.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const authError = getParam(params, "auth_error");

  if (authError) {
    return (
      <main className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 py-12 bg-background">
        <section className="w-full max-w-md rounded-lg border border-outline-variant bg-surface p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold font-heading text-on-surface">Shopify login is unavailable</h1>
          <p className="mt-3 text-sm leading-6 text-secondary">{authError}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/api/auth/login"
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-bold text-on-primary transition hover:opacity-90"
            >
              Try Again
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-outline-variant px-5 py-3 text-sm font-bold text-secondary transition hover:text-primary"
            >
              Back Home
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const returnTo = getParam(params, "returnTo") || getParam(params, "return_to");
  const query = new URLSearchParams();

  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    query.set("return_to", returnTo);
  }

  redirect(`/api/auth/login${query.size ? `?${query.toString()}` : ""}`);
}

function getParam(params: SearchParams | undefined, key: string) {
  const value = params?.[key];
  return Array.isArray(value) ? value[0] : value;
}
