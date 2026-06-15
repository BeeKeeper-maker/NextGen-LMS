"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
  return (
    <section className="w-full max-w-5xl mx-auto px-6 py-32 z-10 relative mb-20">
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative rounded-3xl overflow-hidden border border-white/10 bg-black/50 backdrop-blur-xl p-12 lg:p-20 text-center shadow-[0_0_80px_rgba(99,102,241,0.2)]"
      >
        {/* Animated Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-1/2 bg-indigo-500/30 blur-[100px] rounded-full -z-10 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-purple-500/20 blur-[100px] rounded-full -z-10 pointer-events-none" />

        <h2 className="text-4xl lg:text-6xl font-bold mb-6 text-white">
          Ready to Build Your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400">
            Next-Gen Academy?
          </span>
        </h2>
        
        <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10">
          Join thousands of creators, educators, and enterprises who are scaling their knowledge business with zero transaction fees.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="w-full sm:w-auto px-10 py-5 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-transform duration-300 shadow-[0_0_30px_rgba(255,255,255,0.3)] flex items-center justify-center gap-2 group">
            Get Started Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="w-full sm:w-auto px-10 py-5 bg-transparent border border-white/20 text-white rounded-full font-bold text-lg hover:bg-white/10 transition-colors duration-300">
            Talk to Sales
          </button>
        </div>
      </motion.div>
    </section>
  );
}
