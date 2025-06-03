"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Testimonial {
  id: number;
  quote: string;
  author: string;
  role: string;
  image: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    quote: "PortFlow a révolutionné notre gestion quotidienne. Nous gagnons un temps précieux sur chaque opération.",
    author: "Mohammed Benali",
    role: "Chef de quai, Port de Nador",
    image: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150"
  },
  {
    id: 2,
    quote: "L'interface intuitive et les données en temps réel nous permettent de prendre des décisions plus rapides et mieux informées.",
    author: "Amina Farid",
    role: "Responsable logistique",
    image: "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150"
  },
  {
    id: 3,
    quote: "L'intégration avec nos systèmes existants s'est faite sans accroc. Un vrai gain d'efficacité pour toute l'équipe.",
    author: "Karim El Mansouri",
    role: "Directeur des opérations maritimes",
    image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150"
  }
];

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Auto-advancing testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };
  
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };
  
  return (
    <section id="testimonials" className="py-24 bg-[#f4ebdc]/40">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold font-space-grotesk text-[#002c5f] mb-4">
            Ce que disent nos utilisateurs
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez comment PortFlow transforme le quotidien des professionnels du port de Nador.
          </p>
        </motion.div>
        
        <div className="relative max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-8 md:p-12 rounded-2xl shadow-lg"
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-6 text-[#002c5f]">
                  <Quote size={48} />
                </div>
                
                <p className="text-xl md:text-2xl italic text-gray-700 mb-8">
                  "{testimonials[currentIndex].quote}"
                </p>
                
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full overflow-hidden mb-4">
                    <img 
                      src={testimonials[currentIndex].image}
                      alt={testimonials[currentIndex].author}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="font-bold text-lg text-[#002c5f]">
                    {testimonials[currentIndex].author}
                  </h4>
                  <p className="text-gray-600">
                    {testimonials[currentIndex].role}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "w-3 h-3 rounded-full transition-all duration-300",
                  index === currentIndex ? "bg-[#002c5f]" : "bg-gray-300"
                )}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
          
          <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-12 hidden md:block">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrev}
              className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
            >
              <ChevronLeft className="h-6 w-6" />
              <span className="sr-only">Previous testimonial</span>
            </Button>
          </div>
          
          <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-12 hidden md:block">
            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
            >
              <ChevronRight className="h-6 w-6" />
              <span className="sr-only">Next testimonial</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;