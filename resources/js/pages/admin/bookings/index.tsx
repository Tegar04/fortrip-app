import { Head, Link, router, usePage } from '@inertiajs/react';
import { CalendarCheck2, Eye, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { destroy } from '@/actions/App/Http/Controllers/Admin/BookingController';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    formatCurrency,
    type BookingData,
} from '@/pages/admin/bookings/booking-form';
import { create, edit, show } from '@/routes/admin/bookings';

const statusLabels: Record<string, string> = {
    pending: 'Pending',
    confirmed: 'Dikonfirmasi',
    cancelled: 'Dibatalkan',
    completed: 'Selesai',
};

export default function BookingsIndex({
    bookings,
}: {
    bookings: BookingData[];
}) {
    const { auth } = usePage().props;

    function deleteBooking(booking: BookingData) {
        if (!window.confirm(`Hapus booking #${booking.id}?`)) {
            return;
        }
        router.delete(destroy.url(booking.id), { preserveScroll: true });
    }

    return (
        <>
            <Head title="Bookings" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <Heading
                        title="Bookings"
                        description="Pantau pemesanan, total harga, tanggal berangkat, dan status."
                    />
                    {auth.permissions.createBookings && (
                        <Button asChild>
                            <Link href={create()}>
                                <Plus />
                                Buat booking
                            </Link>
                        </Button>
                    )}
                </div>

                {bookings.length === 0 ? (
                    <Card>
                        <CardContent className="grid min-h-64 place-items-center text-center">
                            <div className="grid justify-items-center gap-3">
                                <div className="bg-muted rounded-full p-4">
                                    <CalendarCheck2 className="text-muted-foreground size-8" />
                                </div>
                                <div>
                                    <h2 className="font-semibold">
                                        Belum ada booking
                                    </h2>
                                    <p className="text-muted-foreground text-sm">
                                        Buat booking pertama dari data customer
                                        dan package.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 lg:grid-cols-2">
                        {bookings.map((booking) => (
                            <Card key={booking.id}>
                                <CardContent className="grid h-full gap-4 px-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-muted-foreground text-xs">
                                                Booking #{booking.id}
                                            </p>
                                            <h2 className="font-semibold">
                                                {booking.customer.name}
                                            </h2>
                                            <p className="text-muted-foreground text-sm">
                                                {booking.package.title}
                                            </p>
                                        </div>
                                        <StatusBadge status={booking.status} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 rounded-lg border p-3 text-sm">
                                        <div>
                                            <p className="text-muted-foreground text-xs">
                                                Keberangkatan
                                            </p>
                                            <p className="font-medium">
                                                {formatDate(
                                                    booking.departure_date,
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-xs">
                                                Peserta
                                            </p>
                                            <p className="flex items-center gap-1 font-medium">
                                                <Users className="size-4" />
                                                {booking.participant_count}
                                            </p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-muted-foreground text-xs">
                                                Total
                                            </p>
                                            <p className="font-semibold">
                                                {formatCurrency(
                                                    Number(booking.total_price),
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-auto flex flex-wrap gap-2 border-t pt-4">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            asChild
                                        >
                                            <Link href={show(booking.id)}>
                                                <Eye />
                                                Detail
                                            </Link>
                                        </Button>
                                        {auth.permissions.editBookings &&
                                            booking.status === 'pending' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    asChild
                                                >
                                                    <Link
                                                        href={edit(booking.id)}
                                                    >
                                                        <Pencil />
                                                        Edit
                                                    </Link>
                                                </Button>
                                            )}
                                        {auth.permissions.deleteBookings && (
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() =>
                                                    deleteBooking(booking)
                                                }
                                            >
                                                <Trash2 />
                                                Hapus
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

export function StatusBadge({ status }: { status: string }) {
    return (
        <Badge
            variant={
                status === 'cancelled'
                    ? 'destructive'
                    : status === 'pending'
                      ? 'secondary'
                      : 'default'
            }
        >
            {statusLabels[status] ?? status}
        </Badge>
    );
}

export function formatDate(value: string): string {
    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'long',
        timeZone: 'UTC',
    }).format(new Date(`${value}T00:00:00Z`));
}
