import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import BookingForm, {
    type BookingData,
    type CustomerOption,
    type PackageOption,
} from '@/pages/admin/bookings/booking-form';
import { edit, index } from '@/routes/admin/bookings';

export default function EditBooking({
    booking,
    customers,
    packages,
}: {
    booking: BookingData;
    customers: CustomerOption[];
    packages: PackageOption[];
}) {
    return (
        <>
            <Head title={`Edit booking #${booking.id}`} />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <Heading
                    title={`Edit booking #${booking.id}`}
                    description="Booking hanya dapat diubah selama masih pending."
                />
                <BookingForm
                    booking={booking}
                    customers={customers}
                    packages={packages}
                />
            </div>
        </>
    );
}

EditBooking.layout = ({ booking }: { booking: BookingData }) => ({
    breadcrumbs: [
        { title: 'Bookings', href: index() },
        { title: `#${booking.id}`, href: edit(booking.id) },
    ],
});
