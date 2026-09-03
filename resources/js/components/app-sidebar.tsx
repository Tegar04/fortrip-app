import { Link, usePage } from "@inertiajs/react";
import {
    BookOpen,
    ChartNoAxesCombined,
    CalendarCheck2,
    FolderGit2,
    Images,
    LayoutGrid,
    MapPinned,
    MessageSquareQuote,
    ReceiptText,
    Settings2,
    UsersRound,
} from "lucide-react";
import { edit as editSiteSettings } from "@/actions/App/Http/Controllers/Admin/SiteSettingController";
import AppLogo from "@/components/app-logo";
import { NavFooter } from "@/components/nav-footer";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { dashboard } from "@/routes";
import { index as bannersIndex } from "@/routes/admin/banners";
import { index as bookingsIndex } from "@/routes/admin/bookings";
import { index as customersIndex } from "@/routes/admin/customers";
import { index as invoicesIndex } from "@/routes/admin/invoices";
import { index as packagesIndex } from "@/routes/admin/packages";
import { index as reportsIndex } from "@/routes/admin/reports";
import { index as testimonialsIndex } from "@/routes/admin/testimonials";
import type { NavItem } from "@/types";

const footerNavItems: NavItem[] = [
    {
        title: "Repository",
        href: "https://github.com/laravel/react-starter-kit",
        icon: FolderGit2,
    },
    {
        title: "Documentation",
        href: "https://laravel.com/docs/starter-kits#react",
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage().props;
    const mainNavItems: NavItem[] = [
        {
            title: "Dashboard",
            href: dashboard(),
            icon: LayoutGrid,
        },
    ];

    if (auth.permissions.viewBanners) {
        mainNavItems.push({
            title: "Banners",
            href: bannersIndex(),
            icon: Images,
        });
    }

    if (auth.permissions.viewPackages) {
        mainNavItems.push({
            title: "Packages",
            href: packagesIndex(),
            icon: MapPinned,
        });
    }

    if (auth.permissions.viewTestimonials) {
        mainNavItems.push({
            title: "Testimonials",
            href: testimonialsIndex(),
            icon: MessageSquareQuote,
        });
    }

    if (auth.permissions.viewCustomers) {
        mainNavItems.push({
            title: "Customers",
            href: customersIndex(),
            icon: UsersRound,
        });
    }

    if (auth.permissions.viewBookings) {
        mainNavItems.push({
            title: "Bookings",
            href: bookingsIndex(),
            icon: CalendarCheck2,
        });
    }

    if (auth.permissions.viewInvoices) {
        mainNavItems.push({
            title: "Invoices",
            href: invoicesIndex(),
            icon: ReceiptText,
        });
    }

    if (auth.permissions.viewReports) {
        mainNavItems.push({
            title: "Laporan",
            href: reportsIndex(),
            icon: ChartNoAxesCombined,
        });
    }

    if (auth.permissions.manageSiteSettings) {
        mainNavItems.push({
            title: "Site settings",
            href: editSiteSettings(),
            icon: Settings2,
        });
    }

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
