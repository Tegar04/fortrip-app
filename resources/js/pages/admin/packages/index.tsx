import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Clock3,
    Eye,
    EyeOff,
    ImageIcon,
    MapPin,
    Pencil,
    Plus,
    Star,
    Trash2,
} from 'lucide-react';
import {
    destroy,
    toggleActive,
    toggleFeatured,
} from '@/actions/App/Http/Controllers/Admin/PackageController';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { PackageData } from '@/pages/admin/packages/package-form';
import { create, edit, index } from '@/routes/admin/packages';

const rupiahFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
});

export default function PackagesIndex({
    packages,
}: {
    packages: PackageData[];
}) {
    const { auth } = usePage().props;

    function deletePackage(packageData: PackageData) {
        if (!window.confirm(`Hapus package "${packageData.title}"?`)) {
            return;
        }

        router.delete(destroy.url(packageData.id), { preserveScroll: true });
    }

    return (
        <>
            <Head title="Packages" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <Heading
                        title="Packages"
                        description="Kelola paket wisata, harga, cover, gallery, dan status publikasi."
                    />
                    {auth.permissions.createPackages && (
                        <Button asChild>
                            <Link href={create()}>
                                <Plus />
                                Buat package
                            </Link>
                        </Button>
                    )}
                </div>

                {packages.length === 0 ? (
                    <Card>
                        <CardContent className="grid min-h-64 place-items-center text-center">
                            <div className="grid justify-items-center gap-3">
                                <div className="bg-muted rounded-full p-4">
                                    <ImageIcon className="text-muted-foreground size-8" />
                                </div>
                                <div className="grid gap-1">
                                    <h2 className="font-semibold">
                                        Belum ada package
                                    </h2>
                                    <p className="text-muted-foreground text-sm">
                                        Tambahkan paket wisata pertama untuk
                                        mulai ditawarkan.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {packages.map((packageData) => (
                            <Card
                                key={packageData.id}
                                className="overflow-hidden pt-0"
                            >
                                <div className="bg-muted flex aspect-3/2 items-center justify-center overflow-hidden">
                                    {packageData.cover_thumb_url ||
                                    packageData.cover_url ? (
                                        <img
                                            src={
                                                packageData.cover_thumb_url ||
                                                packageData.cover_url
                                            }
                                            alt={`Cover ${packageData.title}`}
                                            className="size-full object-cover"
                                        />
                                    ) : (
                                        <ImageIcon className="text-muted-foreground size-10" />
                                    )}
                                </div>

                                <CardContent className="grid gap-4 px-5">
                                    <div className="grid gap-2">
                                        <div className="flex flex-wrap gap-2">
                                            <Badge
                                                variant={
                                                    packageData.is_active
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                            >
                                                {packageData.is_active
                                                    ? 'Aktif'
                                                    : 'Nonaktif'}
                                            </Badge>
                                            {packageData.is_featured && (
                                                <Badge variant="outline">
                                                    <Star className="fill-current" />
                                                    Unggulan
                                                </Badge>
                                            )}
                                        </div>
                                        <h2 className="line-clamp-2 text-lg font-semibold">
                                            {packageData.title}
                                        </h2>
                                        <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-sm">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="size-4" />
                                                {packageData.destination}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock3 className="size-4" />
                                                {packageData.duration_days} hari
                                            </span>
                                        </div>
                                        <p className="text-lg font-semibold">
                                            {rupiahFormatter.format(
                                                Number(packageData.price),
                                            )}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2 border-t pt-4">
                                        {auth.permissions.editPackages && (
                                            <>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        router.patch(
                                                            toggleActive.url(
                                                                packageData.id,
                                                            ),
                                                            {},
                                                            {
                                                                preserveScroll: true,
                                                            },
                                                        )
                                                    }
                                                >
                                                    {packageData.is_active ? (
                                                        <EyeOff />
                                                    ) : (
                                                        <Eye />
                                                    )}
                                                    {packageData.is_active
                                                        ? 'Nonaktifkan'
                                                        : 'Aktifkan'}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        router.patch(
                                                            toggleFeatured.url(
                                                                packageData.id,
                                                            ),
                                                            {},
                                                            {
                                                                preserveScroll: true,
                                                            },
                                                        )
                                                    }
                                                >
                                                    <Star
                                                        className={
                                                            packageData.is_featured
                                                                ? 'fill-current'
                                                                : undefined
                                                        }
                                                    />
                                                    {packageData.is_featured
                                                        ? 'Biasa'
                                                        : 'Unggulkan'}
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="outline"
                                                    asChild
                                                >
                                                    <Link
                                                        href={edit(
                                                            packageData.id,
                                                        )}
                                                        aria-label={`Edit ${packageData.title}`}
                                                    >
                                                        <Pencil />
                                                    </Link>
                                                </Button>
                                            </>
                                        )}
                                        {auth.permissions.deletePackages && (
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="destructive"
                                                aria-label={`Hapus ${packageData.title}`}
                                                onClick={() =>
                                                    deletePackage(packageData)
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

PackagesIndex.layout = {
    breadcrumbs: [{ title: 'Packages', href: index() }],
};
