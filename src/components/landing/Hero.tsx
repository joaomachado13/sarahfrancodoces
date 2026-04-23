import { Link } from "react-router-dom";
import heroImg from "@/assets/hero-doces.jpg";

export const Hero = () => {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-gradient-hero pt-32 pb-20 md:pt-40 md:pb-32"
    >
      {/* Decorative seal */}
      <div className="pointer-events-none absolute -right-24 top-32 hidden h-[420px] w-[420px] rounded-full border border-burgundy/15 lg:block" />
      <div className="pointer-events-none absolute -right-10 top-48 hidden h-[280px] w-[280px] rounded-full border border-burgundy/10 lg:block" />

      <div className="container-narrow relative grid gap-16 md:grid-cols-12 md:items-center">
        <div className="animate-fade-up md:col-span-6">
          <span className="eyebrow">Confeitaria artesanal</span>

          <h1 className="mt-6 font-serif text-[2.5rem] font-medium leading-[1.1] tracking-tight text-petrol sm:text-5xl md:text-7xl md:leading-[1.05]">
            Doces personalizados feitos sob medida para o seu{" "}
            <span className="font-script font-normal text-burgundy">evento</span>
          </h1>

          <p className="mt-6 max-w-md text-base font-normal leading-[1.7] text-petrol/80 md:mt-8 md:text-lg">
            Cada detalhe pensado para tornar o seu momento ainda mais especial.
            Brigadeiros gourmet, doces finos e bolos artesanais — exclusivos para você.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-5">
            <Link
              to="/pedido"
              className="group inline-flex items-center gap-3 rounded-2xl bg-burgundy px-8 py-4 text-xs uppercase tracking-[0.25em] text-cream shadow-soft transition-all duration-500 hover:-translate-y-0.5 hover:bg-burgundy-deep hover:shadow-elegant"
            >
              Quero meu orçamento
              <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
            </Link>
            <a
              href="#especialidades"
              className="text-xs uppercase tracking-[0.25em] text-petrol/70 underline-offset-8 transition-colors hover:text-burgundy hover:underline"
            >
              Conhecer especialidades
            </a>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-6 border-t border-burgundy/15 pt-8 max-w-md">
            <Stat number="+500" label="Eventos" />
            <Stat number="100%" label="Sob medida" />
            <Stat number="5 anos" label="De arte" />
          </div>
        </div>

        <div className="relative md:col-span-6">
          <div className="relative animate-fade-in">
            <div className="absolute -inset-4 rounded-2xl border border-burgundy/20" />
            <div className="relative overflow-hidden rounded-2xl shadow-elegant">
              <img
                src={heroImg}
                alt="Brigadeiros gourmet e docinhos finos artesanais Sarah Franco"
                className="h-[520px] w-full object-cover md:h-[640px]"
                width={1024}
                height={1280}
              />
              {/* Subtle overlay for sophistication & contrast */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-burgundy-deep/35 via-burgundy-deep/5 to-transparent" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-petrol/15" />
              <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-cream/10" />
            </div>
            <div className="absolute -bottom-6 -left-6 z-10 hidden rounded-2xl bg-cream px-6 py-4 shadow-soft md:block">
              <p className="font-script text-2xl text-burgundy">Sarah Franco</p>
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-petrol/70">
                Doces & Bolos
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Stat = ({ number, label }: { number: string; label: string }) => (
  <div>
    <p className="font-serif text-3xl text-burgundy">{number}</p>
    <p className="mt-1 text-[0.65rem] uppercase tracking-[0.25em] text-petrol/60">
      {label}
    </p>
  </div>
);
