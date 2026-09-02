import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import CustomerForm, {
    type CustomerData,
} from '@/pages/admin/customers/customer-form';
import { edit, index } from '@/routes/admin/customers';

export default function EditCustomer({ customer }: { customer: CustomerData }) {
    return (
        <>
            <Head title={`Edit ${customer.name}`} />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <Heading
                    title="Edit customer"
                    description="Perbarui identitas atau kontak pelanggan."
                />
                <CustomerForm customer={customer} />
            </div>
        </>
    );
}

EditCustomer.layout = ({ customer }: { customer: CustomerData }) => ({
    breadcrumbs: [
        { title: 'Customers', href: index() },
        { title: customer.name, href: edit(customer.id) },
    ],
});
