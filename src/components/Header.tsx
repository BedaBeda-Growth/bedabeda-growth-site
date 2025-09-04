import { Button } from "@/components/ui/button";
const bedabedaLogo = "/lovable-uploads/bc61751b-5167-4161-823e-43052fe14ff9.png";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-gray-200">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center">
              <img 
                src={bedabedaLogo} 
                alt="BedaBeda Growth" 
                className="h-17 w-auto"
              />
            </a>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#approach" className="text-gray-600 hover:text-primary transition-smooth font-medium">
              Approach
            </a>
            <a href="#case-studies" className="text-gray-600 hover:text-primary transition-smooth font-medium">
              Case Studies
            </a>
            <a href="#newsletter" className="text-gray-600 hover:text-primary transition-smooth font-medium">
              Newsletter
            </a>
            <a href="/contact" className="text-gray-600 hover:text-primary transition-smooth font-medium">
              Contact
            </a>
          </nav>

          {/* CTA Button */}
          <div className="flex items-center space-x-4">
            <Button 
              className="bg-primary hover:bg-primary-muted text-primary-foreground font-semibold px-6 py-2 rounded-lg transition-smooth hidden sm:inline-flex"
            >
              Book a Call
            </Button>
            
            {/* Mobile menu button */}
            <button className="md:hidden p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;