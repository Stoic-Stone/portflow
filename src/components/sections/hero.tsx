"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, AnchorIcon, Ship, LogIn } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

const WaveAnimation = () => (
  <div className="absolute bottom-0 left-0 w-full opacity-30 pointer-events-none">
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 1440 320"
      className="w-full h-auto"
    >
      <motion.path 
        fill="#0099ff" 
        fillOpacity="1" 
        d="M0,256L48,240C96,224,192,192,288,181.3C384,171,480,181,576,197.3C672,213,768,235,864,229.3C960,224,1056,192,1152,181.3C1248,171,1344,181,1392,186.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        initial={{ y: 0 }}
        animate={{ y: [0, -10, 0] }}
        transition={{ 
          duration: 5, 
          repeat: Infinity, 
          ease: "easeInOut"
        }}
      />
    </svg>
  </div>
);

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#f4ebdc]/30">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div className="relative w-full h-full">
          <Image
            src="https://images.pexels.com/photos/1554646/pexels-photo-1554646.jpeg"
            alt="Port de Nador"
            fill
            className="object-cover opacity-10"
            priority
          />
        </div>
      </div>
      
      <WaveAnimation />

      <div className="container mx-auto px-4 md:px-6 pt-24 pb-16 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-xl"
          >
            <h1 className="font-space-grotesk font-bold text-4xl md:text-6xl tracking-tight text-[#002c5f] leading-tight mb-6">
              PortFlow – Le futur de la gestion portuaire à Nador
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-8">
              Suivi intelligent, en temps réel et localisé du terminal maritime de Nador. Optimisez vos opérations portuaires grâce à notre plateforme intégrée.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-[#002c5f] hover:bg-[#002c5f]/90 text-white font-medium rounded-full px-8">
                <Link href="#features">
                  <Ship className="mr-2 h-5 w-5" />
                  Découvrir le système
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-[#002c5f] text-[#002c5f] hover:bg-[#002c5f]/10 font-medium rounded-full px-8">
                <Link href="/login">
                  <LogIn className="mr-2 h-5 w-5" />
                  Se connecter
                </Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-xl"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <svg 
                width="100%" 
                height="100%" 
                viewBox="0 0 800 600" 
                xmlns="http://www.w3.org/2000/svg"
                className="p-4"
              >
                {/* Simple port illustration */}
                <rect x="0" y="400" width="800" height="200" fill="#0d3b66" />
                <rect x="50" y="350" width="700" height="50" fill="#415a77" />
                
                {/* Containers */}
                <motion.g
                  initial={{ y: 10 }}
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
                >
                  <rect x="100" y="280" width="60" height="70" fill="#e63946" />
                  <rect x="180" y="280" width="60" height="70" fill="#f4a261" />
                  <rect x="260" y="280" width="60" height="70" fill="#2a9d8f" />
                  <rect x="340" y="280" width="60" height="70" fill="#e76f51" />
                </motion.g>
                
                {/* Crane */}
                <motion.g
                  initial={{ rotate: 0 }}
                  animate={{ rotate: [-2, 2, -2] }}
                  transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
                >
                  <rect x="500" y="150" width="20" height="250" fill="#333" />
                  <rect x="400" y="150" width="200" height="20" fill="#333" />
                  <rect x="400" y="130" width="20" height="40" fill="#333" />
                  <line x1="420" y1="170" x2="500" y2="200" stroke="#333" strokeWidth="5" />
                </motion.g>
                
                {/* Ship */}
                <motion.g
                  initial={{ x: -100 }}
                  animate={{ x: 800 }}
                  transition={{ duration: 30, repeat: Infinity, repeatType: "loop" }}
                >
                  <path d="M50,400 L100,350 L200,350 L220,400 Z" fill="#264653" />
                  <rect x="120" y="320" width="60" height="30" fill="#264653" />
                </motion.g>
                
                {/* Water animation */}
                <motion.path 
                  d="M0,430 Q200,410 400,430 Q600,450 800,430 L800,600 L0,600 Z" 
                  fill="#219ebc"
                  initial={{ y: 0 }}
                  animate={{ y: [0, 5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
                />
              </svg>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;