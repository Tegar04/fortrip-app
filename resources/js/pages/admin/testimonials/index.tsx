import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Eye,
    EyeOff,
    MessageSquareQuote,
    Pencil,
    Plus,
    Star,
    Trash2,
    UserRound,
} from 'lucide-react';
import {
    destroy,
    toggle,
} from '@/actions/App/Http/Controllers/Admin/TestimonialController';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { TestimonialData } from '@/pages/admin/testimonials/testimonial-form';
import { create, edit, index } from '@/routes/admin/testimonials';

export default function TestimonialsIndex({
    testimonials,
}: {
    testimonials: TestimonialData[];
}) {
    const { auth } = usePage().props;

    function deleteTestimonial(testimonial: TestimonialData) {
        if (!window.confirm(`Hapus testimonial dari "${testimonial.name}"?`)) {
            return;
        }

        router.delete(destroy.url(testimonial.id), { preserveScroll: true });
    }

    return (
        <>
            <Head title="Testimonials" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <Heading
                        title="Testimonials"
                        description="Kelola ulasan, rating, foto pelanggan, dan status publikasi."
                    />
                    {auth.permissions.createTestimonials && (
                        <Button asChild>
                            <Link href={create()}>
                                <Plus />
                                Buat testimonial
                            </Link>
                        </Button>
                    )}
                </div>

                {testimonials.length === 0 ? (
                    <Card>
                        <CardContent className="grid min-h-64 place-items-center text-center">
                            <div className="grid justify-items-center gap-3">
                                <div className="bg-muted rounded-full p-4">
                                    <MessageSquareQuote className="text-muted-foreground size-8" />
                                </div>
                                <div className="grid gap-1">
                                    <h2 className="font-semibold">
                                        Belum ada testimonial
                                    </h2>
                                    <p className="text-muted-foreground text-sm">
                                        Tambahkan ulasan pelanggan pertama.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {testimonials.map((testimonial) => (
                            <Card key={testimonial.id}>
                                <CardContent className="grid h-full gap-5 px-5">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-muted flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full border">
                                            {testimonial.avatar_url ||
                                            testimonial.photo_url ? (
                                                <img
                                                    src={
                                                        testimonial.avatar_url ||
                                                        testimonial.photo_url
                                                    }
                                                    alt={`Foto ${testimonial.name}`}
                                                    className="size-full object-cover"
                                                />
                                            ) : (
                                                <UserRound className="text-muted-foreground size-6" />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h2 className="truncate font-semibold">
                                                {testimonial.name}
                                            </h2>
                                            <div
                                                className="flex gap-0.5"
                                                aria-label={`${testimonial.rating} dari 5 bintang`}
                                            >
                                                {[1, 2, 3, 4, 5].map(
                                                    (value) => (
                                                        <Star
                                                            key={value}
                                                            className={`size-4 text-amber-500 ${
                                                                value <=
                                                                testimonial.rating
                                                                    ? 'fill-amber-500'
                                                                    : ''
                                                            }`}
                                                        />
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                        <Badge
                                            variant={
                                                testimonial.is_active
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                        >
                                            {testimonial.is_active
                                                ? 'Aktif'
                                                : 'Nonaktif'}
                                        </Badge>
                                    </div>

                                    <blockquote className="text-muted-foreground line-clamp-5 text-sm leading-relaxed">
                                        “{testimonial.content}”
                                    </blockquote>

                                    <div className="mt-auto flex flex-wrap gap-2 border-t pt-4">
                                        {auth.permissions.editTestimonials && (
                                            <>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        router.patch(
                                                            toggle.url(
                                                                testimonial.id,
                                                            ),
                                                            {},
                                                            {
                                                                preserveScroll: true,
                                                            },
                                                        )
                                                    }
                                                >
                                                    {testimonial.is_active ? (
                                                        <EyeOff />
                                                    ) : (
                                                        <Eye />
                                                    )}
                                                    {testimonial.is_active
                                                        ? 'Nonaktifkan'
                                                        : 'Aktifkan'}
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="outline"
                                                    asChild
                                                >
                                                    <Link
                                                        href={edit(
                                                            testimonial.id,
                                                        )}
                                                        aria-label={`Edit ${testimonial.name}`}
                                                    >
                                                        <Pencil />
                                                    </Link>
                                                </Button>
                                            </>
                                        )}
                                        {auth.permissions
                                            .deleteTestimonials && (
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="destructive"
                                                aria-label={`Hapus ${testimonial.name}`}
                                                onClick={() =>
                                                    deleteTestimonial(
                                                        testimonial,
                                                    )
                                                }
                                            >
                                                <Trash2 />
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

TestimonialsIndex.layout = {
    breadcrumbs: [{ title: 'Testimonials', href: index() }],
};
