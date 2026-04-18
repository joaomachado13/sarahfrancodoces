import { Link } from "react-router-dom";
import heroImg from "@/assets/hero-cake.jpg";

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

          <h1 className="mt-6 font-serif text-5xl leading-[1.05] text-petrol md:text-7xl">
            Cada doce,
            <br />
            uma <span className="font-script text-burgundy">assinatura</span>
          </h1>

          <p className="mt-8 max-w-md text-base leading-relaxed text-petrol/75 md:text-lg">
            Bolos e doces 100% personalizados para casamentos, aniversários
            e momentos que merecem ser eternizados em sabor.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-5">
            <Link
              to="/pedido"
              className="group inline-flex items-center gap-3 rounded-2xl bg-burgundy px-8 py-4 text-xs uppercase tracking-[0.25em] text-cream shadow-soft transition-all duration-500 hover:bg-burgundy-deep hover:shadow-elegant"
            >
              Solicitar orçamento
              <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
            </Link>
            <a
              href="#especialidades"
              className="text-xs uppercase tracking-[0.25em] text-petrol/70 underline-offset-8 hover:text-burgundy hover:underline"
            >
              Conhecer especialidades
            </a>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-6 border-t border-burgundy/15 pt-8 max-w-md">
            <Stat number="+500" label="Eventos" />
            <Stat number="100%" label="Sob medida" />
            <Stat number="8 anos" label="De arte" />
          </div>
        </div>

        <div className="relative md:col-span-6">
          <div className="relative animate-fade-in">
            <div className="absolute -inset-4 rounded-2xl border border-burgundy/20" />
            <img
              src={heroImg}
              alt="Bolo de andares bordô artesanal Sarah Franco"
              className="relative h-[520px] w-full rounded-2xl object-cover shadow-elegant md:h-[640px]"
              width={1080}
              height={1920}
            />
            <div className="absolute -bottom-6 -left-6 hidden rounded-2xl bg-cream px-6 py-4 shadow-soft md:block">
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
