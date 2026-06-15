import HeroSection from "@/components/promo/HeroSection";
import FeaturesShowcase from "@/components/promo/FeaturesShowcase";
import AIAssistantDemo from "@/components/promo/AIAssistantDemo";
import CTASection from "@/components/promo/CTASection";

export const metadata = {
  title: "NextGen LMS | The Ultimate Learning Ecosystem",
  description: "Experience the future of learning with our AI-powered, multi-tenant LMS ecosystem.",
};

export default function PromoPage() {
  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen bg-black overflow-hidden">
      {/* Cinematic Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/30 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[150px] rounded-full pointer-events-none" />
      
      <HeroSection />
      <FeaturesShowcase />
      <AIAssistantDemo />
      <CTASection />
    </main>
  );
}
