import { create } from 'zustand';
import { Home, Briefcase, BarChart, Users, Repeat } from "lucide-react";
import { usePathname } from 'next/navigation';

export const navItems = [
  { href: "/dashboard", label: "Explore", icon: Home },
  { href: "/portfolio", label: "Portfolio", icon: Briefcase },
  { href: "/trade", label: "Trade", icon: Repeat },
  { href: "/goals", label: "Goals", icon: BarChart },
  { href: "/community", label: "Community", icon: Users },
];

interface NavigationState {
  previousPathIndex: number | null;
  currentPathIndex: number | null;
  setPath: (path: string, index: number) => void;
}

const getInitialIndex = () => {
    if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        const index = navItems.findIndex(item => item.href === currentPath);
        return index !== -1 ? index : null;
    }
    return null;
}

export const useNavigationStore = create<NavigationState>((set, get) => ({
  previousPathIndex: null,
  currentPathIndex: getInitialIndex(),
  setPath: (path: string, index: number) => {
    const { currentPathIndex } = get();
    set({
      previousPathIndex: currentPathIndex,
      currentPathIndex: index,
    });
  },
}));
