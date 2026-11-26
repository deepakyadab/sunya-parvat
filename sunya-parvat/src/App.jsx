import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';

import { LanguageProvider } from './i18n';
import { SavedProvider } from './context/SavedContext';
import Nav from './components/Nav';
import Footer from './components/Footer';
import CompareTray from './components/CompareTray';
import AskSunyaWidget, { AskProvider } from './components/AskSunya';

import Home from './pages/Home';
import Treks from './pages/Treks';
import TrekDetail from './pages/TrekDetail';
import Compare from './pages/Compare';
import Journal from './pages/Journal';
import Article from './pages/Article';
import Ask from './pages/Ask';
import About from './pages/About';
import BeforeYouGo from './pages/BeforeYouGo';
import Connect from './pages/Connect';
import NotFound from './pages/NotFound';
import Credits from './pages/Credits';

// The editor exists only in development builds (`npm start`).
// In `npm run build` this condition is false and the editor code is not bundled.
const Editor = process.env.NODE_ENV === 'development' ? lazy(() => import('./pages/Editor')) : null;

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el) { el.scrollIntoView(); return; }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

/* Each new page settles in (motion only; see styles/motion.css). Keyed by path,
   so filter or language changes on the same page do not replay it. */
function PageFrame({ children }) {
  const { pathname } = useLocation();
  return <div key={pathname} className="sp-page">{children}</div>;
}

/* Old URLs from the first version of the site keep working. */
function LegacyJourney() {
  const { id } = useParams();
  return <Navigate to={`/treks/${id}`} replace />;
}
function LegacyStory() {
  const { id } = useParams();
  return <Navigate to={`/journal/${id}`} replace />;
}
function LegacyJourneys() {
  const { search } = useLocation();
  return <Navigate to={`/treks${search}`} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <SavedProvider>
          <AskProvider>
            <MotionConfig reducedMotion="user">
              <ScrollToTop />
              <Nav />
              <main id="main" tabIndex={-1}>
                <PageFrame>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/treks" element={<Treks />} />
                  <Route path="/treks/:id" element={<TrekDetail />} />
                  <Route path="/compare" element={<Compare />} />
                  <Route path="/journal" element={<Journal />} />
                  <Route path="/journal/:id" element={<Article />} />
                  <Route path="/ask" element={<Ask />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/before-you-go" element={<BeforeYouGo />} />
                  <Route path="/connect" element={<Connect />} />
                  <Route path="/credits" element={<Credits />} />
                  <Route path="/journeys" element={<LegacyJourneys />} />
                  <Route path="/journeys/:id" element={<LegacyJourney />} />
                  <Route path="/stories" element={<Navigate to="/journal" replace />} />
                  <Route path="/stories/:id" element={<LegacyStory />} />
                  {Editor && <Route path="/editor" element={<Suspense fallback={null}><Editor /></Suspense>} />}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                </PageFrame>
              </main>
              <Footer />
              <CompareTray />
              <AskSunyaWidget />
            </MotionConfig>
          </AskProvider>
        </SavedProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
