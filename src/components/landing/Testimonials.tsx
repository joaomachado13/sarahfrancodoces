const testimonials = [
  {
    text: "Foi simplesmente o melhor bolo que já comemos. Cada detalhe pensado, cada sabor inesquecível. Os convidados não pararam de elogiar.",
    name: "Marina & Rafael",
    event: "Casamento — Out 2024",
  },
  {
    text: "A Sarah entendeu exatamente o que eu queria, mesmo quando eu mesma não sabia explicar. Os doces foram a alma da festa da minha filha.",
    name: "Camila Vasconcelos",
    event: "Aniversário — Mai 2024",
  },
  {
    text: "Atendimento impecável e produto extraordinário. A apresentação do bolo foi tão linda que parecia pena cortar.",
    name: "Dr. Henrique Almeida",
    event: "Bodas de prata — Ago 2024",
  },
];

export const Testimonials = () => {
  return (
    <section id="depoimentos" className="bg-cream py-24 md:py-32">
      <div className="container-narrow">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Quem já viveu</span>
          <h2 className="mt-6 font-serif text-4xl leading-tight text-petrol md:text-5xl">
            Histórias <span className="font-script text-burgundy">adoçadas</span>
          </h2>
        </div>

        <div className="mt-20 grid gap-8 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <figure
              key={i}
              className="flex flex-col border border-burgundy/15 bg-background p-8 md:p-10"
            >
              <span className="font-serif text-6xl leading-none text-burgundy/40">"</span>
              <blockquote className="mt-2 flex-1 text-petrol/80 leading-relaxed">
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
