import Header from "@/components/landing/Header";
import HeroManifesto from "@/components/landing/HeroManifesto";
import NavigationCards from "@/components/landing/NavigationCards";
import SystemTicker from "@/components/landing/SystemTicker";

export default function Home() {
  return (
    <div className="min-h-screen bg-paper bg-grid flex flex-col text-carbon relative">
      <div className="w-full bg-carbon text-paper border-b border-carbon">
        <div className="container mx-auto px-4 py-2">
          <p className="text-center text-[10px] font-mono tracking-[0.2em] uppercase font-bold text-paper/80">
            MYSTIC MAITRI | BRAINWARE AI HACKATHON 2026 | POWERED BY AZURE + GEMINI
          </p>
        </div>
      </div>
      <Header />

      <main className="flex-grow grid grid-cols-12 gap-0 border-b border-carbon">
        <div className="col-span-12 lg:col-span-8">
          <HeroManifesto />
        </div>

        <div className="col-span-12 lg:col-span-4 border-t lg:border-t-0 border-carbon">
          <NavigationCards />
        </div>
      </main>

      {/* Padding space for ticker */}
      <div className="h-10"></div>

      <SystemTicker />
    </div>
  );
}
