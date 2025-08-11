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
            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto text-left">
              Let's discuss your growth bottlenecks and design experiments that actually move the needle.
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h3 className="text-xl md:text-2xl font-bold text-foreground text-left">
                  Book Your Discovery Call
                </h3>
                <p className="text-gray-600 text-left">
                  30-minute strategic session to identify your biggest conversion opportunities.
                </p>
              </div>

              <div className="space-y-4">
                <a 
                  href="https://calendly.com/kanika-misra"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button 
                    size="lg"
                    className="w-full bg-primary hover:bg-primary-muted text-primary-foreground font-semibold py-4 rounded-lg transition-smooth"
                  >
                    Schedule Discovery Call
                  </Button>
                </a>
                <p className="text-sm text-gray-500 text-center">
                  No commitment. No pitch. Just strategic insights.
                </p>
              </div>
            </div>
          </div>

          {/* Newsletter signup */}
          <div className="border-t border-gray-200 pt-12">
            <iframe 
              src="https://embeds.beehiiv.com/9cfbbe46-9ae1-495b-a2ef-d8b15e1af9c1" 
              data-test-id="beehiiv-embed" 
              width="100%" 
              height="320" 
              frameBorder="0" 
              scrolling="no" 
              style={{
                borderRadius: '4px',
                border: '2px solid #e5e7eb',
                margin: '0',
                backgroundColor: 'transparent'
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConversionBlock;