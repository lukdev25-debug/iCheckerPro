import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ModelsSection from '../components/ModelsSection';
import PricingSection from '../components/PricingSection';
import RootCheckSection from '../components/RootCheckSection';
import BulkSection from '../components/BulkSection';
import WhyUsSection from '../components/WhyUsSection';
import FAQSection from '../components/FAQSection';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';

export default function LandingPage({ onGetStarted, isLoggedIn }: { onGetStarted: () => void; isLoggedIn?: boolean }) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <Navbar onGetStarted={onGetStarted} isLoggedIn={isLoggedIn} />
      <main>
        <Hero onGetStarted={onGetStarted} />
        <ModelsSection />
        <PricingSection onGetStarted={onGetStarted} />
        <RootCheckSection onGetStarted={onGetStarted} />
        <BulkSection onGetStarted={onGetStarted} />
        <WhyUsSection />
        <FAQSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
