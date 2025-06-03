"use client";

import { motion } from "framer-motion";
import { 
  Thermometer, 
  Ship, 
  Anchor, 
  Package, 
  Clock, 
  Cloud
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Stat Card Component
interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  description?: string;
  color: string;
  delay: number;
}

const StatCard = ({ icon, title, value, description, color, delay }: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
    >
      <Card className={cn(
        "relative overflow-hidden p-6 h-full transition-all duration-300",
        "hover:shadow-lg hover:-translate-y-1"
      )}>
        <div className={cn(
          "absolute top-0 left-0 h-1 w-full",
          color
        )} />
        
        <div className="flex items-start gap-4">
          <div className={cn(
            "p-3 rounded-full",
            color.replace("bg-", "bg-opacity-10 text-")
          )}>
            {icon}
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <p className="text-2xl font-semibold font-space-grotesk">{value}</p>
            {description && (
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

const StatsSection = () => {
  return (
    <section id="stats" className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold font-space-grotesk text-[#002c5f] mb-4">
            Tableau de bord en temps réel
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Visualisez l'état actuel des opérations portuaires de Nador avec notre système de suivi en temps réel.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard 
            icon={<Thermometer size={24} />} 
            title="Température" 
            value="24.47°C" 
            description="Température actuelle du terminal"
            color="bg-[#FF6B6B]"
            delay={0.1}
          />
          
          <StatCard 
            icon={<Ship size={24} />} 
            title="Navires" 
            value="3/5" 
            description="Navires actuellement à quai"
            color="bg-[#002c5f]"
            delay={0.2}
          />
          
          <StatCard 
            icon={<Anchor size={24} />} 
            title="Grues" 
            value="6/8" 
            description="Grues actives"
            color="bg-[#FF9E2C]"
            delay={0.3}
          />
          
          <StatCard 
            icon={<Package size={24} />} 
            title="Conteneurs" 
            value="142/200" 
            description="Conteneurs traités"
            color="bg-[#4ECDC4]"
            delay={0.4}
          />
          
          <StatCard 
            icon={<Clock size={24} />} 
            title="Marée" 
            value="Prochaine : 14h37" 
            description="Synchronisation Tide API"
            color="bg-[#1A535C]"
            delay={0.5}
          />
          
          <StatCard 
            icon={<Cloud size={24} />} 
            title="Météo" 
            value="Nuageux" 
            description="Localisé via OpenMeteo"
            color="bg-[#7768AE]"
            delay={0.6}
          />
        </div>
      </div>
    </section>
  );
};

export default StatsSection;