"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Server, Users, Award, ShieldCheck } from "lucide-react";

const features = [
  {
    title: "Multi-Tenant Architecture",
    description: "Scale your B2B offerings with isolated databases and custom branding per tenant.",
    icon: Server,
    colSpan: "lg:col-span-2",
  },
  {
    title: "Integrated Community",
    description: "Built-in forums, comments, and live cohort RSVPs.",
    icon: Users,
    colSpan: "lg:col-span-1",
  },
  {
    title: "Advanced Gamification",
    description: "Streaks, points, and automated certificate generation.",
    icon: Award,
    colSpan: "lg:col-span-1",
  },
  {
    title: "Zero Transaction Tax",
    description: "Keep 100% of your revenue with direct Stripe & PayPal integrations.",
    icon: ShieldCheck,
    colSpan: "lg:col-span-2",
  },
];

export default function FeaturesShowcase() {
  return (
    <section className="w-full max-w-7xl mx-auto px-6 py-32 z-10 relative">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="text-center mb-20"
      >
        <h2 className="text-4xl lg:text-5xl font-bold mb-6">Designed for <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Scale</span></h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">Everything you need to run a professional academy, packaged into a gorgeous, high-performance ecosystem.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        {features.map((feature, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: idx * 0.1 }}
            className={`relative p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden group hover:border-indigo-500/30 transition-colors ${feature.colSpan}`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-indigo-500/20 transition-colors" />
            <feature.icon className="w-10 h-10 text-indigo-400 mb-6" />
            <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
            <p className="text-slate-400">{feature.description}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="w-full relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden p-4 lg:p-12 mt-12 shadow-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent opacity-50" />
        <div className="relative w-full aspect-[16/9] lg:aspect-[21/9] rounded-xl overflow-hidden border border-white/5">
          <Image 
            src="/promo-assets/dashboard.png" 
            alt="SaaS Dashboard Mockup" 
            fill 
            className="object-cover object-center"
          />
        </div>
      </motion.div>
    </section>
  );
}
