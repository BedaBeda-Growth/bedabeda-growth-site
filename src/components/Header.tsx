import { Button } from "@/components/ui/button";
import { useState } from "react";
import { X, Menu } from "lucide-react";
const bedabedaLogo = "/lovable-uploads/bc61751b-5167-4161-823e-43052fe14ff9.png";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

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
                className="h-16 w-auto"
              />
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#approach" className="text-gray-600 hover:text-primary transition-smooth font-medium">
              Approach
            </a>
            <a href="/#case-studies" className="text-gray-600 hover:text-primary transition-smooth font-medium">
              Case Studies
            </a>
            <a href="#newsletter" className="text-gray-600 hover:text-primary transition-smooth font-medium">
              Newsletter
            </a>
            <a href="/contact" className="text-gray-600 hover:text-primary transition-smooth font-medium">
              Contact
            </a>
          </nav>

          {/* Desktop CTA Button */}
          <div className="hidden md:flex items-center space-x-4">
            <Button 
              className="bg-primary hover:bg-primary-muted text-primary-foreground font-semibold px-6 py-2 rounded-lg transition-smooth"
              asChild
            >
              <a href="https://calendly.com/kanika-misra" target="_blank" rel="noopener noreferrer">
                Book a Call
              </a>
            </Button>
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-background/95 backdrop-blur-md border-b border-gray-200 shadow-lg">
            <nav className="container mx-auto px-6 py-4">
              <div className="flex flex-col space-y-4">
                <a 
                  href="#approach" 
                  className="text-gray-600 hover:text-primary transition-smooth font-medium py-2"
                  onClick={closeMenu}
                >
                  Approach
                </a>
                <a 
                  href="/#case-studies" 
                  className="text-gray-600 hover:text-primary transition-smooth font-medium py-2"
                  onClick={closeMenu}
                >
                  Case Studies
                </a>
                <a 
                  href="#newsletter" 
                  className="text-gray-600 hover:text-primary transition-smooth font-medium py-2"
                  onClick={closeMenu}
                >
                  Newsletter
                </a>
                <a 
                  href="/contact" 
                  className="text-gray-600 hover:text-primary transition-smooth font-medium py-2"
                  onClick={closeMenu}
                >
                  Contact
                </a>
                <div className="pt-4 border-t border-gray-200">
                  <Button 
                    className="w-full bg-primary hover:bg-primary-muted text-primary-foreground font-semibold px-6 py-3 rounded-lg transition-smooth"
                    asChild
                  >
                    <a href="https://calendly.com/kanika-misra" target="_blank" rel="noopener noreferrer">
                      Book a Call
                    </a>
                  </Button>
                </div>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;