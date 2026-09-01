import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import PackageForm from '@/pages/admin/packages/package-form';
import { create, index } from '@/routes/admin/packages';

export default function CreatePackage() {
    return (
        <>
            <Head title="Buat package" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <Heading
                    title="Buat package"
                    description="Tambahkan paket wisata baru beserta cover dan gallery."
                />
                <PackageForm />
            </div>
        </>
    );
}

CreatePackage.layout = {
    breadcrumbs: [
        { title: 'Packages', href: index() },
        { title: 'Buat package', href: create() },
    ],
};
