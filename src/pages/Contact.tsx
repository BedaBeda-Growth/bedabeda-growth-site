import { Mail, Twitter, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-primary/10 via-background to-secondary/5">
        <div className="absolute inset-0 bg-gradient-subtle opacity-50"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-8">
              Let's Talk!
            </h1>
            <div className="w-24 h-1 bg-primary mx-auto mb-8"></div>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
              Get ready to discuss fresh ideas and proven strategies to elevate your business the way it deserves. 
              We're often able to lower acquisition costs while doubling, even tripling your conversions…{" "}
              <span className="italic text-primary font-medium">and continually scaling results</span>{" "}
              within just a few short months.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Email */}
            <div className="text-center p-8 bg-card rounded-2xl border border-border hover:shadow-elegant transition-all duration-300 group">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Email Us</h3>
              <a 
                href="mailto:hello@bedabedagrowth.com"
                className="text-primary hover:text-primary-muted font-medium text-lg transition-colors inline-block"
              >
                hello@bedabedagrowth.com
              </a>
            </div>

            {/* Twitter/DM */}
            <div className="text-center p-8 bg-card rounded-2xl border border-border hover:shadow-elegant transition-all duration-300 group">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                <Twitter className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">DM Us</h3>
              <a 
                href="https://twitter.com/bedabedagrowth"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary-muted font-medium text-lg transition-colors inline-block"
              >
                @bedabedagrowth
              </a>
            </div>

            {/* Book a Call */}
            <div className="text-center p-8 bg-card rounded-2xl border border-border hover:shadow-elegant transition-all duration-300 group">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Book a Call</h3>
              <a 
                href="https://calendly.com/kanika-misra"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary-muted font-medium text-lg transition-colors inline-block"
              >
                Find Time on Calendly
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
            It's time to increase your conversion rates and profitability.
          </h2>
          <Button 
            asChild
            size="lg"
            className="bg-primary hover:bg-primary-muted text-primary-foreground font-semibold px-8 py-4 text-lg rounded-xl transition-all duration-300 hover:shadow-elegant"
          >
            <a 
              href="https://calendly.com/kanika-misra"
              target="_blank"
              rel="noopener noreferrer"
            >
              Find Time on Our Calendly
            </a>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;