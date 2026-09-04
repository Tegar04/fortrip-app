import { Link, usePage } from '@inertiajs/react';
import {
    Facebook,
    Instagram,
    Mail,
    MapPin,
    Menu,
    MessageCircle,
    Phone,
    Plane,
    X,
    Youtube,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { home } from '@/routes';
import { index as packageIndex } from '@/routes/packages';
import type { PublicSite } from '@/types';

type PublicPageProps = {
    site: PublicSite;
};

const navigation = [
    { label: 'Home', href: home.url() },
    { label: 'Paket Wisata', href: packageIndex.url() },
    { label: 'Tentang Kami', href: `${home.url()}#about` },
    { label: 'Testimoni', href: `${home.url()}#testimonials` },
    { label: 'Kontak', href: `${home.url()}#contact` },
];

export default function PublicLayout({ children }: { children: ReactNode }) {
    const { site } = usePage<PublicPageProps>().props;
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-white text-slate-950">
            <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
                <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
                    <Link
                        href={home()}
                        className="flex items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600"
                    >
                        <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
                            <Plane className="size-5" aria-hidden="true" />
                        </span>
                        <span className="grid leading-tight">
                            <span className="font-semibold tracking-tight">
                                {site.company_name}
                            </span>
                            {site.company_tagline && (
                                <span className="hidden text-xs text-slate-500 sm:block">
                                    {site.company_tagline}
                                </span>
                            )}
                        </span>
                    </Link>

                    <nav
                        aria-label="Navigasi utama"
                        className="hidden items-center gap-7 lg:flex"
                    >
                        {navigation.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                prefetch
                                className="rounded-md text-sm font-medium text-slate-600 transition-colors hover:text-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-3">
                        {site.whatsapp_url && (
                            <a
                                href={site.whatsapp_url}
                                target="_blank"
                                rel="noreferrer"
                                className="hidden items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 sm:inline-flex"
                            >
                                <MessageCircle
                                    className="size-4"
                                    aria-hidden="true"
                                />
                                Hubungi Kami
                            </a>
                        )}
                        <button
                            type="button"
                            onClick={() => setMenuOpen((open) => !open)}
                            aria-expanded={menuOpen}
                            aria-controls="mobile-navigation"
                            aria-label={
                                menuOpen
                                    ? 'Tutup menu navigasi'
                                    : 'Buka menu navigasi'
                            }
                            className="flex size-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 lg:hidden"
                        >
                            {menuOpen ? (
                                <X className="size-5" aria-hidden="true" />
                            ) : (
                                <Menu className="size-5" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>

                {menuOpen && (
                    <nav
                        id="mobile-navigation"
                        aria-label="Navigasi mobile"
                        className="border-t border-slate-100 bg-white px-5 py-5 lg:hidden"
                    >
                        <div className="mx-auto grid max-w-7xl gap-1">
                            {navigation.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    prefetch
                                    onClick={() => setMenuOpen(false)}
                                    className="rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-800"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </nav>
                )}
            </header>

            <main>{children}</main>

            <footer
                id="contact"
                className="scroll-mt-20 bg-slate-950 text-slate-300"
            >
                <div className="mx-auto grid max-w-7xl gap-12 px-5 py-14 sm:px-8 md:grid-cols-2 lg:grid-cols-[1.3fr_0.7fr_1fr] lg:px-10">
                    <div className="grid content-start gap-5">
                        <div className="flex items-center gap-3 text-white">
                            <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-500">
                                <Plane className="size-5" aria-hidden="true" />
                            </span>
                            <span className="text-lg font-semibold">
                                {site.company_name}
                            </span>
                        </div>
                        {site.company_tagline && (
                            <p className="max-w-sm text-sm leading-7 text-slate-400">
                                {site.company_tagline}
                            </p>
                        )}
                        <div className="flex gap-3">
                            <SocialLink
                                href={site.social_urls.instagram}
                                label="Instagram"
                            >
                                <Instagram aria-hidden="true" />
                            </SocialLink>
                            <SocialLink
                                href={site.social_urls.facebook}
                                label="Facebook"
                            >
                                <Facebook aria-hidden="true" />
                            </SocialLink>
                            <SocialLink
                                href={site.social_urls.youtube}
                                label="YouTube"
                            >
                                <Youtube aria-hidden="true" />
                            </SocialLink>
                        </div>
                    </div>

                    <div className="grid content-start gap-4">
                        <h2 className="font-semibold text-white">Navigasi</h2>
                        <div className="grid gap-3 text-sm">
                            {navigation.slice(0, 4).map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    prefetch
                                    className="w-fit transition hover:text-emerald-400"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="grid content-start gap-4">
                        <h2 className="font-semibold text-white">
                            Hubungi Kami
                        </h2>
                        <div className="grid gap-4 text-sm">
                            {site.company_address && (
                                <ContactItem icon={MapPin}>
                                    {site.company_address}
                                </ContactItem>
                            )}
                            {site.company_phone && (
                                <ContactItem icon={Phone}>
                                    <a
                                        href={`tel:${site.company_phone}`}
                                        className="hover:text-white"
                                    >
                                        {site.company_phone}
                                    </a>
                                </ContactItem>
                            )}
                            {site.company_email && (
                                <ContactItem icon={Mail}>
                                    <a
                                        href={`mailto:${site.company_email}`}
                                        className="hover:text-white"
                                    >
                                        {site.company_email}
                                    </a>
                                </ContactItem>
                            )}
                        </div>
                    </div>
                </div>
                <div className="border-t border-white/10">
                    <div className="mx-auto max-w-7xl px-5 py-6 text-sm text-slate-500 sm:px-8 lg:px-10">
                        © {new Date().getFullYear()} {site.company_name}.
                        Seluruh hak cipta dilindungi.
                    </div>
                </div>
            </footer>

            {site.whatsapp_url && (
                <a
                    href={site.whatsapp_url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Hubungi kami melalui WhatsApp"
                    className="fixed right-5 bottom-5 z-40 flex size-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xl shadow-emerald-950/20 transition hover:-translate-y-1 hover:bg-emerald-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600 sm:hidden"
                >
                    <MessageCircle className="size-6" aria-hidden="true" />
                </a>
            )}
        </div>
    );
}

function SocialLink({
    href,
    label,
    children,
}: {
    href: string | null;
    label: string;
    children: ReactNode;
}) {
    if (!href) {
        return null;
    }

    return (
        <a
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={label}
            className="flex size-10 items-center justify-center rounded-full bg-white/5 text-slate-400 transition hover:bg-emerald-500 hover:text-white [&_svg]:size-4"
        >
            {children}
        </a>
    );
}

function ContactItem({
    icon: Icon,
    children,
}: {
    icon: typeof MapPin;
    children: ReactNode;
}) {
    return (
        <div className="flex items-start gap-3 leading-6 text-slate-400">
            <Icon
                className="mt-1 size-4 shrink-0 text-emerald-400"
                aria-hidden="true"
            />
            <span>{children}</span>
        </div>
    );
}
