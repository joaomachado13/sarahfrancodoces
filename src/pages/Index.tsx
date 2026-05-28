import { Hero } from "@/components/landing/Hero";
import { Navbar } from "@/components/landing/Navbar";
import { About } from "@/components/landing/About";
import { Specialties } from "@/components/landing/Specialties";
import { Process } from "@/components/landing/Process";
import { Testimonials } from "@/components/landing/Testimonials";
import { InstagramGrid } from "@/components/landing/InstagramGrid";
import { CtaFooter } from "@/components/landing/CtaFooter";
import { SEO } from "@/components/SEO";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <SEO
        title="Sarah Franco — Doces & Bolos Artesanais Premium"
        description="Confeitaria artesanal premium. Bolos e doces 100% personalizados para casamentos, aniversários e eventos especiais."
        path="/"
      />
      <Navbar />
      <Hero />
      <About />
      <Specialties />
      <Process />
      <Testimonials />
      <InstagramGrid />
      <CtaFooter />
    </main>
  );
};

export default Index;
