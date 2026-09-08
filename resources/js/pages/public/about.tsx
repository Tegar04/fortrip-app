import { Link } from '@inertiajs/react';
import { ArrowRight, MessageCircle, Compass } from 'lucide-react';
import SeoHead from '@/components/public/seo-head';
import { index as packages } from '@/routes/packages';
import type { PublicSite, SeoMeta } from '@/types';
export default function About({
    site,
    content,
    seo,
}: {
    site: PublicSite;
    content: { title: string; description: string };
    seo: SeoMeta;
}) {
    return (
        <>
            <SeoHead seo={seo} />
            <section className="bg-slate-950 px-5 py-20 text-white sm:px-8 sm:py-28">
                <div className="mx-auto grid max-w-7xl gap-5">
                    <p className="text-sm font-semibold tracking-widest text-emerald-300 uppercase">
                        Tentang Kami
                    </p>
                    <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
                        {content.title}
                    </h1>
                    <p className="text-lg text-slate-300">
                        {site.company_name}
                    </p>
                </div>
            </section>
            <section className="bg-slate-50 px-5 py-16 sm:px-8 sm:py-24">
                <div className="mx-auto grid max-w-7xl items-start gap-10 lg:grid-cols-[1.5fr_1fr]">
                    <article className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-7 sm:p-10">
                        <h2 className="text-2xl font-semibold text-slate-950">
                            Kenali perjalanan kami
                        </h2>
                        <p className="leading-8 whitespace-pre-line text-slate-600">
                            {content.description}
                        </p>
                    </article>
                    <aside className="grid gap-6 rounded-3xl bg-emerald-950 p-8 text-white">
                        <Compass
                            className="size-10 text-emerald-300"
                            aria-hidden="true"
                        />
                        <h2 className="text-2xl font-semibold">
                            Rencanakan perjalanan Anda
                        </h2>
                        <p className="leading-7 text-emerald-100">
                            Temukan paket yang sesuai atau diskusikan kebutuhan
                            perjalanan Anda bersama tim kami.
                        </p>
                        <Link
                            href={packages()}
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 font-semibold text-emerald-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                        >
                            Lihat paket wisata{' '}
                            <ArrowRight className="size-4" aria-hidden="true" />
                        </Link>
                        {site.whatsapp_url && (
                            <a
                                href={site.whatsapp_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                            >
                                <MessageCircle
                                    className="size-5"
                                    aria-hidden="true"
                                />
                                Chat WhatsApp
                            </a>
                        )}
                    </aside>
                </div>
            </section>
        </>
    );
}
