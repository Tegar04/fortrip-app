import { Head, Link } from '@inertiajs/react';
import { Compass, MessageCircle, Sparkles } from 'lucide-react';
import PackageCard from '@/components/public/package-card';
import PublicPagination from '@/components/public/public-pagination';
import { home } from '@/routes';
import type {
    PaginatedData,
    PublicPackage,
    PublicSite,
    SeoMeta,
} from '@/types';

type Props = {
    site: PublicSite;
    seo: SeoMeta;
    packages: PaginatedData<PublicPackage>;
};

export default function PackageIndex({ site, seo, packages }: Props) {
    const socialImage = packages.data.find(
        (travelPackage) => travelPackage.cover_url,
    )?.cover_url;

    return (
        <>
            <Head title={seo.title}>
                <meta name="description" content={seo.description} />
                <meta property="og:title" content={seo.title} />
                <meta property="og:description" content={seo.description} />
                <meta property="og:type" content="website" />
                {socialImage && (
                    <meta property="og:image" content={socialImage} />
                )}
            </Head>

            <section className="relative isolate overflow-hidden bg-slate-950 px-5 py-16 text-white sm:px-8 sm:py-20 lg:px-10">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.28),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.2),transparent_35%)]" />
                <div className="absolute -top-28 right-[12%] -z-10 size-72 rounded-full border-[48px] border-white/5" />

                <div className="mx-auto grid max-w-7xl gap-8">
                    <nav
                        aria-label="Breadcrumb"
                        className="flex items-center gap-2 text-sm text-slate-300"
                    >
                        <Link
                            href={home()}
                            prefetch
                            className="rounded transition hover:text-emerald-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-400"
                        >
                            Home
                        </Link>
                        <span aria-hidden="true">/</span>
                        <span aria-current="page" className="text-white">
                            Paket Wisata
                        </span>
                    </nav>

                    <div className="grid max-w-3xl gap-5">
                        <div className="flex w-fit items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-4 py-2 text-xs font-semibold tracking-[0.16em] text-emerald-200 uppercase">
                            <Sparkles className="size-3.5" aria-hidden="true" />
                            Pilihan Perjalanan
                        </div>
                        <h1 className="text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                            Temukan Paket Wisata Pilihan Anda
                        </h1>
                        <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
                            Jelajahi destinasi menarik dengan itinerary yang
                            dirancang untuk perjalanan nyaman dan berkesan
                            bersama {site.company_name}.
                        </p>
                    </div>
                </div>
            </section>

            <section className="bg-slate-50 px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
                <div className="mx-auto grid max-w-7xl gap-10">
                    {packages.data.length > 0 ? (
                        <>
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                                <div className="grid gap-2">
                                    <p className="text-sm font-semibold tracking-[0.16em] text-emerald-700 uppercase">
                                        Katalog Paket
                                    </p>
                                    <h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                                        Rencanakan perjalanan berikutnya
                                    </h2>
                                </div>
                                <p className="text-sm text-slate-500">
                                    Menampilkan {packages.from}–{packages.to}{' '}
                                    dari {packages.total} paket
                                </p>
                            </div>

                            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
                                {packages.data.map((travelPackage) => (
                                    <PackageCard
                                        key={travelPackage.id}
                                        travelPackage={travelPackage}
                                        whatsappUrl={site.whatsapp_url}
                                    />
                                ))}
                            </div>

                            <PublicPagination links={packages.links} />
                        </>
                    ) : (
                        <EmptyState whatsappUrl={site.whatsapp_url} />
                    )}
                </div>
            </section>
        </>
    );
}

function EmptyState({ whatsappUrl }: { whatsappUrl: string | null }) {
    return (
        <div className="mx-auto grid max-w-xl justify-items-center gap-6 rounded-[2rem] border border-slate-200 bg-white px-6 py-14 text-center shadow-sm sm:px-12 sm:py-16">
            <span className="flex size-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <Compass className="size-8" aria-hidden="true" />
            </span>
            <div className="grid gap-3">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                    Paket wisata sedang dipersiapkan
                </h2>
                <p className="leading-7 text-slate-600">
                    Belum ada paket yang tersedia saat ini. Hubungi kami untuk
                    mendiskusikan rencana perjalanan yang Anda inginkan.
                </p>
            </div>
            {whatsappUrl && (
                <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600"
                >
                    <MessageCircle className="size-4" aria-hidden="true" />
                    Konsultasi perjalanan
                </a>
            )}
        </div>
    );
}
