"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function AIAssistantDemo() {
  return (
    <section className="w-full max-w-7xl mx-auto px-6 py-32 z-10 relative flex flex-col lg:flex-row items-center justify-between">
      
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="w-full lg:w-1/2 mb-16 lg:mb-0 pr-0 lg:pr-12"
      >
        <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-md">
          <span className="text-sm font-medium text-purple-300 uppercase tracking-wider">Meet Your AI Co-Pilot</span>
        </div>
        <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
          Learning, <br/> Supercharged by <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
            Artificial Intelligence
          </span>
        </h2>
        <p className="text-slate-400 text-lg max-w-lg mb-8 leading-relaxed">
          Provide your students with an always-on AI Tutor. It summarizes lessons, answers complex questions based on your course material, and provides interactive quizzes on the fly.
        </p>
        
        <ul className="space-y-4">
          {['Context-aware responses', 'Instant lesson summaries', 'Automated knowledge checks'].map((item, idx) => (
            <motion.li 
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 + (idx * 0.1), duration: 0.5 }}
              className="flex items-center text-slate-300"
            >
              <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center mr-4">
                <div className="w-2 h-2 rounded-full bg-purple-400" />
              </div>
              {item}
            </motion.li>
          ))}
        </ul>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
        whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1, ease: "easeOut" }}
        style={{ perspective: "1000px" }}
        className="w-full lg:w-1/2 relative flex justify-center items-center"
      >
        <div className="absolute inset-0 bg-purple-500/20 blur-[120px] rounded-full -z-10" />
        <div className="relative w-full max-w-md aspect-[4/5] rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(167,139,250,0.3)] border border-white/10 transform-gpu">
          <Image 
            src="/promo-assets/ai_tutor.png" 
            alt="AI Tutor Interface" 
            fill 
            className="object-cover"
          />
        </div>
      </motion.div>
    </section>
  );
}
