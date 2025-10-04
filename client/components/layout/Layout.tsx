import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";

function useAuth() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  useEffect(() => {
    const raw = localStorage.getItem("tf_user");
    if (raw) setUser(JSON.parse(raw));
  }, []);
  const login = () => {
    const demo = { name: "Talent Admin", email: "admin@talentflow.app" };
    localStorage.setItem("tf_user", JSON.stringify(demo));
    setUser(demo);
  };
  const logout = () => {
    localStorage.removeItem("tf_user");
    setUser(null);
  };
  const update = (name: string) => {
    if (!user) return;
    const next = { ...user, name };
    localStorage.setItem("tf_user", JSON.stringify(next));
    setUser(next);
  };
  return { user, login, logout, update };
}

export default function Layout() {
  const { user, login, logout, update } = useAuth();
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const location = useLocation();

  useEffect(() => {
    setEditing(false);
  }, [location.pathname]);

  const isHome = location.pathname === "/";

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-slate-50 to-white", isHome ? "grid grid-rows-[64px_1fr_auto] grid-cols-1" : "grid grid-cols-[320px_1fr] grid-rows-[64px_1fr_auto]")}>
      {!isHome ? (
        <aside className="row-span-3 col-start-1 col-end-2 border-r bg-sidebar">
          <div className="h-20 flex items-center px-6 border-b">
            <Link to="/" className="font-extrabold text-2xl tracking-tight">
              <span className="text-primary">Talent</span> <span className="text-slate-500">Flow</span>
            </Link>
          </div>
          <nav className="p-6 space-y-4 text-lg">
            <SideItem to="/jobs" label="Jobs" />
            <SideItem to="/candidates" label="Candidates" />
            <SideItem to="/assessments" label="Assessments" />
          </nav>
        </aside>
      ) : null}

      <header className={cn("h-16 border-b flex items-center justify-between px-4 col-start-2 col-end-3", isHome ? "col-start-1 col-end-2" : "") }>
        <div className="text-sm text-muted-foreground">HR Management Suite</div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-0 h-12 w-12 rounded-full">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="https://i.pravatar.cc/100?img=5" alt="profile" />
                  <AvatarFallback>TF</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Profile</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {user ? (
                <>
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    <div className="font-medium text-foreground">{user.name}</div>
                    <div>{user.email}</div>
                  </div>
                  <DropdownMenuItem onClick={() => setEditing(true)}>Edit Profile</DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem onClick={login}>Login</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className={cn("p-6", isHome ? "col-start-1 col-end-2" : "col-start-2 col-end-3")}>
        {editing ? (
          <div className="max-w-md mb-6 border rounded-lg p-4 bg-card">
            <div className="font-semibold mb-2">Edit Profile</div>
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-md border px-3 py-2 text-sm"
                placeholder="Your name"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
              />
              <Button
                onClick={() => {
                  if (nameInput.trim()) {
                    update(nameInput.trim());
                    setEditing(false);
                    setNameInput("");
                  }
                }}
              >
                Save
              </Button>
              <Button variant="ghost" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : null}
        <Outlet />
      </main>

      <footer className={cn("border-t bg-muted/30", isHome ? "col-start-1 col-end-2" : "col-start-2 col-end-3")}>
        <div className="max-w-7xl mx-auto px-6 py-4 text-sm text-muted-foreground flex items-center gap-6">
          <Link className="hover:text-foreground" to="/support">Support</Link>
          <Link className="hover:text-foreground" to="/about">About Us</Link>
          <Link className="hover:text-foreground" to="/contact">Contact Us</Link>
          <div className="ml-auto text-right">
            <div>© {new Date().getFullYear()} Talent Flow</div>
            <div className="text-xs text-muted-foreground">Created by Digvijay Singh</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SideItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "block rounded-lg px-4 py-3 font-semibold text-slate-700 hover:bg-accent transition-interactive hover-enlarge",
          isActive && "bg-primary/10 text-primary scale-105",
        )
      }
    >
      {label}
    </NavLink>
  );
}
