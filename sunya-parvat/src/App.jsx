import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import Nav from './components/Nav';
import Footer from './components/Footer';

import Home from './pages/Home';
import Journeys from './pages/Journeys';
import JourneyDetail from './pages/JourneyDetail';
import Stories from './pages/Stories';
import StoryDetail from './pages/StoryDetail';
import About from './pages/About';
import BeforeYouGo from './pages/BeforeYouGo';
import Connect from './pages/Connect';
import NotFound from './pages/NotFound';

import './styles/global.css';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
};

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="enter"
        exit="exit"
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/journeys" element={<Journeys />} />
          <Route path="/journeys/:id" element={<JourneyDetail />} />
          <Route path="/stories" element={<Stories />} />
          <Route path="/stories/:id" element={<StoryDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/before-you-go" element={<BeforeYouGo />} />
          <Route path="/connect" element={<Connect />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Nav />
      <AnimatedRoutes />
      <Footer />
    </BrowserRouter>
  );
}
