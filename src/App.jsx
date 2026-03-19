import { useState, useEffect } from 'react';
import { T } from './constants/tokens';
import { DEMO_DATA } from './constants/data';
import { PageTransition } from './components/PageTransition';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { ProfilePage } from './pages/ProfilePage';
import { Dashboard } from './pages/Dashboard';
import { PricingPage } from './pages/PricingPage';
import { NewTabPage } from './pages/NewTabPage';

export default function App() {
  const [page, setPage] = useState("landing");
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState(() => {
    try { const s = sessionStorage.getItem("mm_cats"); return s ? JSON.parse(s) : DEMO_DATA; } catch { return DEMO_DATA; }
  });

  useEffect(() => { try { sessionStorage.setItem("mm_cats", JSON.stringify(categories)); } catch {} }, [categories]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [page]);

  const login = userData => { setUser(userData); setPage("dashboard"); };
  const logout = () => { setUser(null); setPage("landing"); };
  const navigate = p => setPage(p);

  const appStats = {
    cats: categories.length,
    bms: categories.reduce((a,c) => a + c.bookmarks.length, 0),
    pinned: categories.reduce((a,c) => a + c.bookmarks.filter(b=>b.pinned).length, 0),
    tags: [...new Set(categories.flatMap(c=>[...(c.tags||[]),...c.bookmarks.flatMap(b=>b.tags||[])]))].length,
  };

  return (
    <>
      <style>{`
        @keyframes mmFadeIn{from{opacity:0}to{opacity:1}}
        @keyframes mmSlideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes mmSlideDown{from{transform:translateY(-100%)}to{transform:translateY(0)}}
        @keyframes mmSlideLeft{from{transform:translateX(100%)}to{transform:translateX(0)}}
        @keyframes mmCardIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes mmCardSpring{from{opacity:0;transform:translateY(18px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes mmRowIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
        @keyframes mmStatPulse{0%{transform:scale(1)}50%{transform:scale(1.03)}100%{transform:scale(1)}}
        @keyframes mmSheetUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
        @keyframes mmSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes mmShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes mmPulse{0%,100%{opacity:0.3;transform:scale(0.8)}50%{opacity:1;transform:scale(1.1)}}
      `}</style>
      <PageTransition pageKey={page}>
        {page === "landing" && <ErrorBoundary fallbackTitle="Page error" fallbackMessage="The landing page encountered an error."><LandingPage onNavigate={navigate} /></ErrorBoundary>}
        {page === "pricing" && <ErrorBoundary fallbackTitle="Page error" fallbackMessage="The pricing page encountered an error."><PricingPage onNavigate={navigate} /></ErrorBoundary>}
        {page === "newtab" && <ErrorBoundary fallbackTitle="Page error" fallbackMessage="The new tab page encountered an error."><NewTabPage onNavigate={navigate} categories={categories} /></ErrorBoundary>}
        {page === "login" && <ErrorBoundary fallbackTitle="Auth error" fallbackMessage="The login form encountered an error."><AuthPage mode="login" onNavigate={navigate} onLogin={login} /></ErrorBoundary>}
        {page === "signup" && <ErrorBoundary fallbackTitle="Auth error" fallbackMessage="The signup form encountered an error."><AuthPage mode="signup" onNavigate={navigate} onLogin={login} /></ErrorBoundary>}
        {page === "profile" && user && <ErrorBoundary fallbackTitle="Profile error" fallbackMessage="The profile page encountered an error."><ProfilePage user={user} onUpdate={setUser} onNavigate={navigate} onLogout={logout} stats={appStats} /></ErrorBoundary>}
        {page === "dashboard" && user && <ErrorBoundary fallbackTitle="Dashboard error" fallbackMessage="The dashboard encountered an error. Your data is safe."><Dashboard user={user} categories={categories} setCategories={setCategories} onNavigate={navigate} onLogout={logout} /></ErrorBoundary>}
        {page === "dashboard" && !user && (() => { setPage("login"); return null; })()}
        {page === "profile" && !user && (() => { setPage("login"); return null; })()}
      </PageTransition>
    </>
  );
}
