import { Route, Switch, useLocation } from 'wouter';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import Landing from './pages/Landing';
import Register from './pages/Register';
import Unlock from './pages/Unlock';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Transparency from './pages/Transparency';
import ExtensionMockup from './pages/ExtensionMockup';
import Insights from './pages/Insights';

import ErrorBoundary from '@/extension/components/ErrorBoundary';
import { ToastProvider } from './contexts/ToastContext';
import { AutoLockProvider } from './contexts/AutoLockContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { VaultProvider } from './contexts/VaultContext';
import './index.css';

/**
 * Wrapper component for page transitions using framer-motion.
 * Provides a standard entry/exit animation for all views.
 * 
 * @param props - React children.
 */
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

/**
 * Main application entry point for routing and global providers.
 * Sets up the routing table, global context providers, and global keyboard shortcuts.
 * 
 * @returns React application root.
 */
function App() {
  const [location, setLocation] = useLocation();

  // Global keyboard shortcuts
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
  }, [setLocation]);

  return (
    <ErrorBoundary>
      <ToastProvider>
        <ThemeProvider>
          <AuthProvider>
            <VaultProvider>
              <AutoLockProvider>
                <AnimatePresence mode="wait">
                  <Switch location={location} key={location}>
                    <Route path="/" component={Landing} />
                    <Route path="/register" component={Register} />
                    <Route path="/unlock" component={Unlock} />
                    <Route path="/dashboard">
                      <PageTransition>
                        <Dashboard />
                      </PageTransition>
                    </Route>
                    <Route path="/settings">
                      <PageTransition>
                        <Settings />
                      </PageTransition>
                    </Route>
                    <Route path="/transparency">
                      <PageTransition>
                        <Transparency />
                      </PageTransition>
                    </Route>
                    <Route path="/extension">
                      <PageTransition>
                        <ExtensionMockup />
                      </PageTransition>
                    </Route>
                    <Route path="/insights">
                      <PageTransition>
                        <Insights />
                      </PageTransition>
                    </Route>
                    <Route>
                      <div className="min-h-screen flex items-center justify-center bg-background">
                        <div className="text-center">
                          <h1 className="text-4xl font-bold mb-4">404</h1>
                          <p className="text-muted-foreground">Page not found</p>
                        </div>
                      </div>
                    </Route>
                  </Switch>
                </AnimatePresence>
              </AutoLockProvider>
            </VaultProvider>
          </AuthProvider>
        </ThemeProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
