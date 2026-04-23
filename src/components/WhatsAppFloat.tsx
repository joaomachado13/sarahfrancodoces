import { MessageCircle } from "lucide-react";

export const WhatsAppFloat = () => {
  return (
    <a
      href="https://wa.me/5534984282198"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com Sarah Franco no WhatsApp"
      className="group fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-elegant transition-all duration-300 hover:scale-110 hover:bg-[#1ebe5d] md:bottom-8 md:right-8 md:h-16 md:w-16"
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-30" />
      <MessageCircle className="relative h-7 w-7 md:h-8 md:w-8" fill="currentColor" strokeWidth={0} />
      <svg
        viewBox="0 0 32 32"
        className="absolute h-7 w-7 md:h-8 md:w-8"
        fill="white"
      >
        <path d="M16 .396C7.164.396 0 7.56 0 16.396c0 2.882.762 5.687 2.207 8.157L.06 32l7.66-2.012a15.93 15.93 0 008.28 2.292h.001c8.835 0 15.999-7.164 15.999-16C31.999 7.56 24.835.396 16 .396zm0 29.225h-.001a13.21 13.21 0 01-6.733-1.844l-.483-.287-4.55 1.195 1.215-4.434-.314-.5a13.19 13.19 0 01-2.027-7.355c0-7.296 5.937-13.232 13.234-13.232 3.535 0 6.857 1.378 9.36 3.88a13.15 13.15 0 013.873 9.358c-.002 7.297-5.94 13.219-13.234 13.219zm7.244-9.91c-.397-.198-2.348-1.158-2.712-1.29-.364-.132-.628-.198-.893.199-.265.397-1.025 1.29-1.257 1.555-.232.265-.463.298-.86.099-.397-.199-1.676-.617-3.193-1.969-1.18-1.052-1.976-2.353-2.208-2.75-.232-.397-.025-.611.174-.81.179-.178.397-.463.595-.694.198-.232.265-.397.397-.662.132-.265.066-.496-.033-.694-.099-.199-.893-2.151-1.224-2.945-.322-.774-.65-.668-.893-.681l-.762-.013a1.46 1.46 0 00-1.058.496c-.364.397-1.388 1.355-1.388 3.307 0 1.951 1.422 3.836 1.62 4.101.198.265 2.797 4.272 6.78 5.991.948.41 1.687.654 2.262.836.95.302 1.815.26 2.498.158.762-.114 2.348-.96 2.679-1.886.331-.926.331-1.72.232-1.886-.099-.165-.364-.265-.762-.463z" />
      </svg>
    </a>
  );
};
