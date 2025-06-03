"use client";

import { motion } from "framer-motion";
import { Rocket, Globe, Link } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdvantageCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}

const AdvantageCard = ({ icon, title, description, index }: AdvantageCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 * index }}
      viewport={{ once: true }}
      className="flex flex-col items-center text-center"
    >
      <div className="mb-6 rounded-full bg-[#002c5f]/10 p-4 text-[#002c5f]">
        {icon}
      </div>
      <h3 className="text-xl font-bold font-space-grotesk mb-3 text-[#002c5f]">{title}</h3>
      <p className="text-gray-600 max-w-sm">{description}</p>
    </motion.div>
  );
};

const AdvantagesSection = () => {
  const advantages = [
    {
      icon: <Rocket size={32} />,
      title: "Efficacité opérationnelle",
      description:
        "Réduisez les temps d'attente, optimisez les ressources et augmentez la productivité. PortFlow permet une gestion optimale des opérations portuaires."
    },
    {
      icon: <Globe size={32} />,
      title: "Adapté au Maroc",
      description:
        "Développé spécifiquement pour le contexte marocain, PortFlow s'intègre parfaitement aux exigences et réglementations locales du port de Nador."
    },
    {
      icon: <Link size={32} />,
      title: "Connecté aux systèmes tiers",
      description:
        "Intégration transparente avec les services de douane, météo et marée. PortFlow communique avec tous vos systèmes existants pour une information centralisée."
    }
  ];

  return (
    <section id="advantages" className="py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold font-space-grotesk text-[#002c5f] mb-4">
            Avantages Stratégiques
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez comment PortFlow transforme la gestion portuaire à Nador en offrant des avantages tangibles.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {advantages.map((advantage, index) => (
            <AdvantageCard
              key={index}
              icon={advantage.icon}
              title={advantage.title}
              description={advantage.description}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AdvantagesSection;