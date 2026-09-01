import { Form, Link, router } from '@inertiajs/react';
import { ImageIcon, Star, Trash2, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    destroyGalleryMedia,
    store,
    update,
} from '@/actions/App/Http/Controllers/Admin/PackageController';
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
import { index } from '@/routes/admin/packages';

export type GalleryImage = {
    id: number;
    url: string;
    thumb_url: string;
};

export type PackageData = {
    id: number;
    title: string;
    slug: string;
    description: string;
    destination: string;
    duration_days: number;
    price: string;
    is_featured: boolean;
    is_active: boolean;
    cover_url: string;
    cover_thumb_url: string;
    gallery: GalleryImage[];
};

type PackageFormData = {
    title: string;
    description: string;
    destination: string;
    duration_days: string;
    price: string;
    is_featured: string;
    is_active: string;
    cover: File | null;
    gallery: File[];
};

export default function PackageForm({
    packageData,
}: {
    packageData?: PackageData;
}) {
    const [isActive, setIsActive] = useState(packageData?.is_active ?? true);
    const [isFeatured, setIsFeatured] = useState(
        packageData?.is_featured ?? false,
    );
    const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(
        packageData?.cover_url || null,
    );
    const [galleryPreviewUrls, setGalleryPreviewUrls] = useState<string[]>([]);

    useEffect(() => {
        return () => {
            if (coverPreviewUrl?.startsWith('blob:')) {
                URL.revokeObjectURL(coverPreviewUrl);
            }
        };
    }, [coverPreviewUrl]);

    useEffect(() => {
        return () => {
            galleryPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [galleryPreviewUrls]);

    function previewCover(file?: File) {
        if (!file) {
            setCoverPreviewUrl(packageData?.cover_url || null);

            return;
        }

        setCoverPreviewUrl(URL.createObjectURL(file));
    }

    function previewGallery(files?: FileList | null) {
        setGalleryPreviewUrls(
            files ? Array.from(files, (file) => URL.createObjectURL(file)) : [],
        );
    }

    function removeGalleryImage(image: GalleryImage) {
        if (!packageData || !window.confirm('Hapus gambar dari gallery?')) {
            return;
        }

        router.delete(
            destroyGalleryMedia.url({
                package: packageData.id,
                media: image.id,
            }),
            { preserveScroll: true },
        );
    }

    const formAction = packageData ? update.form(packageData.id) : store.form();

    return (
        <Form<PackageFormData>
            {...formAction}
            options={{ preserveScroll: true }}
            resetOnSuccess={!packageData}
            className="grid gap-6"
        >
            {({ errors, processing, progress }) => (
                <>
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi package</CardTitle>
                            <CardDescription>
                                Detail utama paket wisata yang akan ditawarkan.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Nama package</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    defaultValue={packageData?.title ?? ''}
                                    required
                                />
                                <InputError message={errors.title} />
                                {packageData && (
                                    <p className="text-muted-foreground text-xs">
                                        Slug saat ini: {packageData.slug}
                                    </p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Deskripsi</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    defaultValue={
                                        packageData?.description ?? ''
                                    }
                                    className="min-h-40"
                                    required
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="grid gap-5 md:grid-cols-3">
                                <div className="grid gap-2 md:col-span-1">
                                    <Label htmlFor="destination">
                                        Destinasi
                                    </Label>
                                    <Input
                                        id="destination"
                                        name="destination"
                                        defaultValue={
                                            packageData?.destination ?? ''
                                        }
                                        placeholder="Bali"
                                        required
                                    />
                                    <InputError message={errors.destination} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="duration_days">
                                        Durasi (hari)
                                    </Label>
                                    <Input
                                        id="duration_days"
                                        name="duration_days"
                                        type="number"
                                        min="1"
                                        max="365"
                                        defaultValue={
                                            packageData?.duration_days ?? 1
                                        }
                                        required
                                    />
                                    <InputError
                                        message={errors.duration_days}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="price">
                                        Harga per orang
                                    </Label>
                                    <Input
                                        id="price"
                                        name="price"
                                        type="number"
                                        min="0"
                                        step="1000"
                                        defaultValue={packageData?.price ?? ''}
                                        placeholder="1500000"
                                        required
                                    />
                                    <InputError message={errors.price} />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <StatusControl
                                    id="is_active"
                                    title="Package aktif"
                                    description="Package aktif dapat ditampilkan dan dipesan pelanggan."
                                    active={isActive}
                                    onToggle={() =>
                                        setIsActive((active) => !active)
                                    }
                                />
                                <StatusControl
                                    id="is_featured"
                                    title="Package unggulan"
                                    description="Package unggulan dapat diprioritaskan di landing page."
                                    active={isFeatured}
                                    onToggle={() =>
                                        setIsFeatured((featured) => !featured)
                                    }
                                    icon={<Star />}
                                />
                            </div>

                            <input
                                type="hidden"
                                name="is_active"
                                value={isActive ? '1' : '0'}
                            />
                            <input
                                type="hidden"
                                name="is_featured"
                                value={isFeatured ? '1' : '0'}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Cover package</CardTitle>
                            <CardDescription>
                                Gambar utama JPEG, PNG, atau WebP maksimal 5 MB.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
                            <div className="grid gap-2">
                                <Label htmlFor="cover">
                                    {packageData
                                        ? 'Ganti cover'
                                        : 'Pilih cover'}
                                </Label>
                                <div className="relative flex min-h-36 items-center justify-center rounded-lg border border-dashed p-6">
                                    <div className="grid justify-items-center gap-2 text-center">
                                        <Upload className="text-muted-foreground size-6" />
                                        <p className="text-muted-foreground text-sm">
                                            Klik untuk memilih gambar cover.
                                        </p>
                                    </div>
                                    <input
                                        id="cover"
                                        name="cover"
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        required={!packageData}
                                        className="absolute inset-0 cursor-pointer opacity-0"
                                        onChange={(event) =>
                                            previewCover(
                                                event.target.files?.[0],
                                            )
                                        }
                                    />
                                </div>
                                <InputError message={errors.cover} />
                            </div>

                            <div className="bg-muted flex aspect-3/2 items-center justify-center overflow-hidden rounded-lg border">
                                {coverPreviewUrl ? (
                                    <img
                                        src={coverPreviewUrl}
                                        alt="Preview cover package"
                                        className="size-full object-cover"
                                    />
                                ) : (
                                    <ImageIcon className="text-muted-foreground size-10" />
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Gallery</CardTitle>
                            <CardDescription>
                                Pilih hingga 12 gambar tambahan dalam satu kali
                                unggah.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-5">
                            {packageData && packageData.gallery.length > 0 && (
                                <div className="grid gap-3">
                                    <Label>Gallery tersimpan</Label>
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                                        {packageData.gallery.map((image) => (
                                            <div
                                                key={image.id}
                                                className="group relative aspect-3/2 overflow-hidden rounded-lg border"
                                            >
                                                <img
                                                    src={
                                                        image.thumb_url ||
                                                        image.url
                                                    }
                                                    alt=""
                                                    className="size-full object-cover"
                                                />
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="destructive"
                                                    className="absolute top-2 right-2"
                                                    aria-label="Hapus gambar gallery"
                                                    onClick={() =>
                                                        removeGalleryImage(
                                                            image,
                                                        )
                                                    }
                                                >
                                                    <Trash2 />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid gap-2">
                                <Label htmlFor="gallery">
                                    Tambah gambar gallery
                                </Label>
                                <Input
                                    id="gallery"
                                    name="gallery[]"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    multiple
                                    onChange={(event) =>
                                        previewGallery(event.target.files)
                                    }
                                />
                                <InputError message={errors.gallery} />
                            </div>

                            {galleryPreviewUrls.length > 0 && (
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                                    {galleryPreviewUrls.map((url, index) => (
                                        <div
                                            key={url}
                                            className="relative aspect-3/2 overflow-hidden rounded-lg border"
                                        >
                                            <img
                                                src={url}
                                                alt={`Preview gallery ${index + 1}`}
                                                className="size-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {progress && (
                                <div className="grid gap-1">
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
                                : packageData
                                  ? 'Simpan perubahan'
                                  : 'Buat package'}
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

function StatusControl({
    id,
    title,
    description,
    active,
    onToggle,
    icon,
}: {
    id: string;
    title: string;
    description: string;
    active: boolean;
    onToggle: () => void;
    icon?: React.ReactNode;
}) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <div className="grid gap-1">
                <Label htmlFor={id}>{title}</Label>
                <p className="text-muted-foreground text-sm">{description}</p>
            </div>
            <Button
                id={id}
                type="button"
                variant={active ? 'default' : 'outline'}
                aria-pressed={active}
                onClick={onToggle}
            >
                {icon}
                {active ? 'Ya' : 'Tidak'}
            </Button>
        </div>
    );
}
