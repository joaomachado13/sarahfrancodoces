import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";

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
            className="group mt-10 inline-flex items-center gap-3 rounded-2xl bg-burgundy px-10 py-5 text-xs uppercase tracking-[0.3em] text-cream shadow-soft transition-all duration-500 hover:bg-burgundy-deep hover:shadow-elegant"
          >
            Iniciar meu pedido
            <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
          </Link>
        </div>

        {/* Contatos em destaque */}
        <div className="mx-auto mt-20 grid max-w-2xl gap-5 sm:grid-cols-2">
          <a
            href="https://wa.me/5534984282198"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 rounded-2xl border border-burgundy/15 bg-cream/60 px-6 py-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-burgundy/40 hover:bg-cream hover:shadow-elegant"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white transition-transform duration-300 group-hover:scale-110">
              <svg viewBox="0 0 32 32" className="h-6 w-6" fill="currentColor">
                <path d="M16 .396C7.164.396 0 7.56 0 16.396c0 2.882.762 5.687 2.207 8.157L.06 32l7.66-2.012a15.93 15.93 0 008.28 2.292h.001c8.835 0 15.999-7.164 15.999-16C31.999 7.56 24.835.396 16 .396zm7.244 19.315c-.397-.198-2.348-1.158-2.712-1.29-.364-.132-.628-.198-.893.199-.265.397-1.025 1.29-1.257 1.555-.232.265-.463.298-.86.099-.397-.199-1.676-.617-3.193-1.969-1.18-1.052-1.976-2.353-2.208-2.75-.232-.397-.025-.611.174-.81.179-.178.397-.463.595-.694.198-.232.265-.397.397-.662.132-.265.066-.496-.033-.694-.099-.199-.893-2.151-1.224-2.945-.322-.774-.65-.668-.893-.681l-.762-.013a1.46 1.46 0 00-1.058.496c-.364.397-1.388 1.355-1.388 3.307 0 1.951 1.422 3.836 1.62 4.101.198.265 2.797 4.272 6.78 5.991.948.41 1.687.654 2.262.836.95.302 1.815.26 2.498.158.762-.114 2.348-.96 2.679-1.886.331-.926.331-1.72.232-1.886-.099-.165-.364-.265-.762-.463z" />
              </svg>
            </span>
            <div className="text-left">
              <p className="text-[0.65rem] uppercase tracking-[0.28em] text-petrol/60">WhatsApp</p>
              <p className="font-serif text-xl text-burgundy">(34) 98428-2198</p>
            </div>
          </a>

          <a
            href="https://www.instagram.com/sarahfrancodoces/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 rounded-2xl border border-burgundy/15 bg-cream/60 px-6 py-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-burgundy/40 hover:bg-cream hover:shadow-elegant"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#4f5bd5] text-white transition-transform duration-300 group-hover:scale-110">
              <Instagram className="h-6 w-6" />
            </span>
            <div className="text-left">
              <p className="text-[0.65rem] uppercase tracking-[0.28em] text-petrol/60">Instagram</p>
              <p className="font-serif text-xl text-burgundy">@sarahfrancodoces</p>
            </div>
          </a>
        </div>
      </div>

      <footer className="container-narrow mt-20 border-t border-burgundy/15 pt-10">
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
        </div>
      </footer>
    </section>
  );
};
