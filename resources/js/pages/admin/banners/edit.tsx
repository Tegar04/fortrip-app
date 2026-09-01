import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import BannerForm, { type BannerData } from '@/pages/admin/banners/banner-form';
import { edit, index } from '@/routes/admin/banners';

export default function EditBanner({ banner }: { banner: BannerData }) {
    return (
        <>
            <Head title={`Edit ${banner.title}`} />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <Heading
                    title="Edit banner"
                    description="Perbarui konten, status, atau gambar banner."
                />
                <BannerForm banner={banner} />
            </div>
        </>
    );
}

EditBanner.layout = ({ banner }: { banner: BannerData }) => ({
    breadcrumbs: [
        { title: 'Banners', href: index() },
        { title: banner.title, href: edit(banner.id) },
    ],
});
