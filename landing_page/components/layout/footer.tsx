import Link from "next/link";
import { Anchor, Ship, Star, Users, LogIn } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-[#002c5f] text-white pt-0 pb-10 relative overflow-hidden">
      {/* Decorative Wave */}
      <div className="absolute top-0 left-0 w-full -translate-y-full pointer-events-none select-none">
        <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-20">
          <path d="M0,80 Q360,0 720,80 T1440,80 V100 H0 Z" fill="#f4ebdc" />
        </svg>
      </div>
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 py-12">
          <div className="space-y-4 flex flex-col justify-center">
            <div className="flex items-center space-x-2">
              <Anchor size={32} strokeWidth={2.5} className="text-orange-500" />
              <span className="font-space-grotesk font-bold text-2xl tracking-tight">PortFlow</span>
            </div>
            <p className="text-white/80 max-w-xs text-base">
              Suivi intelligent, en temps réel et localisé du terminal maritime de Nador.
            </p>
          </div>
          <div className="md:col-span-2 flex flex-col justify-center">
            <h3 className="font-semibold text-lg mb-6 font-space-grotesk tracking-wide text-orange-400 uppercase">Liens Rapides</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Link href="#features" className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-orange-500/10 transition">
                <Ship size={28} className="text-orange-400 group-hover:text-orange-500 transition" />
                <span className="font-medium group-hover:text-orange-400 transition">Fonctionnalités</span>
              </Link>
              <Link href="#advantages" className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-orange-500/10 transition">
                <Star size={28} className="text-orange-400 group-hover:text-orange-500 transition" />
                <span className="font-medium group-hover:text-orange-400 transition">Avantages</span>
              </Link>
              <Link href="#testimonials" className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-orange-500/10 transition">
                <Users size={28} className="text-orange-400 group-hover:text-orange-500 transition" />
                <span className="font-medium group-hover:text-orange-400 transition">Témoignages</span>
              </Link>
              <a href="http://localhost:5173/login" className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-orange-500/10 transition">
                <LogIn size={28} className="text-orange-400 group-hover:text-orange-500 transition" />
                <span className="font-medium group-hover:text-orange-400 transition">Se connecter</span>
              </a>
            </div>
          </div>
        </div>
        <Separator className="my-8 bg-white/20" />
        <div className="flex flex-col md:flex-row items-center justify-between text-white/60 text-sm">
          <p>© {currentYear} PortFlow - Tous droits réservés</p>
          <p className="mt-2 md:mt-0">Système de gestion portuaire | Port de Nador, Maroc</p>
          <span className="md:absolute right-8 bottom-4 text-xs text-orange-300 font-semibold tracking-wide">Made for Nador Port</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;