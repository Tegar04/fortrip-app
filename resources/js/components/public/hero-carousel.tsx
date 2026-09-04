import { Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import type { PublicBanner } from '@/types';

export default function HeroCarousel({
    banners,
    fallbackTitle,
    fallbackSubtitle,
}: {
    banners: PublicBanner[];
    fallbackTitle: string;
    fallbackSubtitle: string | null;
}) {
    const [activeIndex, setActiveIndex] = useState(0);
    const slides: PublicBanner[] = banners.length
        ? banners
        : [
              {
                  id: 0,
                  title: fallbackTitle,
                  subtitle: fallbackSubtitle,
                  button_text: 'Lihat paket pilihan',
                  button_url: '#packages',
                  image_url: '',
              },
          ];
    const activeSlide = slides[activeIndex];
    const hasMultipleSlides = slides.length > 1;

    const showPrevious = () => {
        setActiveIndex((index) =>
            index === 0 ? slides.length - 1 : index - 1,
        );
    };

    const showNext = () => {
        setActiveIndex((index) =>
            index === slides.length - 1 ? 0 : index + 1,
        );
    };

    return (
        <section
            id="home"
            aria-roledescription="carousel"
            aria-label="Pilihan perjalanan"
            className="relative isolate min-h-[680px] scroll-mt-20 overflow-hidden bg-slate-950 sm:min-h-[720px]"
        >
            {activeSlide.image_url ? (
                <img
                    key={activeSlide.id}
                    src={activeSlide.image_url}
                    alt=""
                    fetchPriority="high"
                    className="motion-safe:animate-in motion-safe:fade-in absolute inset-0 -z-20 size-full object-cover motion-safe:duration-500"
                />
            ) : (
                <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.45),transparent_35%),radial-gradient(circle_at_15%_80%,rgba(14,165,233,0.3),transparent_38%),linear-gradient(135deg,#052e2b,#0f172a_65%)]" />
            )}
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950/90 via-slate-950/65 to-slate-950/20" />
            <div className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-slate-950/60 to-transparent" />

            <div className="mx-auto flex min-h-[680px] max-w-7xl items-center px-5 py-24 sm:min-h-[720px] sm:px-8 lg:px-10">
                <div className="grid max-w-3xl gap-7 text-white">
                    <div className="flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold tracking-[0.18em] uppercase backdrop-blur-sm">
                        <span className="size-2 rounded-full bg-emerald-400" />
                        Perjalanan pilihan untuk Anda
                    </div>
                    <h1 className="text-4xl leading-[1.08] font-semibold tracking-[-0.04em] text-balance sm:text-6xl lg:text-7xl">
                        {activeSlide.title}
                    </h1>
                    {activeSlide.subtitle && (
                        <p className="max-w-2xl text-base leading-8 text-pretty text-slate-200 sm:text-xl">
                            {activeSlide.subtitle}
                        </p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 pt-2">
                        {activeSlide.button_text && activeSlide.button_url && (
                            <HeroAction
                                href={activeSlide.button_url}
                                label={activeSlide.button_text}
                            />
                        )}
                        <a
                            href="#about"
                            className="rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                        >
                            Kenali kami
                        </a>
                    </div>
                </div>
            </div>

            {hasMultipleSlides && (
                <div className="absolute inset-x-0 bottom-8">
                    <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 sm:px-8 lg:px-10">
                        <div className="flex items-center gap-2">
                            {slides.map((slide, index) => (
                                <button
                                    key={slide.id}
                                    type="button"
                                    onClick={() => setActiveIndex(index)}
                                    aria-label={`Tampilkan banner ${index + 1}`}
                                    aria-current={index === activeIndex}
                                    className={`h-1.5 rounded-full transition-all focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white ${
                                        index === activeIndex
                                            ? 'w-10 bg-emerald-400'
                                            : 'w-5 bg-white/40 hover:bg-white/70'
                                    }`}
                                />
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <CarouselButton
                                label="Banner sebelumnya"
                                onClick={showPrevious}
                            >
                                <ArrowLeft aria-hidden="true" />
                            </CarouselButton>
                            <CarouselButton
                                label="Banner berikutnya"
                                onClick={showNext}
                            >
                                <ArrowRight aria-hidden="true" />
                            </CarouselButton>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

function HeroAction({ href, label }: { href: string; label: string }) {
    const className =
        'inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-950/20 transition hover:bg-emerald-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white';
    const content = (
        <>
            {label}
            <ArrowUpRight className="size-4" aria-hidden="true" />
        </>
    );

    if (href.startsWith('http://') || href.startsWith('https://')) {
        return (
            <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className={className}
            >
                {content}
            </a>
        );
    }

    if (href.startsWith('#')) {
        return (
            <a href={href} className={className}>
                {content}
            </a>
        );
    }

    return (
        <Link href={href} className={className}>
            {content}
        </Link>
    );
}

function CarouselButton({
    label,
    onClick,
    children,
}: {
    label: string;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            className="flex size-11 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white [&_svg]:size-4"
        >
            {children}
        </button>
    );
}
