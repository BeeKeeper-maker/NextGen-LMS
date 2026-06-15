export default function PromoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // We use dark mode explicitly for the promo page to keep it cinematic
  return (
    <div className="dark bg-black text-white min-h-screen selection:bg-purple-600 selection:text-white font-sans overflow-x-hidden">
      {children}
    </div>
  );
}
