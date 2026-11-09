import { useCallback, useEffect, useState } from "react";
import { AdminApp } from "@/admin/AdminApp";
import { Header, ScrollProgress, SiteMenu } from "@/components/Chrome";
import { Cursor, Intro } from "@/components/Motion";
import { PinnedStage } from "@/components/Primitives";
import { StickyCta } from "@/components/StickyCta";
import { siteConfig } from "@/config/site";
import { DEFAULT_PACKAGES } from "@/data/packages";
import { track } from "@/lib/analytics";
import { fetchPublicConfig } from "@/lib/api";
import { scrollToSection, useReducedMotion, useSmoothScroll } from "@/lib/hooks";
import { Audience } from "@/sections/Audience";
import { BookingWizard } from "@/sections/BookingWizard";
import { Contact } from "@/sections/Contact";
import { Ecosystem, Perspectives, Values } from "@/sections/Ecosystem";
import { Faq } from "@/sections/Faq";
import { Footer } from "@/sections/Footer";
import { Hero } from "@/sections/Hero";
import { LivePreview } from "@/sections/LivePreview";
import { Pricing } from "@/sections/Pricing";
import { Process } from "@/sections/Process";
import { Services } from "@/sections/Services";
import { UpcomingSchedule } from "@/sections/UpcomingSchedule";
import { Voices } from "@/sections/Voices";
import type { CommercialPackage, ParticipationMode, PublicUpcomingLive } from "@/types/booking";

function isInitialAdminRoute(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.location.pathname.startsWith("/admin") ||
    new URLSearchParams(window.location.search).get("admin") === "1"
  );
}

export default function App() {
  const [adminView, setAdminView] = useState<boolean>(isInitialAdminRoute);
  const reducedMotion = useReducedMotion();
  useSmoothScroll(!reducedMotion && !adminView);

  const [menuOpen, setMenuOpen] = useState(false);
  const [lookupOpen, setLookupOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState<ParticipationMode>("presentiel");
  const [selectedPackageId, setSelectedPackageId] = useState<string>("business");

  const [packages, setPackages] = useState<CommercialPackage[]>(DEFAULT_PACKAGES);
  const [upcomingLives, setUpcomingLives] = useState<PublicUpcomingLive[]>([]);
  const [launchDate, setLaunchDate] = useState<string>("2026-12-01");
  const [studioName, setStudioName] = useState<string>(siteConfig.studio.name);
  const [whatsappNumber, setWhatsappNumber] = useState<string>(siteConfig.contacts.whatsapp);

  const refreshPublicConfig = useCallback(() => {
    fetchPublicConfig()
      .then((res) => {
        if (res.packages && res.packages.length > 0) {
          setPackages(res.packages);
        }
        if (res.upcomingLives) {
          setUpcomingLives(res.upcomingLives);
        }
        if (res.settings) {
          setLaunchDate(res.settings.launchDate);
          setStudioName(res.settings.studioName);
          setWhatsappNumber(res.settings.whatsappNumber);
        }
      })
      .catch(() => {
        /* Repli transparent sur DEFAULT_PACKAGES */
      });
  }, []);

  useEffect(() => {
    refreshPublicConfig();
  }, [refreshPublicConfig]);

  useEffect(() => {
    const onPopState = () => {
      setAdminView(isInitialAdminRoute());
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const openAdmin = useCallback(() => {
    window.history.pushState({}, "", "/admin");
    window.scrollTo(0, 0);
    setAdminView(true);
  }, []);

  const closeAdmin = useCallback(() => {
    window.history.pushState({}, "", "/");
    setAdminView(false);
    refreshPublicConfig();
  }, [refreshPublicConfig]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const handleChooseModeFromHero = (mode: ParticipationMode) => {
    setSelectedMode(mode);
    track("mode_select", { mode });
    requestAnimationFrame(() => scrollToSection("reservation"));
  };

  const handleSelectPackageFromGrid = (pkgId: string) => {
    setSelectedPackageId(pkgId);
    track("package_select", { pkgId });
    requestAnimationFrame(() => scrollToSection("reservation"));
  };

  if (adminView) {
    return <AdminApp onBackToSite={closeAdmin} />;
  }

  return (
    <div id="top" className="bg-paper text-ink">
      <a
        href="#participation"
        className="skip-link"
        onClick={(event) => {
          event.preventDefault();
          scrollToSection("participation");
        }}
      >
        Aller au contenu
      </a>
      <Intro />
      <Cursor />
      <ScrollProgress />
      <Header
        menuOpen={menuOpen}
        onToggleMenu={() => setMenuOpen((open) => !open)}
        onOpenLookup={() => setLookupOpen(true)}
        onOpenAdmin={openAdmin}
      />
      <SiteMenu
        open={menuOpen}
        onClose={closeMenu}
        onOpenLookup={() => setLookupOpen(true)}
        onOpenAdmin={openAdmin}
      />

      <main>
        <Hero
          selectedMode={selectedMode}
          onSelectMode={handleChooseModeFromHero}
          onOpenLookup={() => setLookupOpen(true)}
        />

        <BookingWizard
          packages={packages}
          launchDate={launchDate}
          studioName={studioName}
          whatsappNumber={whatsappNumber}
          selectedMode={selectedMode}
          onModeChange={setSelectedMode}
          selectedPackageId={selectedPackageId}
          onPackageChange={setSelectedPackageId}
          lookupOpen={lookupOpen}
          onCloseLookup={() => setLookupOpen(false)}
          onOpenLookup={() => setLookupOpen(true)}
        />

        <UpcomingSchedule upcomingLives={upcomingLives} studioName={studioName} />

        <Pricing
          packages={packages}
          selected={selectedPackageId}
          onSelect={handleSelectPackageFromGrid}
        />

        <div className="stage-group">
          <PinnedStage
            src="/images/sector-tech.jpg"
            position="center 8%"
            alt="Entrepreneur présentant un smartphone en boutique, photographie d'illustration"
            lines={["Présentez.", "Échangez.", ["Rayonnez.", "text-accent"]]}
          />
          <Services />
        </div>

        <LivePreview />
        <Audience />
        <Process />
        <Values />
        <Ecosystem />
        <Perspectives />
        <Voices />
        <Faq />
        <Contact onOpenLookup={() => setLookupOpen(true)} />
      </main>
      <Footer onOpenAdmin={openAdmin} />
      <StickyCta packages={packages} selectedPackageId={selectedPackageId} />
    </div>
  );
}
