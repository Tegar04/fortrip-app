import { Quote, Star } from 'lucide-react';
import type { PublicTestimonial } from '@/types';

export default function TestimonialCard({
    testimonial,
}: {
    testimonial: PublicTestimonial;
}) {
    const initials = testimonial.name
        .split(' ')
        .slice(0, 2)
        .map((word) => word.charAt(0))
        .join('')
        .toUpperCase();

    return (
        <article className="grid h-full content-between gap-8 rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm">
            <div className="grid gap-5">
                <Quote className="size-8 text-emerald-200" aria-hidden="true" />
                <blockquote className="leading-7 text-slate-600">
                    “{testimonial.content}”
                </blockquote>
            </div>

            <div className="flex items-center gap-4">
                {testimonial.avatar_url ? (
                    <img
                        src={testimonial.avatar_url}
                        alt={`Foto ${testimonial.name}`}
                        loading="lazy"
                        className="size-12 rounded-full object-cover"
                    />
                ) : (
                    <div
                        aria-hidden="true"
                        className="flex size-12 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-800"
                    >
                        {initials}
                    </div>
                )}
                <div className="grid gap-1">
                    <p className="font-semibold text-slate-900">
                        {testimonial.name}
                    </p>
                    <div
                        className="flex gap-0.5"
                        aria-label={`Rating ${testimonial.rating} dari 5 bintang`}
                    >
                        {Array.from({ length: 5 }, (_, index) => (
                            <Star
                                key={index}
                                aria-hidden="true"
                                className={`size-3.5 ${
                                    index < testimonial.rating
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'fill-slate-100 text-slate-200'
                                }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </article>
    );
}
