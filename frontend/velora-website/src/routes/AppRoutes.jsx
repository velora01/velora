import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";

import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";

import Home from "../pages/Home";
import About from "../pages/About";
import Projects from "../pages/Projects";
import Contact from "../pages/Contact";
import ConsultationSection from "../pages/ConsultationSection";
import Guide from "../pages/Guide";
import Gallery from "../pages/Gallery";
import Offering from "../pages/Offering";
import More from "../pages/More";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
};

const AppRoutes = () => {
  return (
    <>
      <Navbar className="nav" />
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/consultation" element={<ConsultationSection/>} />
        <Route path="/about" element={<About />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/guide" element={<Guide />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/more" element={<More />} />
        <Route path="/offering" element={<Offering />} />
      </Routes>

      <Footer />
    </>
  );
};

export default AppRoutes;

