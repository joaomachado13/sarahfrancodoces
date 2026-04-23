import { Star } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";

const testimonials = [
  {
    text: "Os doces ficaram perfeitos, exatamente como imaginei! Cada detalhe foi pensado e os convidados não pararam de elogiar.",
    name: "Marina & Rafael",
    event: "Casamento — Out 2024",
  },
  {
    text: "Atendimento incrível e tudo muito bem feito. A Sarah entendeu exatamente o que eu queria, mesmo quando eu não sabia explicar.",
    name: "Camila Vasconcelos",
    event: "Aniversário — Mai 2024",
  },
  {
    text: "Apresentação impecável e sabor extraordinário. Foi a alma da nossa festa — virou conversa entre os convidados por dias.",
    name: "Dr. Henrique Almeida",
    event: "Bodas de prata — Ago 2024",
  },
];

export const Testimonials = () => {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section id="depoimentos" className="bg-cream py-24 md:py-32">
      <div ref={ref} className="container-narrow reveal">
        {/* Destaque de prova social */}
        <div className="mx-auto mb-16 flex max-w-3xl flex-col items-center rounded-2xl border border-burgundy/15 bg-background px-8 py-10 text-center shadow-soft md:flex-row md:items-center md:gap-10 md:text-left">
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-1 text-burgundy">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" strokeWidth={0} />
              ))}
            </div>
            <p className="mt-3 font-serif text-3xl text-petrol md:text-4xl">+500</p>
            <p className="text-[0.7rem] uppercase tracking-[0.28em] text-petrol/60">
              Eventos celebrados
            </p>
          </div>
          <div className="mt-6 h-px w-16 bg-burgundy/20 md:mt-0 md:h-16 md:w-px" />
          <p className="font-serif text-xl leading-snug text-petrol md:text-2xl">
            Mais de <span className="font-script text-burgundy">5 anos</span> criando
            doces únicos para momentos verdadeiramente especiais.
          </p>
        </div>

        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Quem já viveu</span>
          <h2 className="mt-6 font-serif text-4xl leading-tight text-petrol md:text-5xl">
            Histórias <span className="font-script text-burgundy">adoçadas</span>
          </h2>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <figure
              key={i}
              className="flex flex-col rounded-2xl border border-burgundy/15 bg-background p-8 shadow-soft transition-all duration-500 hover:-translate-y-1 hover:border-burgundy/35 hover:shadow-elegant md:p-10"
            >
              <span className="font-serif text-6xl leading-none text-burgundy/40">"</span>
              <blockquote className="mt-2 flex-1 leading-relaxed text-petrol/80">
                {t.text}
              </blockquote>
              <figcaption className="mt-8 border-t border-burgundy/15 pt-6">
                <p className="font-serif text-lg text-petrol">{t.name}</p>
                <p className="mt-1 text-[0.7rem] uppercase tracking-[0.25em] text-burgundy/70">
                  {t.event}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};
