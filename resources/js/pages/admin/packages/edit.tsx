import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import PackageForm, {
    type PackageData,
} from '@/pages/admin/packages/package-form';
import { edit, index } from '@/routes/admin/packages';

export default function EditPackage({
    package: packageData,
}: {
    package: PackageData;
}) {
    return (
        <>
            <Head title={`Edit ${packageData.title}`} />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <Heading
                    title="Edit package"
                    description="Perbarui informasi, status, cover, atau gallery package."
                />
                <PackageForm packageData={packageData} />
            </div>
        </>
    );
}

EditPackage.layout = ({ package: packageData }: { package: PackageData }) => ({
    breadcrumbs: [
        { title: 'Packages', href: index() },
        { title: packageData.title, href: edit(packageData.id) },
    ],
});
