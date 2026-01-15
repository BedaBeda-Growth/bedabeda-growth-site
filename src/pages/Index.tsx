import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ClientLogos from "@/components/ClientLogos";
import AntiCookieCutter from "@/components/AntiCookieCutter";
import DisruptiveCROSection from "@/components/DisruptiveCROSection";
import WhoWeWorkWith from "@/components/WhoWeWorkWith";
import CaseStudyTeasers from "@/components/CaseStudyTeasers";
import CaseStudyGallery from "@/components/CaseStudyGallery";
import WhoYoullWorkWith from "@/components/WhoYoullWorkWith";
import ConversionBlock from "@/components/ConversionBlock";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      <main>
        <Hero />
        <ClientLogos />
        <AntiCookieCutter />
        <DisruptiveCROSection />
        <WhoWeWorkWith />
        <CaseStudyTeasers />
        <CaseStudyGallery />
        <WhoYoullWorkWith />
        <ConversionBlock />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
