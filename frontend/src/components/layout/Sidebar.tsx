import { NavLink } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  LayoutDashboard,
  ScrollText,
  Settings,
  Shield,
  ShieldCheck,
} from 'lucide-react';

const navSections = [
  {
    label: 'Overview',
    items: [{ to: '/', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Governance',
    items: [
      { to: '/ai-activity', label: 'AI Activity', icon: Activity },
      { to: '/risk-assessment', label: 'Risk Assessment', icon: AlertTriangle },
      { to: '/data-security', label: 'Data Security', icon: Shield },
      { to: '/policies', label: 'Policies', icon: ShieldCheck },
    ],
  },
  {
    label: 'Compliance',
    items: [{ to: '/audit-logs', label: 'Audit Logs', icon: ScrollText }],
  },
  {
    label: 'System',
    items: [{ to: '/settings', label: 'Settings', icon: Settings }],
  },
];

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex flex-col w-56 bg-bg-secondary border-r border-border">
      <div className="px-4 py-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 bg-white rounded">
            <Shield className="w-4 h-4 text-black" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wide text-text-primary">SHADOWGUARD</h1>
            <p className="text-[10px] text-text-muted uppercase tracking-wider">Enterprise AI Governance</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {navSections.map((section) => (
          <div key={section.label} className="mb-4">
            <p className="px-2 mb-1.5 text-[10px] font-semibold text-text-muted uppercase tracking-wider">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-2 py-2 text-sm rounded transition-colors ${
                        isActive
                          ? 'bg-bg-elevated text-text-primary font-medium'
                          : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated/50'
                      }`
                    }
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-border">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded bg-bg-elevated">
          <div className="flex items-center justify-center w-8 h-8 text-xs font-semibold bg-neutral-700 rounded text-text-primary">
            MO
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-text-primary truncate">Michael O&apos;Brien</p>
            <p className="text-[10px] text-text-muted truncate">Security Administrator</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
