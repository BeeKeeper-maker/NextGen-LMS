"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  return (
    <section className="relative w-full max-w-7xl mx-auto px-6 pt-32 pb-20 lg:pt-48 lg:pb-32 flex flex-col-reverse lg:flex-row items-center justify-between z-10 min-h-[90vh]">
      
      {/* Text Content */}
      <motion.div 
        className="w-full lg:w-1/2 flex flex-col items-start mt-12 lg:mt-0"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="inline-block mb-6 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 backdrop-blur-md">
          <span className="text-sm font-medium text-indigo-300 uppercase tracking-wider">Meet the Future of Learning</span>
        </motion.div>
        
        <motion.h1 variants={itemVariants} className="text-5xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight">
          The Ultimate <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            NextGen LMS
          </span> <br/>
          Ecosystem
        </motion.h1>
        
        <motion.p variants={itemVariants} className="text-lg text-slate-400 max-w-xl mb-10 leading-relaxed">
          AI-Powered Architecture. Integrated Communities. Zero Transaction Taxation. Build, teach, and scale your academy globally with a true $10k-value platform.
        </motion.p>
        
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
          <button className="group relative px-8 py-4 bg-white text-black rounded-full font-semibold overflow-hidden shadow-[0_0_40px_rgba(167,139,250,0.3)] hover:shadow-[0_0_60px_rgba(167,139,250,0.5)] transition-all duration-300">
            <span className="relative z-10 flex items-center gap-2">
              Launch Your Academy <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
          <button className="px-8 py-4 rounded-full font-semibold border border-white/10 hover:bg-white/5 transition-colors">
            View Live Demo
          </button>
        </motion.div>
      </motion.div>

      {/* Floating 3D Image */}
      <motion.div 
        className="w-full lg:w-1/2 relative flex justify-center items-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          className="relative w-full max-w-lg aspect-square"
        >
          <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-[100px] -z-10" />
          <Image 
            src="/promo-assets/hero_3d.png" 
            alt="3D Abstract Hero" 
            fill 
            className="object-contain drop-shadow-[0_0_30px_rgba(167,139,250,0.4)]"
            priority
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
