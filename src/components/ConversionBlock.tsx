import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ConversionBlock = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="space-y-6">
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              Ready to Scale Beyond <br />
              <span className="text-primary">Cookie-Cutter CRO?</span>
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Let's discuss your growth bottlenecks and design experiments that actually move the needle.
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-foreground">
                  Book Your Discovery Call
                </h3>
                <p className="text-gray-600">
                  30-minute strategic session to identify your biggest conversion opportunities.
                </p>
                <ul className="text-left space-y-2 text-gray-600">
                  <li className="flex items-center">
                    <span className="text-primary mr-2">✓</span>
                    Conversion audit & opportunity assessment
                  </li>
                  <li className="flex items-center">
                    <span className="text-primary mr-2">✓</span>
                    Strategic experiment roadmap
                  </li>
                  <li className="flex items-center">
                    <span className="text-primary mr-2">✓</span>
                    Custom approach for your business
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <div className="space-y-4">
                  <Input 
                    placeholder="Your work email"
                    className="border-gray-300 rounded-lg py-3 px-4"
                  />
                  <Input 
                    placeholder="Company website"
                    className="border-gray-300 rounded-lg py-3 px-4"
                  />
                </div>
                <Button 
                  size="lg"
                  className="w-full bg-primary hover:bg-primary-muted text-primary-foreground font-semibold py-4 rounded-lg transition-smooth"
                >
                  Schedule Discovery Call
                </Button>
                <p className="text-sm text-gray-500">
                  No commitment. No pitch. Just strategic insights.
                </p>
              </div>
            </div>
          </div>

          {/* Newsletter signup */}
          <div className="border-t border-gray-200 pt-12">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-foreground">
                Strategic Insights, No Fluff
              </h3>
              <p className="text-gray-600">
                Our best strategic insights — no fluff, no spam.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Input 
                  placeholder="Enter your email"
                  className="border-gray-300 rounded-lg flex-1"
                />
                <Button 
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold px-6 rounded-lg transition-smooth"
                >
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConversionBlock;