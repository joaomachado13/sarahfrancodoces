import sarahPortrait from "@/assets/sarah-portrait.jpg";

export const About = () => {
  return (
    <section id="sobre" className="bg-cream py-24 md:py-32">
      <div className="container-narrow grid gap-16 md:grid-cols-12 md:items-center">
        <div className="relative md:col-span-5">
          <div className="relative aspect-square w-full max-w-md mx-auto">
            <div className="absolute -inset-3 rounded-2xl border border-burgundy/20" />
            <img
              src={sarahPortrait}
              alt="Sarah Franco, confeiteira-chefe"
              loading="lazy"
              className="relative h-full w-full rounded-2xl object-cover shadow-elegant"
            />
            <div className="absolute -bottom-5 -left-5 hidden rounded-2xl bg-burgundy px-5 py-3 shadow-soft md:block">
              <p className="font-script text-xl text-cream">há 5 anos</p>
              <p className="text-[0.6rem] uppercase tracking-[0.3em] text-cream/80">
                criando memórias
              </p>
            </div>
          </div>
        </div>

        <div className="md:col-span-7">
          <span className="eyebrow">A confeiteira</span>
          <h2 className="mt-6 font-serif text-4xl leading-tight text-petrol md:text-5xl">
            A doçura encontra <br />
            a <span className="font-script text-burgundy">precisão</span>
          </h2>

          <p className="mt-8 text-base leading-relaxed text-petrol/75 md:text-lg">
            Há mais de cinco anos, Sarah Franco transforma momentos em
            memórias afetivas. Cada bolo é desenhado em conjunto com você,
            cada doce nasce de uma combinação única de sabores escolhida
            para o seu evento.
          </p>
          <p className="mt-4 text-base leading-relaxed text-petrol/75 md:text-lg">
            Não trabalhamos com catálogo fechado — trabalhamos com a sua
            história, traduzida em massas, recheios e detalhes que só
            existem por causa de você.
          </p>

          <div className="mt-10 flex items-center gap-6">
            <p className="font-script text-3xl text-burgundy">Sarah Franco</p>
            <span className="h-px flex-1 bg-burgundy/30" />
            <span className="text-[0.7rem] uppercase tracking-[0.3em] text-petrol/60">
              Confeiteira-chefe
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
