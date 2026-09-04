import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PaginationLink } from '@/types';

type Props = {
    links: PaginationLink[];
};

export default function PublicPagination({ links }: Props) {
    if (links.length <= 3) {
        return null;
    }

    const previous = links[0];
    const next = links.at(-1);
    const pages = links.slice(1, -1);

    return (
        <nav
            aria-label="Navigasi halaman paket"
            className="flex flex-wrap items-center justify-center gap-2"
        >
            <PaginationArrow
                link={previous}
                label="Halaman sebelumnya"
                direction="previous"
            />

            <div className="hidden items-center gap-2 sm:flex">
                {pages.map((link) =>
                    link.url ? (
                        <Link
                            key={link.label}
                            href={link.url}
                            preserveScroll
                            prefetch
                            aria-current={link.active ? 'page' : undefined}
                            className={
                                link.active
                                    ? 'flex size-10 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white shadow-sm'
                                    : 'flex size-10 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600'
                            }
                        >
                            {link.label}
                        </Link>
                    ) : (
                        <span
                            key={link.label}
                            aria-hidden="true"
                            className="flex size-10 items-center justify-center text-slate-400"
                        >
                            {link.label}
                        </span>
                    ),
                )}
            </div>

            <PaginationArrow
                link={next}
                label="Halaman berikutnya"
                direction="next"
            />
        </nav>
    );
}

function PaginationArrow({
    link,
    label,
    direction,
}: {
    link: PaginationLink | undefined;
    label: string;
    direction: 'previous' | 'next';
}) {
    const Icon = direction === 'previous' ? ChevronLeft : ChevronRight;

    if (!link?.url) {
        return (
            <span
                aria-disabled="true"
                className="flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-400"
            >
                {direction === 'previous' && (
                    <Icon className="size-4" aria-hidden="true" />
                )}
                <span className="hidden sm:inline">
                    {direction === 'previous' ? 'Sebelumnya' : 'Berikutnya'}
                </span>
                {direction === 'next' && (
                    <Icon className="size-4" aria-hidden="true" />
                )}
            </span>
        );
    }

    return (
        <Link
            href={link.url}
            preserveScroll
            prefetch
            aria-label={label}
            className="flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
        >
            {direction === 'previous' && (
                <Icon className="size-4" aria-hidden="true" />
            )}
            <span className="hidden sm:inline">
                {direction === 'previous' ? 'Sebelumnya' : 'Berikutnya'}
            </span>
            {direction === 'next' && (
                <Icon className="size-4" aria-hidden="true" />
            )}
        </Link>
    );
}
