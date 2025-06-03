"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Anchor, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4",
        isScrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Anchor
              size={32}
              className="text-[#002c5f]"
              strokeWidth={2.5}
            />
            <span className="font-space-grotesk font-bold text-2xl text-[#002c5f]">
              PortFlow
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="#features"
              className="text-[#002c5f] hover:text-[#002c5f]/80 font-medium transition"
            >
              Fonctionnalités
            </Link>
            <Link
              href="#advantages"
              className="text-[#002c5f] hover:text-[#002c5f]/80 font-medium transition"
            >
              Avantages
            </Link>
            <Link
              href="#testimonials"
              className="text-[#002c5f] hover:text-[#002c5f]/80 font-medium transition"
            >
              Témoignages
            </Link>
            <Button
              asChild
              variant="outline"
              className="border-[#002c5f] text-[#002c5f] hover:bg-[#002c5f]/10"
            >
              <Link href="#contact">Nous contacter</Link>
            </Button>
            <Button
              asChild
              className="bg-[#002c5f] hover:bg-[#002c5f]/90 text-white"
            >
              <Link href="/login">Se connecter</Link>
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-[#002c5f]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X size={24} />
            ) : (
              <Menu size={24} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden bg-white absolute top-full left-0 w-full shadow-md py-4 px-6"
        >
          <nav className="flex flex-col space-y-4">
            <Link
              href="#features"
              className="text-[#002c5f] font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Fonctionnalités
            </Link>
            <Link
              href="#advantages"
              className="text-[#002c5f] font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Avantages
            </Link>
            <Link
              href="#testimonials"
              className="text-[#002c5f] font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Témoignages
            </Link>
            <Link
              href="#contact"
              className="text-[#002c5f] font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Nous contacter
            </Link>
            <Button
              asChild
              className="bg-[#002c5f] hover:bg-[#002c5f]/90 text-white w-full"
            >
              <Link href="/login">Se connecter</Link>
            </Button>
          </nav>
        </motion.div>
      )}
    </header>
  );
};

export default Header;