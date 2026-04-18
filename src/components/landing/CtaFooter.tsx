import { Link } from "react-router-dom";

export const CtaFooter = () => {
  return (
    <section className="relative overflow-hidden bg-background py-24 md:py-32">
      <div className="container-narrow">
        <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
          <span className="eyebrow">Vamos começar</span>
          <h2 className="mt-6 font-serif text-4xl leading-tight text-petrol md:text-6xl">
            Conte-nos sobre o seu <br />
            <span className="font-script text-burgundy">próximo evento</span>
          </h2>
          <p className="mt-8 max-w-xl text-petrol/70 md:text-lg">
            Sem catálogos. Sem limites. Apenas a sua história, transformada em sabor.
            Solicite um orçamento personalizado em poucos minutos.
          </p>
          <Link
            to="/pedido"
            className="group mt-10 inline-flex items-center gap-3 bg-burgundy px-10 py-5 text-xs uppercase tracking-[0.3em] text-cream shadow-soft transition-all duration-500 hover:bg-burgundy-deep hover:shadow-elegant"
          >
            Iniciar meu pedido
            <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>

      <footer className="container-narrow mt-24 border-t border-burgundy/15 pt-10">
        <div className="flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
          <div>
            <p className="font-script text-2xl text-burgundy">Sarah Franco</p>
            <p className="text-[0.7rem] uppercase tracking-[0.3em] text-petrol/60">
              Doces & Bolos
            </p>
          </div>
          <p className="text-xs text-petrol/60">
            © {new Date().getFullYear()} Sarah Franco — Todos os direitos reservados
          </p>
          <a
            href="https://wa.me/5500000000000"
            className="text-xs uppercase tracking-[0.25em] text-burgundy hover:text-burgundy-deep"
          >
            WhatsApp →
          </a>
        </div>
      </footer>
    </section>
  );
};
