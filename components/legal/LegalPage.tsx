import Link from "next/link";
import { ArrowLeft, Mail, MapPin, ShieldCheck } from "lucide-react";

export interface LegalSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface LegalPageProps {
  eyebrow: string;
  title: string;
  description: string;
  effectiveDate: string;
  sections: LegalSection[];
}

export default function LegalPage({
  eyebrow,
  title,
  description,
  effectiveDate,
  sections,
}: LegalPageProps) {
  return (
    <main className="min-h-screen bg-background text-on-surface">
      <section className="relative overflow-hidden border-b border-outline-variant/20 bg-surface py-16 md:py-24">
        <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-secondary-container/30 blur-3xl" />
        <div className="relative mx-auto max-w-5xl px-6 md:px-16">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-xs font-bold text-secondary transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Don Perro
          </Link>
          <div className="flex max-w-3xl items-start gap-5">
            <div className="hidden h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-lg shadow-primary/15 sm:flex">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-primary">{eyebrow}</p>
              <h1 className="font-heading text-4xl font-extrabold tracking-tight text-on-surface md:text-5xl">{title}</h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-secondary md:text-base">{description}</p>
              <p className="mt-5 inline-flex rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-xs font-bold text-primary">
                Effective {effectiveDate}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 px-6 py-14 md:px-16 lg:grid-cols-[220px_minmax(0,1fr)] lg:py-20">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-on-surface">On this page</p>
          <nav aria-label={`${title} sections`}>
            <ul className="space-y-1 border-l border-outline-variant/40">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="block border-l-2 border-transparent py-1.5 pl-4 text-xs font-medium leading-5 text-secondary transition-colors hover:border-primary hover:text-primary"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <article className="space-y-5">
          {sections.map((section, index) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-28 rounded-2xl border border-outline-variant/25 bg-white p-6 shadow-[0_6px_24px_rgba(90,96,90,0.035)] md:p-8"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 font-mono text-[11px] font-bold text-primary">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h2 className="font-heading text-xl font-bold text-on-surface">{section.title}</h2>
              </div>
              <div className="legal-copy space-y-4 text-sm leading-7 text-secondary">{section.content}</div>
            </section>
          ))}

          <section className="rounded-2xl bg-secondary p-7 text-on-secondary md:p-9">
            <h2 className="font-heading text-xl font-bold text-primary-fixed">Questions?</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-on-secondary/75">
              We want these terms to feel as clear and considered as everything else at Don Perro. Contact us if anything needs clarification.
            </p>
            <div className="mt-5 flex flex-col gap-3 text-xs font-semibold sm:flex-row sm:gap-6">
              <a href="mailto:hello@donperro.com" className="inline-flex items-center gap-2 hover:text-primary-fixed">
                <Mail className="h-4 w-4" /> hello@donperro.com
              </a>
              <span className="inline-flex items-center gap-2 text-on-secondary/80">
                <MapPin className="h-4 w-4" /> Zgharta Main Road, Ehden, Lebanon
              </span>
            </div>
          </section>
        </article>
      </div>
    </main>
  );
}
