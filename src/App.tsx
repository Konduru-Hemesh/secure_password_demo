import { Route, Switch, useLocation } from 'wouter';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import Landing from './pages/Landing';
import Register from './pages/Register';
import Unlock from './pages/Unlock';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Insights from './pages/Insights';
import Navigation from './components/Navigation';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './contexts/ToastContext';
import { AutoLockProvider } from './contexts/AutoLockContext';
import './index.css';

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}



function App() {
  const [location, setLocation] = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  // Handle global keyboard shortcuts
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      // Ctrl+L to Lock (navigate to /unlock)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'l' || e.key === 'L')) {
        e.preventDefault();
        setLocation('/unlock');
      }

      // Ctrl+, for settings
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        setLocation('/settings');
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, [setLocation]); // Added setIsStealth to dependency array

  return (
    <ErrorBoundary>
      <ToastProvider>
        <AutoLockProvider>
          <AnimatePresence mode="wait">
            <Switch location={location} key={location}>
              <Route path="/" component={Landing} />
              <Route path="/register" component={Register} />
              <Route path="/unlock" component={Unlock} />
              <Route path="/dashboard">
                <Dashboard />
                <Navigation />
              </Route>
              <Route path="/settings">
                <PageTransition>
                  <Settings />
                  <Navigation />
                </PageTransition>
              </Route>
              <Route path="/insights">
                <PageTransition>
                  <Insights />
                  <Navigation />
                </PageTransition>
              </Route>
              <Route>
                <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">404</h1>
                    <p className="text-muted-foreground">Page not found</p>
                  </div>
                </div>
              </Route>
            </Switch>
          </AnimatePresence>
        </AutoLockProvider >
      </ToastProvider >
    </ErrorBoundary >
  );
}

export default App;
