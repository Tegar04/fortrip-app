import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import BannerForm from '@/pages/admin/banners/banner-form';
import { create, index } from '@/routes/admin/banners';

export default function CreateBanner() {
    return (
        <>
            <Head title="Buat banner" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <Heading
                    title="Buat banner"
                    description="Tambahkan slide baru untuk hero landing page."
                />
                <BannerForm />
            </div>
        </>
    );
}

CreateBanner.layout = {
    breadcrumbs: [
        { title: 'Banners', href: index() },
        { title: 'Buat banner', href: create() },
    ],
};
