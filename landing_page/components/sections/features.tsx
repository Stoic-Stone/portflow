"use client";

import { motion } from "framer-motion";
import { Wifi, LayoutDashboard, Cog, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

const FeatureCard = ({ icon, title, description, delay }: FeatureCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      className="bg-white rounded-2xl shadow-md p-8 border border-gray-100 hover:shadow-lg transition-all duration-300"
    >
      <div className="rounded-full bg-[#f4ebdc] p-4 inline-flex items-center justify-center mb-6">
        <div className="text-[#002c5f]">{icon}</div>
      </div>
      <h3 className="text-xl font-bold font-space-grotesk mb-3 text-[#002c5f]">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
};

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-[#f8f9fa]">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold font-space-grotesk text-[#002c5f] mb-4">
            Fonctionnalités Clés
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            PortFlow vous offre un ensemble complet d'outils pour optimiser la gestion de votre port.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FeatureCard 
            icon={<Wifi size={28} />}
            title="Suivi en temps réel"
            description="Surveillez tous les mouvements et opérations portuaires en temps réel. Notre technologie de pointe permet une visibilité complète sur toutes les activités."
            delay={0.1}
          />
          
          <FeatureCard 
            icon={<LayoutDashboard size={28} />}
            title="Tableaux de bord personnalisés"
            description="Créez et personnalisez des tableaux de bord adaptés à vos besoins spécifiques. Visualisez les données qui comptent le plus pour votre rôle."
            delay={0.2}
          />
          
          <FeatureCard 
            icon={<Cog size={28} />}
            title="Gestion des ressources portuaires"
            description="Gérez efficacement les grues, navires et conteneurs. Optimisez l'allocation des ressources pour une efficacité maximale des opérations."
            delay={0.3}
          />
          
          <FeatureCard 
            icon={<Shield size={28} />}
            title="Sécurité & accès par rôle"
            description="Un système d'accès robuste basé sur les rôles garantit que chaque utilisateur n'a accès qu'aux informations et fonctions pertinentes pour son travail."
            delay={0.4}
          />
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;