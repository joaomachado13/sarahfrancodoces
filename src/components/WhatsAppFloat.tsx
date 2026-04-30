import { useLocation } from "react-router-dom";

export const WhatsAppFloat = () => {
  const { pathname } = useLocation();

  // Esconde o botão em fluxos onde ele atrapalha (ex: formulário de pedido e admin)
  if (pathname.startsWith("/pedido") || pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <a
      href="https://wa.me/5534984415936"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com Sarah Franco no WhatsApp"
      className="group fixed bottom-6 right-6 z-50 flex items-center md:bottom-8 md:right-8"
    >
      {/* Tooltip */}
      <span
        className="pointer-events-none mr-3 hidden translate-x-2 rounded-2xl bg-petrol px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-cream opacity-0 shadow-soft transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 md:inline-flex"
      >
        Fale comigo no WhatsApp
      </span>

      <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-elegant transition-all duration-300 group-hover:scale-[1.08] group-hover:bg-[#1ebe5d] group-hover:shadow-[0_18px_40px_-10px_rgba(37,211,102,0.55)] md:h-16 md:w-16">
        <svg
          viewBox="0 0 32 32"
          className="relative h-8 w-8 md:h-9 md:w-9"
          fill="white"
          aria-hidden="true"
        >
          <path d="M16 .396C7.164.396 0 7.56 0 16.396c0 2.882.762 5.687 2.207 8.157L.06 32l7.66-2.012a15.93 15.93 0 008.28 2.292h.001c8.835 0 15.999-7.164 15.999-16C31.999 7.56 24.835.396 16 .396zm0 29.225h-.001a13.21 13.21 0 01-6.733-1.844l-.483-.287-4.55 1.195 1.215-4.434-.314-.5a13.19 13.19 0 01-2.027-7.355c0-7.296 5.937-13.232 13.234-13.232 3.535 0 6.857 1.378 9.36 3.88a13.15 13.15 0 013.873 9.358c-.002 7.297-5.94 13.219-13.234 13.219zm7.244-9.91c-.397-.198-2.348-1.158-2.712-1.29-.364-.132-.628-.198-.893.199-.265.397-1.025 1.29-1.257 1.555-.232.265-.463.298-.86.099-.397-.199-1.676-.617-3.193-1.969-1.18-1.052-1.976-2.353-2.208-2.75-.232-.397-.025-.611.174-.81.179-.178.397-.463.595-.694.198-.232.265-.397.397-.662.132-.265.066-.496-.033-.694-.099-.199-.893-2.151-1.224-2.945-.322-.774-.65-.668-.893-.681l-.762-.013a1.46 1.46 0 00-1.058.496c-.364.397-1.388 1.355-1.388 3.307 0 1.951 1.422 3.836 1.62 4.101.198.265 2.797 4.272 6.78 5.991.948.41 1.687.654 2.262.836.95.302 1.815.26 2.498.158.762-.114 2.348-.96 2.679-1.886.331-.926.331-1.72.232-1.886-.099-.165-.364-.265-.762-.463z" />
        </svg>
      </span>
    </a>
  );
};
