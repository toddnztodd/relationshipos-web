import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppShell } from "./components/layout/AppShell";
import { isAuthenticated } from "./lib/api";
import { useState, useCallback } from "react";
import Dashboard from "./pages/Dashboard";
import People from "./pages/People";
import PersonDetail from "./pages/PersonDetail";
import Properties from "./pages/Properties";
import Community from "./pages/Community";
import Settings from "./pages/Settings";
import Login from "./pages/Login";

function AuthenticatedApp() {
  return (
    <AppShell>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/people" component={People} />
        <Route path="/people/:id" component={PersonDetail} />
        <Route path="/properties" component={Properties} />
        <Route path="/community" component={Community} />
        <Route path="/settings" component={Settings} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </AppShell>
  );
}

function App() {
  const [authed, setAuthed] = useState(isAuthenticated());
  const handleLogin = useCallback(() => setAuthed(true), []);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          {authed ? <AuthenticatedApp /> : <Login onSuccess={handleLogin} />}
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
