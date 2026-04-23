import { Instagram } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";
import sweets from "@/assets/sweets.jpg";
import cake from "@/assets/cake-detail.jpg";
import hero from "@/assets/hero-doces.jpg";
import portrait from "@/assets/sarah-portrait.jpg";

const tiles = [
  { img: sweets, alt: "Doces finos artesanais" },
  { img: cake, alt: "Bolo artesanal" },
  { img: hero, alt: "Mesa de doces personalizada" },
  { img: portrait, alt: "Sarah Franco confeiteira" },
  { img: sweets, alt: "Brigadeiros gourmet" },
  { img: cake, alt: "Detalhe de bolo decorado" },
];

export const InstagramGrid = () => {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="bg-background py-24 md:py-32">
      <div ref={ref} className="container-narrow reveal">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">@sarahfrancodoces</span>
          <h2 className="mt-6 font-serif text-4xl leading-tight text-petrol md:text-5xl">
            Inspirações no <span className="font-script text-burgundy">Instagram</span>
          </h2>
          <p className="mt-6 text-petrol/70">
            Veja eventos reais, bastidores e novas criações no nosso perfil.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          {tiles.map((tile, i) => (
            <a
              key={i}
              href="https://www.instagram.com/sarahfrancodoces/"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block aspect-square overflow-hidden rounded-2xl shadow-soft"
              aria-label="Abrir Instagram da Sarah Franco"
            >
              <img
                src={tile.img}
                alt={tile.alt}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-burgundy-deep/0 transition-all duration-500 group-hover:bg-burgundy-deep/55">
                <Instagram className="h-7 w-7 text-cream opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </div>
            </a>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a
            href="https://www.instagram.com/sarahfrancodoces/"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 rounded-2xl border border-burgundy/30 px-7 py-3.5 text-xs uppercase tracking-[0.25em] text-burgundy transition-all duration-500 hover:-translate-y-0.5 hover:border-burgundy hover:bg-burgundy hover:text-cream"
          >
            <Instagram className="h-4 w-4" />
            Seguir no Instagram
          </a>
        </div>
      </div>
    </section>
  );
};
