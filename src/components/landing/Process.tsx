const steps = [
  {
    n: "01",
    title: "Briefing",
    desc: "Você nos conta sobre o evento, paleta, expectativas e número de convidados.",
  },
  {
    n: "02",
    title: "Composição",
    desc: "Montamos juntos cada doce e bolo — sabores, recheios, coberturas e detalhes.",
  },
  {
    n: "03",
    title: "Orçamento",
    desc: "Recebe um orçamento detalhado em PDF, ajustado até a aprovação final.",
  },
  {
    n: "04",
    title: "Entrega",
    desc: "Produzimos com carinho e entregamos no horário combinado, prontos para celebrar.",
  },
];

export const Process = () => {
  return (
    <section id="processo" className="bg-burgundy-deep py-24 text-cream md:py-32">
      <div className="container-narrow">
        <div className="grid gap-12 md:grid-cols-12 md:items-end">
          <div className="md:col-span-5">
            <span className="inline-flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.32em] text-cream/70 before:h-px before:w-8 before:bg-cream/40">
              Como trabalhamos
            </span>
            <h2 className="mt-6 font-serif text-4xl leading-tight md:text-5xl">
              Um processo <span className="font-script">artesanal</span> do começo ao fim
            </h2>
          </div>
          <p className="text-cream/75 md:col-span-6 md:col-start-7">
            Cada pedido começa com uma conversa e termina com uma entrega impecável.
            Trabalhamos com agenda limitada para garantir dedicação a cada evento.
          </p>
        </div>

        <div className="mt-20 grid gap-px bg-cream/15 md:grid-cols-4">
          {steps.map((step) => (
            <div key={step.n} className="bg-burgundy-deep p-8 md:p-10">
              <p className="font-serif text-5xl text-cream/30">{step.n}</p>
              <h3 className="mt-6 font-serif text-2xl">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-cream/70">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
