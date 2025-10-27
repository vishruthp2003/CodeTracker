import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Code2, LayoutDashboard, ListChecks, LogOut, Plus } from "lucide-react";
import { useEffect } from "react";

const Layout = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2">
              <Code2 className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                CodeTracker
              </span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link
                to="/questions"
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <ListChecks className="w-4 h-4" />
                Questions
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate("/questions/new")}
              size="sm"
              className="hidden md:flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Question
            </Button>
            <Button onClick={signOut} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-8 px-4">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-card py-6">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          Made with ❤️ by Vishruth
        </div>
      </footer>
    </div>
  );
};

export default Layout;
