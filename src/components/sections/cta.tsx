"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Phone, MessageSquare } from "lucide-react";
import Link from "next/link";

const CtaSection = () => {
  return (
    <section id="contact" className="py-24 bg-[#002c5f]">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center text-white"
        >
          <h2 className="text-3xl md:text-4xl font-bold font-space-grotesk mb-6">
            Prêt à optimiser vos opérations portuaires ?
          </h2>
          <p className="text-lg text-white/80 mb-10">
            Découvrez comment PortFlow peut transformer la gestion de vos infrastructures et apporter une nouvelle dimension d'efficacité à vos opérations quotidiennes.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" className="bg-white text-[#002c5f] hover:bg-white/90 rounded-full px-8">
              <Link href="/demo">
                <Phone className="mr-2 h-5 w-5" />
                Demander une démo
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10 rounded-full px-8">
              <Link href="/contact">
                <MessageSquare className="mr-2 h-5 w-5" />
                Nous contacter
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CtaSection;