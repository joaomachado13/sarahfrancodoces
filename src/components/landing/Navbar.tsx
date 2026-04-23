import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo-sarah-franco.png";

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navItems = [
    { href: "#sobre", label: "Sobre" },
    { href: "#especialidades", label: "Especialidades" },
    { href: "#processo", label: "Processo" },
    { href: "#depoimentos", label: "Depoimentos" },
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-cream/85 backdrop-blur-md shadow-soft"
          : "bg-transparent"
      }`}
    >
      <div className="container-narrow flex h-20 items-center justify-between gap-4 md:h-24">
        <a href="#top" className="flex shrink-0 items-center gap-3 py-2">
          <img
            src={logo}
            alt="Sarah Franco Doces & Bolos"
            className="h-12 w-auto opacity-95 md:h-20"
            style={{ filter: "brightness(0.4) sepia(1) hue-rotate(-20deg) saturate(6)" }}
          />
        </a>

        <nav className="hidden items-center gap-10 md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm tracking-wide text-petrol/80 transition-colors hover:text-burgundy"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <Link
          to="/pedido"
          className="group inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-2xl bg-burgundy px-4 py-2.5 text-[0.65rem] uppercase tracking-[0.18em] text-cream transition-all duration-500 hover:bg-burgundy-deep hover:shadow-elegant md:px-5 md:text-xs md:tracking-[0.2em]"
        >
          Fazer pedido
          <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </header>
  );
};
