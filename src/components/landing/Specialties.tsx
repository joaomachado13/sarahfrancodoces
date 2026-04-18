import sweets from "@/assets/sweets.jpg";
import cake from "@/assets/cake-detail.jpg";

const items = [
  {
    img: cake,
    title: "Bolos artesanais",
    description:
      "Bolos de andares, naked cakes e criações autorais. Massas, recheios e coberturas combinados sob medida para o seu evento.",
    tag: "Sob encomenda",
  },
  {
    img: sweets,
    title: "Doces finos",
    description:
      "Brigadeiros gourmet, bombons e doces de festa em sabores ilimitados, com forminhas no tom da sua paleta.",
    tag: "Personalizáveis",
  },
];

export const Specialties = () => {
  return (
    <section id="especialidades" className="bg-background py-24 md:py-32">
      <div className="container-narrow">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Especialidades</span>
          <h2 className="mt-6 font-serif text-4xl leading-tight text-petrol md:text-5xl">
            Duas paixões, <span className="font-script text-burgundy">infinitas</span> possibilidades
          </h2>
          <p className="mt-6 text-petrol/70">
            Sem catálogo, sem limites de sabor. Você sonha — nós executamos.
          </p>
        </div>

        <div className="mt-20 grid gap-10 md:grid-cols-2 md:gap-14">
          {items.map((item) => (
            <article key={item.title} className="group">
              <div className="relative overflow-hidden">
                <img
                  src={item.img}
                  alt={item.title}
                  loading="lazy"
                  className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute left-4 top-4 bg-cream/90 px-3 py-1 text-[0.65rem] uppercase tracking-[0.25em] text-burgundy">
                  {item.tag}
                </span>
              </div>
              <div className="mt-6 flex items-baseline justify-between gap-6">
                <h3 className="font-serif text-3xl text-petrol">{item.title}</h3>
                <span className="h-px flex-1 bg-burgundy/20" />
              </div>
              <p className="mt-4 text-petrol/70 leading-relaxed">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
