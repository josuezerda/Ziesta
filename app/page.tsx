import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Explainer from "@/components/Explainer";
import HowItWorks from "@/components/HowItWorks";
import Stats from "@/components/Stats";
import Ecosystem from "@/components/Ecosystem";
import Roadmap from "@/components/Roadmap";
import ZiestaScan from "@/components/ZiestaScan";
import BlockchainPhoneAnim from "@/components/BlockchainPhoneAnim";
import Programas from "@/components/Programas";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <ZiestaScan />
        <BlockchainPhoneAnim />
        <Features />
        <Explainer />
        <HowItWorks />
        <Stats />
        <Ecosystem />
        <Roadmap />
        <Programas />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
