'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';

const ADMIN_NAV_LINKS = [
    { href: '/admin/vendor-applications', label: 'Vendor Applications' },
    { href: '/admin/audit-log', label: 'Audit Log' },
] as const;

export function AdminNav() {
    const pathname = usePathname();

    return (
        <nav className="border-b">
            <div className="flex h-14 items-center justify-between px-6">
                <NavigationMenu>
                    <NavigationMenuList>
                        {ADMIN_NAV_LINKS.map(({ href, label }) => {
                            const isActive = pathname.startsWith(href);
                            return (
                                <NavigationMenuItem key={href}>
                                    <NavigationMenuLink asChild active={isActive}>
                                        <Link href={href} className={cn(
                                            'inline-flex h-9 items-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                                            isActive && 'bg-accent text-accent-foreground',
                                        )}>
                                            {label}
                                        </Link>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                            );
                        })}
                    </NavigationMenuList>
                </NavigationMenu>
                <Link href="/dashboard" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    Back to Dashboard
                </Link>
            </div>
        </nav>
    )
};