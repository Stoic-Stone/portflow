import Link from "next/link";
import { Anchor } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-[#002c5f] text-white py-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Anchor size={28} strokeWidth={2.5} />
              <span className="font-space-grotesk font-bold text-2xl">PortFlow</span>
            </div>
            <p className="text-white/80 max-w-xs">
              Suivi intelligent, en temps réel et localisé du terminal maritime de Nador.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4 font-space-grotesk">Liens Rapides</h3>
            <ul className="space-y-2">
              <li><Link href="#features" className="hover:text-white/80 transition">Fonctionnalités</Link></li>
              <li><Link href="#advantages" className="hover:text-white/80 transition">Avantages</Link></li>
              <li><Link href="#testimonials" className="hover:text-white/80 transition">Témoignages</Link></li>
              <li><Link href="/login" className="hover:text-white/80 transition">Se connecter</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4 font-space-grotesk">Support</h3>
            <ul className="space-y-2">
              <li><Link href="/faq" className="hover:text-white/80 transition">FAQ</Link></li>
              <li><Link href="/guide" className="hover:text-white/80 transition">Guide d'utilisation</Link></li>
              <li><Link href="#contact" className="hover:text-white/80 transition">Nous contacter</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4 font-space-grotesk">Légal</h3>
            <ul className="space-y-2">
              <li><Link href="/mentions-legales" className="hover:text-white/80 transition">Mentions légales</Link></li>
              <li><Link href="/confidentialite" className="hover:text-white/80 transition">Politique de confidentialité</Link></li>
              <li><Link href="/cgv" className="hover:text-white/80 transition">CGV</Link></li>
            </ul>
          </div>
        </div>
        
        <Separator className="my-8 bg-white/20" />
        
        <div className="flex flex-col md:flex-row items-center justify-between text-white/60 text-sm">
          <p>© {currentYear} PortFlow - Tous droits réservés</p>
          <p className="mt-2 md:mt-0">Système de gestion portuaire | Port de Nador, Maroc</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;