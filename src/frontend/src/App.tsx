import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminPage from "./pages/AdminPage";
import ContactPage from "./pages/ContactPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import PropertiesPage from "./pages/PropertiesPage";
import SmartFinancePage from "./pages/SmartFinancePage";

// ─── Layout ──────────────────────────────────────────────────────────────────

function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-grow">
        <Outlet />
      </div>
      <Footer />
      <Toaster
        theme="dark"
        toastOptions={{
          classNames: {
            toast: "bg-card border-gold-dim/30 text-foreground",
            title: "text-foreground",
            description: "text-foreground/70",
          },
        }}
      />
    </div>
  );
}

// ─── Routes ──────────────────────────────────────────────────────────────────

const rootRoute = createRootRoute({ component: RootLayout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const smartFinanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/smart-finance",
  component: SmartFinancePage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/contact",
  component: ContactPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin-login",
  component: AdminLoginPage,
});

const propertiesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/properties",
  component: PropertiesPage,
});

const router = createRouter({
  routeTree: rootRoute.addChildren([
    indexRoute,
    smartFinanceRoute,
    adminRoute,
    contactRoute,
    loginRoute,
    adminLoginRoute,
    propertiesRoute,
  ]),
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  return <RouterProvider router={router} />;
}
