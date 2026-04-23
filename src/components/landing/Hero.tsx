import { Link } from "react-router-dom";
import heroImg from "@/assets/hero-doces.jpg";

export const Hero = () => {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-gradient-hero pt-28 pb-16 md:pt-32 md:pb-20 lg:pt-40 lg:pb-32"
    >
      {/* Decorative seal */}
      <div className="pointer-events-none absolute -right-24 top-32 hidden h-[420px] w-[420px] rounded-full border border-burgundy/15 lg:block" />
      <div className="pointer-events-none absolute -right-10 top-48 hidden h-[280px] w-[280px] rounded-full border border-burgundy/10 lg:block" />

      <div className="container-narrow relative grid gap-12 md:gap-14 lg:grid-cols-12 lg:items-center lg:gap-16">
        <div className="animate-fade-up min-w-0 w-full max-w-2xl mx-auto text-center lg:col-span-6 lg:mx-0 lg:max-w-none lg:text-left">
          <span className="eyebrow">Confeitaria artesanal</span>

          <h1 className="mt-5 mx-auto font-serif text-[2rem] font-medium leading-[1.15] tracking-tight text-petrol text-balance sm:mt-6 sm:text-[2.6rem] md:max-w-[18ch] md:text-[3.35rem] lg:mx-0 lg:max-w-none lg:text-6xl lg:leading-[1.05] xl:text-7xl">
            Doces personalizados feitos sob medida para o seu{" "}
            <span className="font-script font-normal text-burgundy">evento</span>
          </h1>

          <p className="mt-6 mx-auto max-w-lg text-base font-normal leading-[1.7] text-petrol/80 md:mt-8 md:text-lg lg:mx-0">
            Cada detalhe pensado para tornar o seu momento ainda mais especial.
            Brigadeiros gourmet, doces finos e bolos artesanais — exclusivos para você.
          </p>

          <div className="mt-10 flex flex-col items-center gap-5 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start">
            <Link
              to="/pedido"
              className="group inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-burgundy px-8 py-4 text-xs uppercase tracking-[0.25em] text-cream shadow-soft transition-all duration-500 hover:-translate-y-0.5 hover:bg-burgundy-deep hover:shadow-elegant sm:w-auto"
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

          <div className="mt-12 mx-auto grid max-w-md grid-cols-3 gap-4 border-t border-burgundy/15 pt-7 sm:gap-6 md:mt-14 md:max-w-lg md:pt-8 lg:mx-0">
            <Stat number="+500" label="Eventos" />
            <Stat number="100%" label="Sob medida" />
            <Stat number="5 anos" label="De arte" />
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md sm:max-w-lg md:max-w-xl lg:col-span-6 lg:max-w-none">
          <div className="relative animate-fade-in">
            <div className="absolute -inset-4 rounded-2xl border border-burgundy/20" />
            <div className="relative overflow-hidden rounded-2xl shadow-elegant">
              <img
                src={heroImg}
                alt="Brigadeiros gourmet e docinhos finos artesanais Sarah Franco"
                className="h-[380px] w-full object-cover sm:h-[480px] md:h-[560px] lg:h-[640px]"
                width={1024}
                height={1280}
              />
              {/* Subtle overlay for sophistication & contrast */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-burgundy-deep/35 via-burgundy-deep/5 to-transparent" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-petrol/15" />
              <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-cream/10" />
            </div>
            <div className="absolute -bottom-6 -left-6 z-10 hidden rounded-2xl bg-cream px-6 py-4 shadow-soft lg:block">
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
