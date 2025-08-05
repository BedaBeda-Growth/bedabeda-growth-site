import Header from "@/components/Header";
import Hero from "@/components/Hero";
import AntiCookieCutter from "@/components/AntiCookieCutter";
import WhoWeWorkWith from "@/components/WhoWeWorkWith";
import WhatMakesUsDifferent from "@/components/WhatMakesUsDifferent";
import CaseStudyTeasers from "@/components/CaseStudyTeasers";
import WhoYoullWorkWith from "@/components/WhoYoullWorkWith";
import ConversionBlock from "@/components/ConversionBlock";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <AntiCookieCutter />
        <WhoWeWorkWith />
        <WhatMakesUsDifferent />
        <CaseStudyTeasers />
        <WhoYoullWorkWith />
        <ConversionBlock />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
