import { Head, Link, router, usePage } from "@inertiajs/react";
import { CalendarDays, FilePlus2, MapPin, Pencil, ReceiptText, Phone, Users } from "lucide-react";
import { updateStatus } from "@/actions/App/Http/Controllers/Admin/BookingController";
import Heading from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, type BookingData } from "@/pages/admin/bookings/booking-form";
import { formatDate, StatusBadge } from "@/pages/admin/bookings/index";
import { edit, index, show } from "@/routes/admin/bookings";
import { create as createInvoice, show as showInvoice } from "@/routes/admin/invoices";

const transitionLabels: Record<string, string> = {
    confirmed: "Konfirmasi booking",
    cancelled: "Batalkan booking",
    completed: "Tandai selesai",
};

export default function ShowBooking({ booking }: { booking: BookingData }) {
    const { auth } = usePage().props;

    function changeStatus(status: string) {
        if (status === "cancelled" && !window.confirm("Batalkan booking ini?")) {
            return;
        }
        router.patch(updateStatus.url(booking.id), { status }, { preserveScroll: true });
    }

    return (
        <>
            <Head title={`Booking #${booking.id}`} />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <Heading
                        title={`Booking #${booking.id}`}
                        description={`${booking.customer.name} — ${booking.package.title}`}
                    />
                    <StatusBadge status={booking.status} />
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-3 text-sm">
                            <p className="text-lg font-semibold">{booking.customer.name}</p>
                            <p className="flex items-center gap-2">
                                <Phone className="text-muted-foreground size-4" />
                                {booking.customer.phone}
                            </p>
                            {booking.customer.email && <p>{booking.customer.email}</p>}
                            {booking.customer.address && (
                                <p className="flex items-start gap-2">
                                    <MapPin className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                                    {booking.customer.address}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Perjalanan</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-3 text-sm">
                            <p className="text-lg font-semibold">{booking.package.title}</p>
                            <p className="text-muted-foreground">{booking.package.destination}</p>
                            <p className="flex items-center gap-2">
                                <CalendarDays className="text-muted-foreground size-4" />
                                {formatDate(booking.departure_date)}
                            </p>
                            <p className="flex items-center gap-2">
                                <Users className="text-muted-foreground size-4" />
                                {booking.participant_count} peserta
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Ringkasan harga</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-2">
                        <div className="flex justify-between gap-4 text-sm">
                            <span className="text-muted-foreground">Harga per peserta</span>
                            <span>{formatCurrency(Number(booking.package.price))}</span>
                        </div>
                        <div className="flex justify-between gap-4 text-sm">
                            <span className="text-muted-foreground">Jumlah peserta</span>
                            <span>{booking.participant_count}</span>
                        </div>
                        <div className="flex justify-between gap-4 border-t pt-3 text-lg font-semibold">
                            <span>Total</span>
                            <span>{formatCurrency(Number(booking.total_price))}</span>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex flex-wrap gap-3">
                    {auth.permissions.viewInvoices && booking.invoice && (
                        <Button asChild>
                            <Link href={showInvoice(booking.invoice.id)}>
                                <ReceiptText />
                                {booking.invoice.invoice_number}
                            </Link>
                        </Button>
                    )}
                    {auth.permissions.createInvoices &&
                        !booking.invoice &&
                        booking.status !== "cancelled" && (
                            <Button asChild>
                                <Link href={createInvoice({ query: { booking_id: booking.id } })}>
                                    <FilePlus2 />
                                    Buat invoice
                                </Link>
                            </Button>
                        )}
                    {auth.permissions.editBookings && booking.status === "pending" && (
                        <Button variant="outline" asChild>
                            <Link href={edit(booking.id)}>
                                <Pencil />
                                Edit booking
                            </Link>
                        </Button>
                    )}
                    {auth.permissions.editBookings &&
                        booking.available_statuses.map((status) => (
                            <Button
                                key={status}
                                variant={status === "cancelled" ? "destructive" : "default"}
                                onClick={() => changeStatus(status)}
                            >
                                {transitionLabels[status] ?? status}
                            </Button>
                        ))}
                    <Button variant="outline" asChild>
                        <Link href={index()}>Kembali</Link>
                    </Button>
                </div>
            </div>
        </>
    );
}

ShowBooking.layout = ({ booking }: { booking: BookingData }) => ({
    breadcrumbs: [
        { title: "Bookings", href: index() },
        { title: `#${booking.id}`, href: show(booking.id) },
    ],
});
