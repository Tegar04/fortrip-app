import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import CustomerForm from '@/pages/admin/customers/customer-form';
import { create, index } from '@/routes/admin/customers';

export default function CreateCustomer() {
    return (
        <>
            <Head title="Buat customer" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <Heading
                    title="Buat customer"
                    description="Tambahkan data pelanggan baru untuk proses booking."
                />
                <CustomerForm />
            </div>
        </>
    );
}

CreateCustomer.layout = {
    breadcrumbs: [
        { title: 'Customers', href: index() },
        { title: 'Buat customer', href: create() },
    ],
};
