import { Link } from '@inertiajs/react';
import {
    ArrowUpRight,
    CalendarDays,
    MapPin,
    MessageCircle,
} from 'lucide-react';
import { show as showPackage } from '@/routes/packages';
import type { PublicPackage } from '@/types';

const rupiahFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
});

export default function PackageCard({
    travelPackage,
    whatsappUrl,
}: {
    travelPackage: PublicPackage;
    whatsappUrl: string | null;
}) {
    const consultationUrl = whatsappUrl
        ? `${whatsappUrl}${whatsappUrl.includes('?') ? '&' : '?'}text=${encodeURIComponent(
              `Halo, saya tertarik dengan ${travelPackage.title}. Bisa berikan informasi lebih lanjut?`,
          )}`
        : null;

    return (
        <article className="group overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/8">
            <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-emerald-100 to-sky-100">
                {travelPackage.cover_url ? (
                    <img
                        src={travelPackage.cover_url}
                        alt={`Pemandangan ${travelPackage.destination} untuk ${travelPackage.title}`}
                        loading="lazy"
                        className="size-full object-cover transition duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex size-full items-center justify-center text-emerald-700/50">
                        <MapPin className="size-12" aria-hidden="true" />
                    </div>
                )}
                <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur">
                    <MapPin
                        className="size-3.5 text-emerald-600"
                        aria-hidden="true"
                    />
                    {travelPackage.destination}
                </div>
            </div>

            <div className="grid gap-5 p-6">
                <div className="grid gap-3">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <CalendarDays
                            className="size-4 text-emerald-600"
                            aria-hidden="true"
                        />
                        {travelPackage.duration_days} hari perjalanan
                    </div>
                    <h3 className="text-xl leading-snug font-semibold tracking-tight text-slate-950">
                        {travelPackage.title}
                    </h3>
                    {travelPackage.excerpt && (
                        <p className="line-clamp-3 text-sm leading-6 text-slate-600">
                            {travelPackage.excerpt}
                        </p>
                    )}
                </div>

                <div className="flex flex-wrap items-end justify-between gap-4 border-t border-slate-100 pt-5">
                    <div>
                        <p className="text-xs text-slate-500">Mulai dari</p>
                        <p className="font-semibold text-emerald-700">
                            {rupiahFormatter.format(
                                Number(travelPackage.price),
                            )}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href={showPackage(travelPackage.slug)}
                            prefetch
                            aria-label={`Lihat detail ${travelPackage.title}`}
                            className="inline-flex h-10 items-center gap-1.5 rounded-full bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                        >
                            Detail
                            <ArrowUpRight
                                className="size-4"
                                aria-hidden="true"
                            />
                        </Link>
                        {consultationUrl && (
                            <a
                                href={consultationUrl}
                                target="_blank"
                                rel="noreferrer"
                                aria-label={`Tanyakan ${travelPackage.title} melalui WhatsApp`}
                                className="flex size-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 transition hover:bg-emerald-600 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                            >
                                <MessageCircle
                                    className="size-4"
                                    aria-hidden="true"
                                />
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
}
