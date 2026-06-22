import Nav from"@/components/Nav";
import { MotionProvider } from"@/components/motion/MotionProvider";
import { Hero } from"@/components/landing/Hero";
import { FeatureGrid, HowItWorks, CtaBand, Footer } from"@/components/landing/Sections";

export default function LandingPage() {
 return (
 <MotionProvider>
 <main className="min-h-screen">
 <Nav />
 <Hero />
 <FeatureGrid />
 <HowItWorks />
 <CtaBand />
 <Footer />
 </main>
 </MotionProvider>
 );
}
