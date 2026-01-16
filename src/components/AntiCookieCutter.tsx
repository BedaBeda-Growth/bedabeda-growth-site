import { Button } from "@/components/ui/button";
import SlackMessages from "./SlackMessages";

const AntiCookieCutter = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            Traditional CRO is broken. <br />
            <span className="text-primary">We're rebuilding it.</span>
          </h2>
          
          <SlackMessages />
          
          <div className="max-w-3xl mx-auto space-y-6 text-lg text-gray-600 leading-relaxed text-left">
            <p>
              Most CRO agencies focus on running fast tests for the sake of volume. The problem? That rarely compounds into meaningful growth.
            </p>
            <p>
              At BedaBeda Growth, we take a hybrid approach: blending the best of traditional CRO, deep strategic insight, and "big swing" psychological & storytelling experimentation. The result? Bigger wins, clearer signals, and long-term upside you can actually build on.
            </p>
            <p className="text-xl font-semibold text-primary text-center">
              We're not chasing dashboard dollars. We're chasing real dollars.
            </p>
          </div>

          <div className="pt-4">
            <Button 
              variant="outline"
              size="lg"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold px-8 py-4 rounded-xl transition-smooth"
              asChild
            >
              <a href="/services">
                Check Out Our Services
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AntiCookieCutter;