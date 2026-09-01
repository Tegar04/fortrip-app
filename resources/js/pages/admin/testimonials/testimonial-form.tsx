import { Form, Link } from '@inertiajs/react';
import { ImageIcon, Star, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    store,
    update,
} from '@/actions/App/Http/Controllers/Admin/TestimonialController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { index } from '@/routes/admin/testimonials';

export type TestimonialData = {
    id: number;
    name: string;
    content: string;
    rating: number;
    is_active: boolean;
    photo_url: string;
    avatar_url: string;
};

type TestimonialFormData = {
    name: string;
    content: string;
    rating: string;
    is_active: string;
    photo: File | null;
};

export default function TestimonialForm({
    testimonial,
}: {
    testimonial?: TestimonialData;
}) {
    const [rating, setRating] = useState(testimonial?.rating ?? 5);
    const [isActive, setIsActive] = useState(testimonial?.is_active ?? true);
    const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(
        testimonial?.photo_url || null,
    );

    useEffect(() => {
        return () => {
            if (photoPreviewUrl?.startsWith('blob:')) {
                URL.revokeObjectURL(photoPreviewUrl);
            }
        };
    }, [photoPreviewUrl]);

    function previewPhoto(file?: File) {
        if (!file) {
            setPhotoPreviewUrl(testimonial?.photo_url || null);

            return;
        }

        setPhotoPreviewUrl(URL.createObjectURL(file));
    }

    return (
        <Form<TestimonialFormData>
            {...(testimonial ? update.form(testimonial.id) : store.form())}
            options={{ preserveScroll: true }}
            resetOnSuccess={!testimonial}
            className="grid gap-6"
        >
            {({ errors, processing, progress }) => (
                <>
                    <Card>
                        <CardHeader>
                            <CardTitle>Isi testimonial</CardTitle>
                            <CardDescription>
                                Masukkan nama pelanggan, ulasan, rating, dan
                                status publikasi.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nama pelanggan</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    defaultValue={testimonial?.name ?? ''}
                                    placeholder="Contoh: Budi Santoso"
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="content">Ulasan</Label>
                                <Textarea
                                    id="content"
                                    name="content"
                                    defaultValue={testimonial?.content ?? ''}
                                    className="min-h-36"
                                    placeholder="Ceritakan pengalaman pelanggan..."
                                    required
                                />
                                <InputError message={errors.content} />
                            </div>

                            <div className="grid gap-2">
                                <Label>Rating</Label>
                                <div
                                    className="flex w-fit gap-1"
                                    role="radiogroup"
                                    aria-label="Rating testimonial"
                                >
                                    {[1, 2, 3, 4, 5].map((value) => (
                                        <button
                                            key={value}
                                            type="button"
                                            role="radio"
                                            aria-checked={rating === value}
                                            aria-label={`${value} bintang`}
                                            className="focus-visible:ring-ring rounded-md p-1 focus-visible:ring-2 focus-visible:outline-none"
                                            onClick={() => setRating(value)}
                                        >
                                            <Star
                                                className={cn(
                                                    'size-7 text-amber-500',
                                                    value <= rating &&
                                                        'fill-amber-500',
                                                )}
                                            />
                                        </button>
                                    ))}
                                </div>
                                <p className="text-muted-foreground text-sm">
                                    {rating} dari 5 bintang
                                </p>
                                <InputError message={errors.rating} />
                            </div>

                            <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                                <div className="grid gap-1">
                                    <Label htmlFor="is_active">
                                        Testimonial aktif
                                    </Label>
                                    <p className="text-muted-foreground text-sm">
                                        Testimonial aktif dapat ditampilkan pada
                                        website publik.
                                    </p>
                                </div>
                                <Button
                                    id="is_active"
                                    type="button"
                                    variant={isActive ? 'default' : 'outline'}
                                    aria-pressed={isActive}
                                    onClick={() =>
                                        setIsActive((active) => !active)
                                    }
                                >
                                    {isActive ? 'Ya' : 'Tidak'}
                                </Button>
                            </div>

                            <input type="hidden" name="rating" value={rating} />
                            <input
                                type="hidden"
                                name="is_active"
                                value={isActive ? '1' : '0'}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Foto pelanggan</CardTitle>
                            <CardDescription>
                                Opsional. Gunakan JPEG, PNG, atau WebP maksimal
                                5 MB.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid items-center gap-5 md:grid-cols-[9rem_minmax(0,1fr)]">
                            <div className="bg-muted flex aspect-square items-center justify-center overflow-hidden rounded-full border">
                                {photoPreviewUrl ? (
                                    <img
                                        src={photoPreviewUrl}
                                        alt="Preview foto pelanggan"
                                        className="size-full object-cover"
                                    />
                                ) : (
                                    <ImageIcon className="text-muted-foreground size-9" />
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="photo">
                                    {testimonial?.photo_url
                                        ? 'Ganti foto'
                                        : 'Pilih foto'}
                                </Label>
                                <div className="relative flex min-h-28 items-center justify-center rounded-lg border border-dashed p-5">
                                    <div className="grid justify-items-center gap-2 text-center">
                                        <Upload className="text-muted-foreground size-6" />
                                        <p className="text-muted-foreground text-sm">
                                            Klik untuk memilih foto pelanggan.
                                        </p>
                                    </div>
                                    <input
                                        id="photo"
                                        name="photo"
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        className="absolute inset-0 cursor-pointer opacity-0"
                                        onChange={(event) =>
                                            previewPhoto(
                                                event.target.files?.[0],
                                            )
                                        }
                                    />
                                </div>
                                <InputError message={errors.photo} />
                            </div>

                            {progress && (
                                <div className="grid gap-1 md:col-span-2">
                                    <progress
                                        className="h-2 w-full"
                                        value={progress.percentage}
                                        max="100"
                                    />
                                    <p className="text-muted-foreground text-xs">
                                        Mengunggah {progress.percentage}%
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex items-center gap-3">
                        <Button disabled={processing}>
                            {processing
                                ? 'Menyimpan...'
                                : testimonial
                                  ? 'Simpan perubahan'
                                  : 'Buat testimonial'}
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={index()}>Batal</Link>
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}
