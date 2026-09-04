import { Head } from '@inertiajs/react';
import {
    ArrowRight,
    CheckCircle2,
    Compass,
    MessageCircle,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';
import HeroCarousel from '@/components/public/hero-carousel';
import PackageCard from '@/components/public/package-card';
import SectionHeading from '@/components/public/section-heading';
import TestimonialCard from '@/components/public/testimonial-card';
import type {
    HomeContent,
    PublicBanner,
    PublicPackage,
    PublicSite,
    PublicTestimonial,
    SeoMeta,
} from '@/types';

type Props = {
    site: PublicSite;
    content: HomeContent;
    seo: SeoMeta;
    banners: PublicBanner[];
    featured_packages: PublicPackage[];
    testimonials: PublicTestimonial[];
};

export default function Home({
    site,
    content,
    seo,
    banners,
    featured_packages: featuredPackages,
    testimonials,
}: Props) {
    const socialImage =
        banners.find((banner) => banner.image_url)?.image_url ??
        featuredPackages.find((travelPackage) => travelPackage.cover_url)
            ?.cover_url;

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

            <HeroCarousel
                banners={banners}
                fallbackTitle={content.hero_title}
                fallbackSubtitle={content.hero_subtitle}
            />

            <section
                id="about"
                className="scroll-mt-20 overflow-hidden bg-white py-20 sm:py-28"
            >
                <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20 lg:px-10">
                    <div className="grid gap-8">
                        <SectionHeading
                            eyebrow="Tentang Kami"
                            title={content.about_title}
                            description={content.about_description}
                            align="left"
                        />
                        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                            <ValuePoint
                                icon={Compass}
                                title="Pilihan terkurasi"
                            />
                            <ValuePoint
                                icon={ShieldCheck}
                                title="Perjalanan nyaman"
                            />
                            <ValuePoint
                                icon={Sparkles}
                                title="Layanan personal"
                            />
                        </div>
                        {site.whatsapp_url && (
                            <a
                                href={site.whatsapp_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex w-fit items-center gap-2 rounded-full text-sm font-semibold text-emerald-700 transition hover:text-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600"
                            >
                                Ceritakan rencana perjalanan Anda
                                <ArrowRight
                                    className="size-4"
                                    aria-hidden="true"
                                />
                            </a>
                        )}
                    </div>

                    <AboutVisual packages={featuredPackages} />
                </div>
            </section>

            <section
                id="packages"
                className="scroll-mt-20 bg-slate-50 py-20 sm:py-28"
            >
                <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:px-10">
                    <SectionHeading
                        eyebrow="Jelajahi Destinasi"
                        title={content.packages_title}
                        description={content.packages_subtitle}
                    />

                    {featuredPackages.length > 0 ? (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {featuredPackages.map((travelPackage) => (
                                <PackageCard
                                    key={travelPackage.id}
                                    travelPackage={travelPackage}
                                    whatsappUrl={site.whatsapp_url}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="mx-auto grid max-w-xl justify-items-center gap-5 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
                            <span className="flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                                <Compass
                                    className="size-6"
                                    aria-hidden="true"
                                />
                            </span>
                            <div className="grid gap-2">
                                <h3 className="font-semibold text-slate-900">
                                    Paket pilihan sedang kami siapkan
                                </h3>
                                <p className="text-sm leading-6 text-slate-600">
                                    Hubungi tim kami untuk mendapatkan
                                    rekomendasi perjalanan yang paling sesuai.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {testimonials.length > 0 && (
                <section
                    id="testimonials"
                    className="scroll-mt-20 bg-white py-20 sm:py-28"
                >
                    <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:px-10">
                        <SectionHeading
                            eyebrow="Testimoni"
                            title={content.testimonials_title}
                            description={content.testimonials_subtitle}
                        />
                        <div className="grid items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {testimonials.map((testimonial) => (
                                <TestimonialCard
                                    key={testimonial.id}
                                    testimonial={testimonial}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <section className="bg-white px-5 pb-20 sm:px-8 sm:pb-28 lg:px-10">
                <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-emerald-700 px-6 py-14 text-white shadow-2xl shadow-emerald-950/15 sm:px-12 sm:py-16 lg:px-20">
                    <div className="absolute -top-24 -right-24 size-72 rounded-full border-[40px] border-white/5" />
                    <div className="absolute -bottom-32 -left-20 size-80 rounded-full bg-emerald-400/15 blur-3xl" />
                    <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
                        <div className="grid max-w-3xl gap-4">
                            <p className="text-sm font-semibold tracking-[0.2em] text-emerald-200 uppercase">
                                Mulai Perjalanan
                            </p>
                            <h2 className="text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl">
                                {content.cta_title}
                            </h2>
                            {content.cta_description && (
                                <p className="max-w-2xl leading-7 text-emerald-50/85">
                                    {content.cta_description}
                                </p>
                            )}
                        </div>
                        {site.whatsapp_url && (
                            <a
                                href={site.whatsapp_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-emerald-800 shadow-lg transition hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                            >
                                <MessageCircle
                                    className="size-4"
                                    aria-hidden="true"
                                />
                                {content.cta_button_text}
                            </a>
                        )}
                    </div>
                </div>
            </section>
        </>
    );
}

function ValuePoint({
    icon: Icon,
    title,
}: {
    icon: typeof Compass;
    title: string;
}) {
    return (
        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <Icon className="size-4" aria-hidden="true" />
            </span>
            <span className="text-sm font-medium text-slate-700">{title}</span>
        </div>
    );
}

function AboutVisual({ packages }: { packages: PublicPackage[] }) {
    const primaryImage = packages.find(
        (travelPackage) => travelPackage.cover_url,
    );
    const secondaryImage = packages.find(
        (travelPackage) =>
            travelPackage.id !== primaryImage?.id && travelPackage.cover_url,
    );

    return (
        <div className="relative mx-auto w-full max-w-xl pb-12 pl-8 sm:pb-16 sm:pl-16">
            <div className="aspect-[4/5] overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-100 via-sky-100 to-amber-50 shadow-2xl shadow-slate-900/10">
                {primaryImage?.cover_url ? (
                    <img
                        src={primaryImage.cover_url}
                        alt={`Destinasi ${primaryImage.destination}`}
                        loading="lazy"
                        className="size-full object-cover"
                    />
                ) : (
                    <div className="flex size-full items-center justify-center text-emerald-700/40">
                        <Compass className="size-20" aria-hidden="true" />
                    </div>
                )}
            </div>
            <div className="absolute bottom-0 left-0 w-2/5 overflow-hidden rounded-3xl border-8 border-white bg-emerald-100 shadow-xl">
                <div className="aspect-square">
                    {secondaryImage?.cover_url ? (
                        <img
                            src={secondaryImage.cover_url}
                            alt={`Destinasi ${secondaryImage.destination}`}
                            loading="lazy"
                            className="size-full object-cover"
                        />
                    ) : (
                        <div className="flex size-full items-center justify-center bg-emerald-600 text-white">
                            <CheckCircle2
                                className="size-12"
                                aria-hidden="true"
                            />
                        </div>
                    )}
                </div>
            </div>
            <div className="absolute top-8 right-0 rounded-2xl bg-white px-5 py-4 shadow-xl shadow-slate-900/10">
                <p className="text-xs font-medium text-slate-500">
                    Destinasi pilihan
                </p>
                <p className="mt-1 font-semibold text-emerald-700">
                    Jelajahi Indonesia
                </p>
            </div>
        </div>
    );
}
