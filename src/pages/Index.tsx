import { Hero } from "@/components/landing/Hero";
import { Navbar } from "@/components/landing/Navbar";
import { About } from "@/components/landing/About";
import { Specialties } from "@/components/landing/Specialties";
import { Process } from "@/components/landing/Process";
import { Testimonials } from "@/components/landing/Testimonials";
import { CtaFooter } from "@/components/landing/CtaFooter";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <About />
      <Specialties />
      <Process />
      <Testimonials />
      <CtaFooter />
    </main>
  );
};

export default Index;
