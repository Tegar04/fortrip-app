import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import BookingForm, {
    type CustomerOption,
    type PackageOption,
} from '@/pages/admin/bookings/booking-form';
import { create, index } from '@/routes/admin/bookings';

export default function CreateBooking({
    customers,
    packages,
}: {
    customers: CustomerOption[];
    packages: PackageOption[];
}) {
    return (
        <>
            <Head title="Buat booking" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <Heading
                    title="Buat booking"
                    description="Catat pemesanan baru dan hitung total harga otomatis."
                />
                <BookingForm customers={customers} packages={packages} />
            </div>
        </>
    );
}

CreateBooking.layout = {
    breadcrumbs: [
        { title: 'Bookings', href: index() },
        { title: 'Buat booking', href: create() },
    ],
};
