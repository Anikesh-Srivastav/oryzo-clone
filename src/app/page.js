import { Hero } from "@/components/Hero";
import { HorizontalGallery } from "@/components/HorizontalGallery";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen bg-black overflow-hidden relative">
      <Hero />
      <HorizontalGallery />
    </main>
  );
}
