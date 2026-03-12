import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

// Hardcoded fallback case studies (used when no Keystatic data is available)
const fallbackCaseStudies = [
  {
    slug: "product-page-optimization",
    entry: {
      title: "Product Page Optimization",
      metric: "+15.8% Revenue Per Session",
      description: "Data-driven PDP overhaul for niche home goods",
      category: "E-commerce",
      cardImage: "/uploads/cee89299-737e-4676-b52f-73feda5f3234.png",
      clientLogo: "/uploads/84c87a09-5422-4ab4-9d3a-33ef18351388.png",
      modalImage: "/uploads/073035e6-0b23-493f-b261-b59c55a82d2b.png",
      challenge: "Allegiance Flag Supply was growing quickly and wanted to ensure efficiency as they scaled, especially knowing their product was more expensive than others in the market.",
      solution: "We used a combination of user research, custom conversion & behavioral reports, and an updated page journey to showcase the right information at the right time to build trust & perceived value.",
      order: 1,
      isActive: true
    }
  },
  {
    slug: "landing-page-optimization",
    entry: {
      title: "Landing Page Optimization",
      metric: "+57.4% Conversion Rate Increase",
      description: "Ad-focused dedicated landing page",
      category: "Landing Page",
      cardImage: "/uploads/65bfccf9-b541-42fb-b0d7-0cd49a416900.png",
      clientLogo: "/uploads/044f4f7c-632f-40fd-ac25-44e34df54ca2.png",
      modalImage: "/uploads/c849057c-6021-4b80-b5e8-2f0a47117a60.png",
      challenge: "Paperlike had historically only sent their traffic primarily to the product page, and they wanted to improve performance by testing landing pages in a clear and structured way.",
      solution: "The BedaBeda Growth team used our deep-dive audit and analysis process to create a landing page testing roadmap and framework, customized to support top-performing ads & overall user needs, hesitations, and values.",
      order: 2,
      isActive: true
    }
  },
  {
    slug: "homepage-optimization",
    entry: {
      title: "Homepage Optimization",
      metric: "+36.3% Revenue Per Session",
      description: "Homepage optimization for high-volume B2C online community",
      category: "Online B2C Community",
      cardImage: "/uploads/eb294c82-2731-41e6-86f1-ba3cad39182a.png",
      clientLogo: "/uploads/4c063577-ca79-4938-8d0f-4e64f18822d5.png",
      modalImage: "/uploads/ac9e1377-2ade-4510-93cd-1a3bc9f79323.png",
      challenge: "The Personal Development School was investing meaningfully in growing across all their acquisition channels. They wanted to make sure they were converting that traffic as effectively and efficiently as possible to support profitable growth.",
      solution: "The BedaBeda Growth team discovered that the audience knew their problems and had a decent understanding of how to solve it, but they needed confidence that joining the PDS community was the best, most effective to do that. BBG created a new homepage focused on user education, confidence, and trust-building to outperform the control.",
      order: 3,
      isActive: true
    }
  },
  {
    slug: "catalog-page-optimization",
    entry: {
      title: "Catalog Page Optimization",
      metric: "+$1.8MM New Annual Revenue",
      description: "Catalog/Collections page optimization for 9-figure brand",
      category: "High SKU E-Commerce",
      cardImage: "/uploads/74ef33b8-f697-485c-8321-217c9176ac92.png",
      clientLogo: "/uploads/f067cea1-5685-4618-bc9a-dd031addb552.png",
      modalImage: "/uploads/deec6508-50b6-4f84-8315-c099763ec39d.png",
      challenge: "This 9-figure equestrian brand, Schneiders Saddlery, needed to optimize their catalog pages to better build trust and improve the shopping experience for their customers.",
      solution: "The BedaBeda Growth team implemented an immersive collections page update, focused on improving product discovery, filtering capabilities, and visual hierarchy to help customers navigate the extensive inventory more effectively and with higher intent & trust.",
      order: 4,
      isActive: true
    }
  },
  {
    slug: "offer-optimization",
    entry: {
      title: "Offer Optimization",
      metric: "+95.6% ROAS Increase",
      description: "Landing page offer optimization for men's care brand",
      category: "Landing Page",
      cardImage: "/uploads/435022bc-f43c-43b0-ada3-cfc61bfbad0d.png",
      clientLogo: null,
      modalImage: "/uploads/435022bc-f43c-43b0-ada3-cfc61bfbad0d.png",
      challenge: "This men's care brand needed to optimize their landing page offers to improve ROAS and better convert their paid traffic from various advertising channels.",
      solution: "The BedaBeda Growth team redesigned the landing page experience with optimized offer structure, improved value proposition clarity, and enhanced trust signals to maximize conversion rates and return on ad spend.",
      order: 5,
      isActive: true
    }
  }
];

interface CaseStudyEntry {
  title: string;
  metric: string;
  description?: string;
  category: string;
  cardImage?: string | null;
  clientLogo?: string | null;
  modalImage?: string | null;
  challenge: string;
  solution: string;
  order?: number;
  isActive?: boolean;
}

interface CaseStudy {
  slug: string;
  entry: CaseStudyEntry;
}

interface Props {
  caseStudies?: CaseStudy[];
}

const CaseStudyGallery = ({ caseStudies }: Props) => {
  // Use provided case studies or fall back to hardcoded ones
  const studies = (caseStudies && caseStudies.length > 0) ? caseStudies : fallbackCaseStudies;

  // Filter active and sort by order
  const activeCaseStudies = studies
    .filter(cs => cs.entry.isActive !== false)
    .sort((a, b) => (a.entry.order || 99) - (b.entry.order || 99));

  return (
    <section id="case-studies" className="py-20 bg-gray-900 text-white scroll-mt-16">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <div>
              <p className="text-primary text-sm font-medium mb-2">Case Studies & Portfolio</p>
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
                Browse Some of Our Wins
              </h2>
            </div>
          </div>

          <Carousel className="w-full">
            <CarouselContent className="-ml-4">
              {activeCaseStudies.map((study) => (
                <CarouselItem key={study.slug} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="bg-gray-800 rounded-2xl overflow-hidden cursor-pointer hover:bg-gray-750 transition-colors group">
                        <div className="aspect-[4/3] bg-gray-700 relative overflow-hidden">
                          {study.entry.cardImage && (
                            <>
                              <img
                                src={study.entry.cardImage}
                                alt={study.entry.title}
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20"></div>
                            </>
                          )}
                          <div className="absolute bottom-4 left-4 right-4">
                            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 relative">
                              <p className="text-xs text-gray-300 mb-1">{study.entry.category}</p>
                              <p className="font-semibold text-lg">{study.entry.metric}</p>
                              {study.entry.clientLogo && (
                                <img
                                  src={study.entry.clientLogo}
                                  alt="Client logo"
                                  className="absolute top-2 right-2 h-6 w-auto"
                                />
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="p-6">
                          <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                            {study.entry.title}
                          </h3>
                          <p className="text-gray-400 text-sm">
                            {study.entry.description}
                          </p>
                        </div>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <div className="p-6">
                        {study.entry.modalImage && (
                          <div className="bg-gray-100 rounded-lg mb-6 overflow-hidden">
                            <img
                              src={study.entry.modalImage}
                              alt={study.entry.title}
                              className="w-full h-auto object-contain"
                            />
                          </div>
                        )}
                        <h2 className="text-2xl font-bold mb-4">{study.entry.title}</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="font-semibold mb-2">Challenge</h3>
                            <p className="text-gray-600 mb-4">{study.entry.challenge}</p>
                            <h3 className="font-semibold mb-2">Solution</h3>
                            <p className="text-gray-600">{study.entry.solution}</p>
                          </div>
                          <div>
                            <h3 className="font-semibold mb-2">Results</h3>
                            <div className="bg-gray-50 rounded-lg p-4">
                              <div className="text-3xl font-bold text-primary mb-2">{study.entry.metric}</div>
                              <p className="text-gray-600 text-sm">{study.entry.description}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex text-black hover:text-white h-12 w-12" />
            <CarouselNext className="hidden md:flex text-black hover:text-white h-12 w-12" />
            <CarouselPrevious className="md:hidden flex text-black hover:text-white h-12 w-12 -left-2 z-10 top-[40%]" />
            <CarouselNext className="md:hidden flex text-black hover:text-white h-12 w-12 -right-2 z-10 top-[40%]" />
          </Carousel>

          <div className="text-center mt-12">
            <a 
              href="https://calendly.com/kanika-misra" 
              target="_blank" 
              rel="noopener noreferrer"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className: "border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold px-8 py-4 rounded-xl transition-smooth"
              })}
            >
              Get Results Like These
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CaseStudyGallery;
