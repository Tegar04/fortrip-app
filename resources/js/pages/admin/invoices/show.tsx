import { Form, Head, Link, router, usePage } from "@inertiajs/react";
import { Download, MapPin, Trash2 } from "lucide-react";
import { download } from "@/actions/App/Http/Controllers/Admin/InvoiceController";
import {
    destroy as destroyPayment,
    store as storePayment,
} from "@/actions/App/Http/Controllers/Admin/PaymentController";
import Heading from "@/components/heading";
import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/pages/admin/bookings/booking-form";
import { formatDate } from "@/pages/admin/bookings/index";
import { InvoiceStatusBadge } from "@/pages/admin/invoices/index";
import type { InvoiceData } from "@/pages/admin/invoices/types";
import { index, show } from "@/routes/admin/invoices";

const paymentMethodLabels: Record<string, string> = {
    cash: "Tunai",
    bank_transfer: "Transfer bank",
    ewallet: "E-wallet",
    payment_gateway: "Payment gateway",
};
const paymentStatusLabels: Record<string, string> = {
    pending: "Pending",
    paid: "Berhasil",
    failed: "Gagal",
};
type PaymentFormData = {
    payment_reference: string;
    amount: string;
    payment_method: string;
    status: string;
    notes: string;
};

export default function ShowInvoice({ invoice }: { invoice: InvoiceData }) {
    const { auth } = usePage().props;
    function removePayment(paymentId: number) {
        if (window.confirm("Hapus catatan pembayaran ini?"))
            router.delete(destroyPayment.url([invoice.id, paymentId]), { preserveScroll: true });
    }

    return (
        <>
            <Head title={invoice.invoice_number} />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <Heading
                        title={invoice.invoice_number}
                        description={`Booking #${invoice.booking.id} - ${invoice.booking.customer.name}`}
                    />
                    <div className="flex items-center gap-2">
                        <InvoiceStatusBadge status={invoice.status} />
                        {auth.permissions.downloadInvoices && (
                            <Button variant="outline" asChild>
                                <a href={download.url(invoice.id)}>
                                    <Download />
                                    Unduh PDF
                                </a>
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-2 text-sm">
                            <p className="text-lg font-semibold">{invoice.booking.customer.name}</p>
                            <p>{invoice.booking.customer.phone}</p>
                            {invoice.booking.customer.email && (
                                <p>{invoice.booking.customer.email}</p>
                            )}
                            {invoice.booking.customer.address && (
                                <p className="flex items-start gap-2">
                                    <MapPin className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                                    {invoice.booking.customer.address}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Perjalanan</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-2 text-sm">
                            <p className="text-lg font-semibold">{invoice.booking.package.title}</p>
                            <p className="text-muted-foreground">
                                {invoice.booking.package.destination}
                            </p>
                            <p>Keberangkatan: {formatDate(invoice.booking.departure_date)}</p>
                            <p>
                                {invoice.booking.participant_count} peserta x{" "}
                                {formatCurrency(Number(invoice.booking.package.price))}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Ringkasan tagihan</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                        <div className="grid gap-3 sm:grid-cols-3">
                            <Summary label="Total invoice" value={invoice.amount} />
                            <Summary label="Sudah dibayar" value={invoice.paid_amount} />
                            <Summary
                                label="Sisa tagihan"
                                value={invoice.remaining_amount}
                                emphasized
                            />
                        </div>
                        <p className="text-muted-foreground text-xs">
                            Terbit {formatDate(invoice.issued_date)} - jatuh tempo{" "}
                            {invoice.due_date ? formatDate(invoice.due_date) : "-"}
                        </p>
                    </CardContent>
                </Card>

                {auth.permissions.editInvoices && Number(invoice.remaining_amount) > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Catat pembayaran</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Form<PaymentFormData>
                                {...storePayment.form(invoice.id)}
                                options={{ preserveScroll: true }}
                                resetOnSuccess
                                className="grid gap-4"
                            >
                                {({ errors, processing }) => (
                                    <>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="grid gap-2">
                                                <Label htmlFor="amount">Jumlah</Label>
                                                <Input
                                                    id="amount"
                                                    name="amount"
                                                    type="number"
                                                    min="0.01"
                                                    max={invoice.remaining_amount}
                                                    step="0.01"
                                                    defaultValue={invoice.remaining_amount}
                                                    required
                                                />
                                                <InputError message={errors.amount} />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="payment_reference">Referensi</Label>
                                                <Input
                                                    id="payment_reference"
                                                    name="payment_reference"
                                                    placeholder="Contoh: TRX-12345"
                                                />
                                                <InputError message={errors.payment_reference} />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="payment_method">Metode</Label>
                                                <select
                                                    id="payment_method"
                                                    name="payment_method"
                                                    defaultValue="bank_transfer"
                                                    className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                                                >
                                                    <option value="bank_transfer">
                                                        Transfer bank
                                                    </option>
                                                    <option value="cash">Tunai</option>
                                                    <option value="ewallet">E-wallet</option>
                                                    <option value="payment_gateway">
                                                        Payment gateway
                                                    </option>
                                                </select>
                                                <InputError message={errors.payment_method} />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="status">Status</Label>
                                                <select
                                                    id="status"
                                                    name="status"
                                                    defaultValue="paid"
                                                    className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                                                >
                                                    <option value="paid">Berhasil</option>
                                                    <option value="pending">Pending</option>
                                                    <option value="failed">Gagal</option>
                                                </select>
                                                <InputError message={errors.status} />
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="notes">Catatan</Label>
                                            <textarea
                                                id="notes"
                                                name="notes"
                                                rows={3}
                                                className="border-input bg-background rounded-md border px-3 py-2 text-sm"
                                            />
                                            <InputError message={errors.notes} />
                                        </div>
                                        <Button className="w-fit" disabled={processing}>
                                            {processing ? "Menyimpan..." : "Simpan pembayaran"}
                                        </Button>
                                    </>
                                )}
                            </Form>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Histori pembayaran</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {invoice.payments.length === 0 ? (
                            <p className="text-muted-foreground text-sm">Belum ada pembayaran.</p>
                        ) : (
                            <div className="grid gap-3">
                                {invoice.payments.map((payment) => (
                                    <div
                                        key={payment.id}
                                        className="flex flex-col justify-between gap-3 rounded-lg border p-4 sm:flex-row sm:items-center"
                                    >
                                        <div>
                                            <p className="font-semibold">
                                                {formatCurrency(Number(payment.amount))}
                                            </p>
                                            <p className="text-muted-foreground text-sm">
                                                {paymentMethodLabels[payment.payment_method] ??
                                                    payment.payment_method}{" "}
                                                -{" "}
                                                {paymentStatusLabels[payment.status] ??
                                                    payment.status}
                                                {payment.payment_reference
                                                    ? ` - ${payment.payment_reference}`
                                                    : ""}
                                            </p>
                                            {payment.notes && (
                                                <p className="mt-1 text-sm">{payment.notes}</p>
                                            )}
                                        </div>
                                        {auth.permissions.deleteInvoices && (
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => removePayment(payment.id)}
                                                aria-label="Hapus pembayaran"
                                            >
                                                <Trash2 />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Button variant="outline" className="w-fit" asChild>
                    <Link href={index()}>Kembali</Link>
                </Button>
            </div>
        </>
    );
}

function Summary({
    label,
    value,
    emphasized = false,
}: {
    label: string;
    value: string;
    emphasized?: boolean;
}) {
    return (
        <div
            className={
                emphasized
                    ? "bg-primary text-primary-foreground rounded-lg p-4"
                    : "bg-muted rounded-lg p-4"
            }
        >
            <p
                className={
                    emphasized
                        ? "text-primary-foreground/80 text-xs"
                        : "text-muted-foreground text-xs"
                }
            >
                {label}
            </p>
            <p className="text-lg font-semibold">{formatCurrency(Number(value))}</p>
        </div>
    );
}

ShowInvoice.layout = ({ invoice }: { invoice: InvoiceData }) => ({
    breadcrumbs: [
        { title: "Invoices", href: index() },
        { title: invoice.invoice_number, href: show(invoice.id) },
    ],
});
