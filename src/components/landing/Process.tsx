import { MessageSquare, FileText, Heart } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";

const steps = [
  {
    n: "01",
    icon: MessageSquare,
    title: "Você descreve seu pedido",
    desc: "Conte sobre o evento, paleta, sabores favoritos e o número de convidados. Sem catálogos fechados.",
  },
  {
    n: "02",
    icon: FileText,
    title: "Recebe um orçamento personalizado",
    desc: "Montamos um orçamento detalhado em PDF, ajustado em conjunto até a aprovação final.",
  },
  {
    n: "03",
    icon: Heart,
    title: "Produção artesanal com carinho",
    desc: "Cada doce é produzido à mão e entregue no horário combinado, prontos para celebrar.",
  },
];

export const Process = () => {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section id="processo" className="bg-burgundy-deep py-24 text-cream md:py-32">
      <div ref={ref} className="container-narrow reveal">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.32em] text-cream/70 before:h-px before:w-8 before:bg-cream/40 after:h-px after:w-8 after:bg-cream/40">
            Como funciona
          </span>
          <h2 className="mt-6 font-serif text-4xl leading-tight md:text-5xl">
            Simples, <span className="font-script">do início ao fim</span>
          </h2>
          <p className="mt-6 text-cream/75">
            Em três passos você sai da ideia para um pedido pronto para encantar.
          </p>
        </div>

        <div className="mt-20 grid gap-6 md:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.n}
                className="group relative rounded-2xl border border-cream/15 bg-burgundy-deep/60 p-8 transition-all duration-500 hover:-translate-y-1 hover:border-cream/35 hover:bg-burgundy/40 md:p-10"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cream/20 bg-cream/5 transition-all duration-500 group-hover:bg-cream/10">
                    <Icon className="h-6 w-6" strokeWidth={1.4} />
                  </span>
                  <p className="font-serif text-4xl text-cream/30">{step.n}</p>
                </div>
                <h3 className="mt-8 font-serif text-2xl">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-cream/70">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
