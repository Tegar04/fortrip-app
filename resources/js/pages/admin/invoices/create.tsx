import { Form, Head, Link } from "@inertiajs/react";
import { store } from "@/actions/App/Http/Controllers/Admin/InvoiceController";
import Heading from "@/components/heading";
import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/pages/admin/bookings/booking-form";
import type { BookingOption } from "@/pages/admin/invoices/types";
import { create, index } from "@/routes/admin/invoices";

type InvoiceFormData = { booking_id: string; due_date: string };

export default function CreateInvoice({
    bookings,
    default_due_date: defaultDueDate,
    selected_booking_id: selectedBookingId,
}: {
    bookings: BookingOption[];
    default_due_date: string;
    selected_booking_id: number | null;
}) {
    return (
        <>
            <Head title="Buat invoice" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <Heading
                    title="Buat invoice"
                    description="Nilai invoice diambil otomatis dari total booking."
                />
                <Form<InvoiceFormData> {...store.form()} className="grid gap-6">
                    {({ errors, processing }) => (
                        <>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Detail invoice</CardTitle>
                                    <CardDescription>
                                        Booking yang dibatalkan atau sudah memiliki invoice tidak
                                        ditampilkan.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-5">
                                    <div className="grid gap-2">
                                        <Label htmlFor="booking_id">Booking</Label>
                                        <select
                                            id="booking_id"
                                            name="booking_id"
                                            defaultValue={selectedBookingId ?? ""}
                                            className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-[3px]"
                                            required
                                        >
                                            <option value="" disabled>
                                                Pilih booking
                                            </option>
                                            {bookings.map((booking) => (
                                                <option key={booking.id} value={booking.id}>
                                                    #{booking.id} - {booking.customer_name} -{" "}
                                                    {booking.package_title} (
                                                    {formatCurrency(Number(booking.total_price))})
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.booking_id} />
                                    </div>
                                    <div className="grid gap-2 sm:max-w-xs">
                                        <Label htmlFor="due_date">Jatuh tempo</Label>
                                        <Input
                                            id="due_date"
                                            name="due_date"
                                            type="date"
                                            min={new Date().toISOString().slice(0, 10)}
                                            defaultValue={defaultDueDate}
                                        />
                                        <InputError message={errors.due_date} />
                                    </div>
                                </CardContent>
                            </Card>
                            <div className="flex gap-3">
                                <Button disabled={processing || bookings.length === 0}>
                                    {processing ? "Membuat..." : "Buat invoice"}
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href={index()}>Batal</Link>
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

CreateInvoice.layout = {
    breadcrumbs: [
        { title: "Invoices", href: index() },
        { title: "Buat invoice", href: create() },
    ],
};
