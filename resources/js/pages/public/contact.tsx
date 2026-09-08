import { MessageCircle, Mail, Phone, MapPin } from 'lucide-react';
import SeoHead from '@/components/public/seo-head';
import type { PublicSite, SeoMeta } from '@/types';
export default function Contact({
    site,
    seo,
}: {
    site: PublicSite;
    seo: SeoMeta;
}) {
    const socialLinks = [
        { label: 'Instagram', url: site.social_urls.instagram },
        { label: 'Facebook', url: site.social_urls.facebook },
        { label: 'YouTube', url: site.social_urls.youtube },
    ].filter((link) => link.url);
    const hasContact =
        site.company_address || site.company_phone || site.company_email;
    return (
        <>
            <SeoHead seo={seo} />
            <section className="bg-slate-950 px-5 py-20 text-white sm:px-8 sm:py-28">
                <div className="mx-auto grid max-w-7xl gap-5">
                    <p className="text-sm font-semibold tracking-widest text-emerald-300 uppercase">
                        Kontak
                    </p>
                    <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
                        Mari rencanakan perjalanan Anda
                    </h1>
                    <p className="max-w-2xl text-lg leading-8 text-slate-300">
                        Hubungi tim {site.company_name} untuk informasi paket
                        dan konsultasi perjalanan.
                    </p>
                </div>
            </section>
            <section className="bg-slate-50 px-5 py-16 sm:px-8 sm:py-24">
                <div className="mx-auto grid max-w-7xl items-start gap-8 lg:grid-cols-2">
                    <div className="grid gap-7 rounded-3xl border border-slate-200 bg-white p-7 sm:p-10">
                        <h2 className="text-2xl font-semibold">
                            Informasi kontak
                        </h2>
                        {site.company_address && (
                            <div className="flex items-start gap-4">
                                <MapPin
                                    className="mt-1 size-5 shrink-0 text-emerald-700"
                                    aria-hidden="true"
                                />
                                <div className="grid gap-2">
                                    <h3 className="font-semibold">Alamat</h3>
                                    <p className="leading-7 whitespace-pre-line text-slate-600">
                                        {site.company_address}
                                    </p>
                                </div>
                            </div>
                        )}
                        {site.company_phone && (
                            <div className="flex items-start gap-4">
                                <Phone
                                    className="mt-1 size-5 shrink-0 text-emerald-700"
                                    aria-hidden="true"
                                />
                                <div className="grid gap-2">
                                    <h3 className="font-semibold">Telepon</h3>
                                    <a
                                        href={'tel:' + site.company_phone}
                                        className="text-emerald-700 underline underline-offset-4"
                                    >
                                        {site.company_phone}
                                    </a>
                                </div>
                            </div>
                        )}
                        {site.company_email && (
                            <div className="flex items-start gap-4">
                                <Mail
                                    className="mt-1 size-5 shrink-0 text-emerald-700"
                                    aria-hidden="true"
                                />
                                <div className="grid min-w-0 gap-2">
                                    <h3 className="font-semibold">Email</h3>
                                    <a
                                        href={'mailto:' + site.company_email}
                                        className="[overflow-wrap:anywhere] text-emerald-700 underline underline-offset-4"
                                    >
                                        {site.company_email}
                                    </a>
                                </div>
                            </div>
                        )}
                        {!hasContact && (
                            <p className="text-slate-600">
                                Informasi kontak sedang diperbarui.
                            </p>
                        )}
                        {socialLinks.length > 0 && (
                            <div className="grid gap-4 border-t border-slate-200 pt-6">
                                <h3 className="font-semibold">Ikuti kami</h3>
                                <div className="flex flex-wrap gap-4">
                                    {socialLinks.map((link) => (
                                        <a
                                            key={link.label}
                                            href={link.url!}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-emerald-700 underline underline-offset-4"
                                        >
                                            {link.label}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    {site.whatsapp_url && (
                        <aside className="grid gap-5 rounded-3xl bg-emerald-950 p-8 text-white sm:p-10">
                            <MessageCircle
                                className="size-12 text-emerald-300"
                                aria-hidden="true"
                            />
                            <h2 className="text-2xl font-semibold">
                                Konsultasi melalui WhatsApp
                            </h2>
                            <p className="leading-7 text-emerald-100">
                                Tanyakan pilihan destinasi, detail paket, atau
                                kebutuhan perjalanan Anda langsung kepada tim
                                kami.
                            </p>
                            <a
                                href={site.whatsapp_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 font-semibold text-emerald-950 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                            >
                                <MessageCircle
                                    className="size-5"
                                    aria-hidden="true"
                                />
                                Chat WhatsApp
                            </a>
                        </aside>
                    )}
                </div>
            </section>
        </>
    );
}
