import { Head, Link } from '@inertiajs/react';
import {
    CalendarDays,
    Compass,
    Images,
    MapPin,
    MessageCircle,
    ShieldCheck,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { home } from '@/routes';
import { index as packageIndex } from '@/routes/packages';
import type { PublicPackageDetail, PublicSite, SeoMeta } from '@/types';

const rupiahFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
});

type Props = {
    site: PublicSite;
    seo: SeoMeta;
    package: PublicPackageDetail;
};

export default function PackageShow({
    site,
    seo,
    package: travelPackage,
}: Props) {
    const socialImage =
        travelPackage.cover_original_url || travelPackage.cover_url;
    const consultationUrl = site.whatsapp_url
        ? `${site.whatsapp_url}${site.whatsapp_url.includes('?') ? '&' : '?'}text=${encodeURIComponent(
              `Halo, saya tertarik dengan ${travelPackage.title}. Bisa berikan informasi lebih lanjut?`,
          )}`
        : null;

    return (
        <>
            <Head title={seo.title}>
                <meta name="description" content={seo.description} />
                <meta property="og:title" content={seo.title} />
                <meta property="og:description" content={seo.description} />
                <meta property="og:type" content="product" />
                {socialImage && (
                    <meta property="og:image" content={socialImage} />
                )}
            </Head>

            <section className="relative isolate overflow-hidden bg-slate-950 text-white">
                <div className="absolute inset-0 -z-20 bg-slate-950" />
                {travelPackage.cover_url ? (
                    <img
                        src={travelPackage.cover_url}
                        alt={`Pemandangan ${travelPackage.destination} untuk ${travelPackage.title}`}
                        fetchPriority="high"
                        className="absolute inset-0 -z-10 size-full object-cover opacity-45"
                    />
                ) : (
                    <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.32),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.22),transparent_40%)]" />
                )}
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-slate-950 via-slate-950/55 to-slate-950/35" />

                <div className="mx-auto grid min-h-[32rem] max-w-7xl content-between gap-16 px-5 py-10 sm:px-8 sm:py-14 lg:min-h-[38rem] lg:px-10">
                    <nav
                        aria-label="Breadcrumb"
                        className="flex flex-wrap items-center gap-2 text-sm text-slate-200"
                    >
                        <Link
                            href={home()}
                            prefetch
                            className="rounded transition hover:text-emerald-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-400"
                        >
                            Home
                        </Link>
                        <span aria-hidden="true">/</span>
                        <Link
                            href={packageIndex()}
                            prefetch
                            className="rounded transition hover:text-emerald-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-400"
                        >
                            Paket Wisata
                        </Link>
                        <span aria-hidden="true">/</span>
                        <span aria-current="page" className="text-white">
                            {travelPackage.title}
                        </span>
                    </nav>

                    <div className="grid max-w-4xl gap-6 pb-4">
                        <div className="flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
                            <MapPin
                                className="size-4 text-emerald-300"
                                aria-hidden="true"
                            />
                            {travelPackage.destination}
                        </div>
                        <h1 className="text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                            {travelPackage.title}
                        </h1>
                        <div className="flex flex-wrap gap-3">
                            <DetailBadge icon={CalendarDays}>
                                {travelPackage.duration_days} hari perjalanan
                            </DetailBadge>
                            <DetailBadge icon={Compass}>
                                Perjalanan terkurasi
                            </DetailBadge>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-slate-50 px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
                <div className="mx-auto grid max-w-7xl items-start gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14">
                    <div className="grid gap-12">
                        <article className="grid gap-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
                            <div className="grid gap-2">
                                <p className="text-sm font-semibold tracking-[0.16em] text-emerald-700 uppercase">
                                    Tentang Paket
                                </p>
                                <h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                                    Detail perjalanan
                                </h2>
                            </div>
                            <p className="text-base leading-8 whitespace-pre-line text-slate-600">
                                {travelPackage.description}
                            </p>
                        </article>

                        {travelPackage.gallery.length > 0 && (
                            <section
                                className="grid gap-6"
                                aria-labelledby="gallery-heading"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="flex size-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                                        <Images
                                            className="size-5"
                                            aria-hidden="true"
                                        />
                                    </span>
                                    <div className="grid gap-1">
                                        <p className="text-sm font-semibold tracking-[0.16em] text-emerald-700 uppercase">
                                            Galeri
                                        </p>
                                        <h2
                                            id="gallery-heading"
                                            className="text-2xl font-semibold tracking-tight text-slate-950"
                                        >
                                            Sekilas destinasi
                                        </h2>
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    {travelPackage.gallery.map(
                                        (image, index) => (
                                            <a
                                                key={image.id}
                                                href={image.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                aria-label={`Buka foto ${index + 1} ${travelPackage.title} dalam ukuran penuh`}
                                                className="group aspect-[4/3] overflow-hidden rounded-3xl bg-slate-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600"
                                            >
                                                <img
                                                    src={image.thumb_url}
                                                    alt={`Galeri ${travelPackage.title} di ${travelPackage.destination}, foto ${index + 1}`}
                                                    loading="lazy"
                                                    className="size-full object-cover transition duration-500 group-hover:scale-105"
                                                />
                                            </a>
                                        ),
                                    )}
                                </div>
                            </section>
                        )}
                    </div>

                    <aside className="grid gap-6 lg:sticky lg:top-24">
                        <div className="grid gap-6 rounded-[2rem] bg-slate-950 p-7 text-white shadow-xl shadow-slate-950/10">
                            <div className="grid gap-1">
                                <p className="text-sm text-slate-400">
                                    Harga mulai dari
                                </p>
                                <p className="text-3xl font-semibold tracking-tight text-emerald-300">
                                    {rupiahFormatter.format(
                                        Number(travelPackage.price),
                                    )}
                                </p>
                                <p className="text-xs text-slate-400">
                                    per orang
                                </p>
                            </div>

                            <div className="grid gap-3 border-y border-white/10 py-5 text-sm text-slate-300">
                                <SummaryItem icon={MapPin}>
                                    {travelPackage.destination}
                                </SummaryItem>
                                <SummaryItem icon={CalendarDays}>
                                    {travelPackage.duration_days} hari
                                </SummaryItem>
                                <SummaryItem icon={ShieldCheck}>
                                    Konsultasi langsung dengan tim
                                </SummaryItem>
                            </div>

                            {consultationUrl && (
                                <a
                                    href={consultationUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-300"
                                >
                                    <MessageCircle
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                    Tanyakan paket ini
                                </a>
                            )}
                            <p className="text-center text-xs leading-5 text-slate-400">
                                Tim {site.company_name} akan membantu
                                menyesuaikan perjalanan dengan kebutuhan Anda.
                            </p>
                        </div>

                        <Link
                            href={packageIndex()}
                            prefetch
                            className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600"
                        >
                            Lihat paket lainnya
                        </Link>
                    </aside>
                </div>
            </section>
        </>
    );
}

function DetailBadge({
    icon: Icon,
    children,
}: {
    icon: typeof Compass;
    children: ReactNode;
}) {
    return (
        <span className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-slate-100 backdrop-blur">
            <Icon className="size-4 text-emerald-300" aria-hidden="true" />
            {children}
        </span>
    );
}

function SummaryItem({
    icon: Icon,
    children,
}: {
    icon: typeof Compass;
    children: ReactNode;
}) {
    return (
        <div className="flex items-center gap-3">
            <Icon
                className="size-4 shrink-0 text-emerald-300"
                aria-hidden="true"
            />
            <span>{children}</span>
        </div>
    );
}
