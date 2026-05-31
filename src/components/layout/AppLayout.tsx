import { Link, NavLink, Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

export function AppLayout() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <NavLink
              to="/"
              end
              className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-lg font-bold tracking-tight text-transparent"
            >
              Fatoven
            </NavLink>
            <nav className="hidden md:block">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  cn(
                    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                  )
                }
              >
                Daily log
              </NavLink>
            </nav>
          </div>
          {user && (
            <Link
              to="/profile"
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              title="Profile & account"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-xs font-semibold text-white">
                {(user.displayName || user.email).charAt(0).toUpperCase()}
              </span>
              <span className="hidden max-w-[140px] truncate sm:inline">
                {user.displayName || user.email}
              </span>
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
