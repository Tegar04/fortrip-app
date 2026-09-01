import { Form, Link } from '@inertiajs/react';
import { ImageIcon, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    store,
    update,
} from '@/actions/App/Http/Controllers/Admin/BannerController';
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
import { index } from '@/routes/admin/banners';

export type BannerData = {
    id: number;
    title: string;
    subtitle: string | null;
    button_text: string | null;
    button_url: string | null;
    order: number;
    is_active: boolean;
    image_url: string;
    thumb_url: string;
};

type BannerFormData = {
    title: string;
    subtitle: string;
    button_text: string;
    button_url: string;
    is_active: string;
    image: File | null;
};

export default function BannerForm({ banner }: { banner?: BannerData }) {
    const [isActive, setIsActive] = useState(banner?.is_active ?? true);
    const [previewUrl, setPreviewUrl] = useState<string | null>(
        banner?.image_url || null,
    );

    useEffect(() => {
        return () => {
            if (previewUrl?.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    function previewImage(file?: File) {
        if (!file) {
            setPreviewUrl(banner?.image_url || null);

            return;
        }

        setPreviewUrl(URL.createObjectURL(file));
    }

    const formAction = banner ? update.form(banner.id) : store.form();

    return (
        <Form<BannerFormData>
            {...formAction}
            options={{ preserveScroll: true }}
            resetOnSuccess={!banner}
            className="grid gap-6"
        >
            {({ errors, processing, progress }) => (
                <>
                    <Card>
                        <CardHeader>
                            <CardTitle>Konten banner</CardTitle>
                            <CardDescription>
                                Teks dan tombol yang tampil pada slide hero.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Judul</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    defaultValue={banner?.title ?? ''}
                                    required
                                />
                                <InputError message={errors.title} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="subtitle">Subjudul</Label>
                                <Textarea
                                    id="subtitle"
                                    name="subtitle"
                                    defaultValue={banner?.subtitle ?? ''}
                                />
                                <InputError message={errors.subtitle} />
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="button_text">
                                        Teks tombol
                                    </Label>
                                    <Input
                                        id="button_text"
                                        name="button_text"
                                        defaultValue={banner?.button_text ?? ''}
                                        placeholder="Lihat paket"
                                    />
                                    <InputError message={errors.button_text} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="button_url">
                                        Tujuan tombol
                                    </Label>
                                    <Input
                                        id="button_url"
                                        name="button_url"
                                        defaultValue={banner?.button_url ?? ''}
                                        placeholder="/packages atau https://..."
                                    />
                                    <InputError message={errors.button_url} />
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                                <div className="grid gap-1">
                                    <Label htmlFor="is_active">
                                        Status aktif
                                    </Label>
                                    <p className="text-muted-foreground text-sm">
                                        Banner aktif dapat ditampilkan pada
                                        landing page.
                                    </p>
                                </div>
                                <input
                                    type="hidden"
                                    name="is_active"
                                    value={isActive ? '1' : '0'}
                                />
                                <Button
                                    id="is_active"
                                    type="button"
                                    variant={isActive ? 'default' : 'outline'}
                                    aria-pressed={isActive}
                                    onClick={() =>
                                        setIsActive((active) => !active)
                                    }
                                >
                                    {isActive ? 'Aktif' : 'Nonaktif'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Gambar banner</CardTitle>
                            <CardDescription>
                                Gunakan gambar lanskap JPEG, PNG, atau WebP
                                maksimal 5 MB.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
                            <div className="grid gap-2">
                                <Label htmlFor="image">
                                    {banner ? 'Ganti gambar' : 'Pilih gambar'}
                                </Label>
                                <div className="relative flex min-h-32 items-center justify-center rounded-lg border border-dashed p-6">
                                    <div className="grid justify-items-center gap-2 text-center">
                                        <Upload className="text-muted-foreground size-6" />
                                        <p className="text-muted-foreground text-sm">
                                            Klik untuk memilih gambar dari
                                            perangkat.
                                        </p>
                                    </div>
                                    <input
                                        id="image"
                                        name="image"
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        required={!banner}
                                        className="absolute inset-0 cursor-pointer opacity-0"
                                        onChange={(event) =>
                                            previewImage(
                                                event.target.files?.[0],
                                            )
                                        }
                                    />
                                </div>
                                <InputError message={errors.image} />
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
                            </div>

                            <div className="bg-muted flex aspect-video items-center justify-center overflow-hidden rounded-lg border">
                                {previewUrl ? (
                                    <img
                                        src={previewUrl}
                                        alt="Preview banner"
                                        className="size-full object-cover"
                                    />
                                ) : (
                                    <ImageIcon className="text-muted-foreground size-10" />
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center gap-3">
                        <Button disabled={processing}>
                            {processing
                                ? 'Menyimpan...'
                                : banner
                                  ? 'Simpan perubahan'
                                  : 'Buat banner'}
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
