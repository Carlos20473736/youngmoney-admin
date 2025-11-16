import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardLayout from "@/components/DashboardLayout";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import UserDetails from "./pages/UserDetails";
import Notifications from "./pages/Notifications";
import Ranking from "./pages/Ranking";
import Withdrawals from "./pages/Withdrawals";

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => (
        <DashboardLayout>
          <Dashboard />
        </DashboardLayout>
      )} />
      <Route path="/users" component={() => (
        <DashboardLayout>
          <Users />
        </DashboardLayout>
      )} />
      <Route path="/users/:id" component={() => (
        <DashboardLayout>
          <UserDetails />
        </DashboardLayout>
      )} />
      <Route path="/notifications" component={() => (
        <DashboardLayout>
          <Notifications />
        </DashboardLayout>
      )} />
      <Route path="/ranking" component={() => (
        <DashboardLayout>
          <Ranking />
        </DashboardLayout>
      )} />
      <Route path="/withdrawals" component={() => (
        <DashboardLayout>
          <Withdrawals />
        </DashboardLayout>
      )} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
