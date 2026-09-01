import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ChevronDown,
    ChevronUp,
    Eye,
    EyeOff,
    GripVertical,
    ImageIcon,
    Pencil,
    Plus,
    Trash2,
} from 'lucide-react';
import { useEffect, useState, type DragEvent } from 'react';
import {
    destroy,
    reorder,
    toggle,
} from '@/actions/App/Http/Controllers/Admin/BannerController';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { BannerData } from '@/pages/admin/banners/banner-form';
import { create, edit, index } from '@/routes/admin/banners';

export default function BannersIndex({ banners }: { banners: BannerData[] }) {
    const { auth } = usePage().props;
    const [orderedBanners, setOrderedBanners] = useState(banners);
    const [draggedBannerId, setDraggedBannerId] = useState<number | null>(null);
    const [isReordering, setIsReordering] = useState(false);

    useEffect(() => {
        setOrderedBanners(banners);
    }, [banners]);

    function persistOrder(nextBanners: BannerData[]) {
        const previousBanners = orderedBanners;
        setOrderedBanners(nextBanners);
        setIsReordering(true);

        router.put(
            reorder.url(),
            { banners: nextBanners.map((banner) => banner.id) },
            {
                preserveScroll: true,
                onError: () => setOrderedBanners(previousBanners),
                onFinish: () => setIsReordering(false),
            },
        );
    }

    function moveBanner(bannerId: number, direction: -1 | 1) {
        const currentIndex = orderedBanners.findIndex(
            (banner) => banner.id === bannerId,
        );
        const destinationIndex = currentIndex + direction;

        if (
            currentIndex < 0 ||
            destinationIndex < 0 ||
            destinationIndex >= orderedBanners.length
        ) {
            return;
        }

        const nextBanners = [...orderedBanners];
        [nextBanners[currentIndex], nextBanners[destinationIndex]] = [
            nextBanners[destinationIndex],
            nextBanners[currentIndex],
        ];
        persistOrder(nextBanners);
    }

    function dropBanner(event: DragEvent, targetBannerId: number) {
        event.preventDefault();

        if (draggedBannerId === null || draggedBannerId === targetBannerId) {
            setDraggedBannerId(null);

            return;
        }

        const sourceIndex = orderedBanners.findIndex(
            (banner) => banner.id === draggedBannerId,
        );
        const targetIndex = orderedBanners.findIndex(
            (banner) => banner.id === targetBannerId,
        );
        const nextBanners = [...orderedBanners];
        const [movedBanner] = nextBanners.splice(sourceIndex, 1);
        nextBanners.splice(targetIndex, 0, movedBanner);

        setDraggedBannerId(null);
        persistOrder(nextBanners);
    }

    function toggleBanner(banner: BannerData) {
        router.patch(toggle.url(banner.id), {}, { preserveScroll: true });
    }

    function deleteBanner(banner: BannerData) {
        if (!window.confirm(`Hapus banner “${banner.title}”?`)) {
            return;
        }

        router.delete(destroy.url(banner.id), { preserveScroll: true });
    }

    return (
        <>
            <Head title="Banners" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <Heading
                        title="Banners"
                        description="Kelola slide hero, status publikasi, dan urutan tampil."
                    />
                    {auth.permissions.createBanners && (
                        <Button asChild>
                            <Link href={create()}>
                                <Plus />
                                Buat banner
                            </Link>
                        </Button>
                    )}
                </div>

                {orderedBanners.length === 0 ? (
                    <Card>
                        <CardContent className="grid min-h-64 place-items-center gap-4 text-center">
                            <div className="grid justify-items-center gap-3">
                                <div className="bg-muted rounded-full p-4">
                                    <ImageIcon className="text-muted-foreground size-8" />
                                </div>
                                <div className="grid gap-1">
                                    <h2 className="font-semibold">
                                        Belum ada banner
                                    </h2>
                                    <p className="text-muted-foreground text-sm">
                                        Tambahkan banner pertama untuk hero
                                        landing page.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-3">
                        <div className="text-muted-foreground flex items-center justify-between text-sm">
                            <p>
                                {auth.permissions.editBanners
                                    ? 'Tarik banner atau gunakan tombol panah untuk mengubah urutan.'
                                    : 'Urutan banner pada landing page.'}
                            </p>
                            {isReordering && <p>Menyimpan urutan...</p>}
                        </div>

                        {orderedBanners.map((banner, bannerIndex) => (
                            <Card
                                key={banner.id}
                                draggable={
                                    auth.permissions.editBanners &&
                                    !isReordering
                                }
                                onDragStart={() =>
                                    setDraggedBannerId(banner.id)
                                }
                                onDragEnd={() => setDraggedBannerId(null)}
                                onDragOver={(event) => event.preventDefault()}
                                onDrop={(event) => dropBanner(event, banner.id)}
                                className={
                                    draggedBannerId === banner.id
                                        ? 'opacity-50'
                                        : undefined
                                }
                            >
                                <CardContent className="flex flex-col gap-4 px-4 sm:flex-row sm:items-center">
                                    {auth.permissions.editBanners && (
                                        <div className="flex items-center gap-1 sm:flex-col">
                                            <GripVertical
                                                className="text-muted-foreground hidden size-5 cursor-grab sm:block"
                                                aria-hidden="true"
                                            />
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="ghost"
                                                disabled={
                                                    bannerIndex === 0 ||
                                                    isReordering
                                                }
                                                aria-label={`Naikkan ${banner.title}`}
                                                onClick={() =>
                                                    moveBanner(banner.id, -1)
                                                }
                                            >
                                                <ChevronUp />
                                            </Button>
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="ghost"
                                                disabled={
                                                    bannerIndex ===
                                                        orderedBanners.length -
                                                            1 || isReordering
                                                }
                                                aria-label={`Turunkan ${banner.title}`}
                                                onClick={() =>
                                                    moveBanner(banner.id, 1)
                                                }
                                            >
                                                <ChevronDown />
                                            </Button>
                                        </div>
                                    )}

                                    <div className="bg-muted flex aspect-video w-full shrink-0 items-center justify-center overflow-hidden rounded-lg sm:w-44">
                                        {banner.thumb_url ||
                                        banner.image_url ? (
                                            <img
                                                src={
                                                    banner.thumb_url ||
                                                    banner.image_url
                                                }
                                                alt=""
                                                className="size-full object-cover"
                                            />
                                        ) : (
                                            <ImageIcon className="text-muted-foreground size-8" />
                                        )}
                                    </div>

                                    <div className="grid min-w-0 flex-1 gap-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-muted-foreground text-sm font-medium">
                                                #{bannerIndex + 1}
                                            </span>
                                            <h2 className="truncate font-semibold">
                                                {banner.title}
                                            </h2>
                                            <Badge
                                                variant={
                                                    banner.is_active
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                            >
                                                {banner.is_active
                                                    ? 'Aktif'
                                                    : 'Nonaktif'}
                                            </Badge>
                                        </div>
                                        {banner.subtitle && (
                                            <p className="text-muted-foreground line-clamp-2 text-sm">
                                                {banner.subtitle}
                                            </p>
                                        )}
                                        {(banner.button_text ||
                                            banner.button_url) && (
                                            <p className="text-muted-foreground truncate text-xs">
                                                Tombol:{' '}
                                                {banner.button_text || '—'} →{' '}
                                                {banner.button_url || '—'}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                                        {auth.permissions.editBanners && (
                                            <>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        toggleBanner(banner)
                                                    }
                                                >
                                                    {banner.is_active ? (
                                                        <EyeOff />
                                                    ) : (
                                                        <Eye />
                                                    )}
                                                    {banner.is_active
                                                        ? 'Nonaktifkan'
                                                        : 'Aktifkan'}
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="outline"
                                                    asChild
                                                >
                                                    <Link
                                                        href={edit(banner.id)}
                                                        aria-label={`Edit ${banner.title}`}
                                                    >
                                                        <Pencil />
                                                    </Link>
                                                </Button>
                                            </>
                                        )}
                                        {auth.permissions.deleteBanners && (
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="destructive"
                                                aria-label={`Hapus ${banner.title}`}
                                                onClick={() =>
                                                    deleteBanner(banner)
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

BannersIndex.layout = {
    breadcrumbs: [{ title: 'Banners', href: index() }],
};
