import { Head, Link, router, usePage } from "@inertiajs/react";
import { Eye, FilePlus2, ReceiptText, Trash2 } from "lucide-react";
import { destroy } from "@/actions/App/Http/Controllers/Admin/InvoiceController";
import Heading from "@/components/heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/pages/admin/bookings/booking-form";
import { formatDate } from "@/pages/admin/bookings/index";
import type { InvoiceData } from "@/pages/admin/invoices/types";
import { create, index, show } from "@/routes/admin/invoices";

const statusLabels = { unpaid: "Belum dibayar", paid: "Lunas", overdue: "Jatuh tempo" };

export default function InvoicesIndex({ invoices }: { invoices: InvoiceData[] }) {
    const { auth } = usePage().props;

    function deleteInvoice(invoice: InvoiceData) {
        if (window.confirm(`Hapus invoice ${invoice.invoice_number}?`)) {
            router.delete(destroy.url(invoice.id), { preserveScroll: true });
        }
    }

    return (
        <>
            <Head title="Invoices" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <Heading
                        title="Invoices"
                        description="Kelola tagihan booking dan histori pembayaran."
                    />
                    {auth.permissions.createInvoices && (
                        <Button asChild>
                            <Link href={create()}>
                                <FilePlus2 />
                                Buat invoice
                            </Link>
                        </Button>
                    )}
                </div>

                {invoices.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
                            <ReceiptText className="text-muted-foreground size-10" />
                            <div>
                                <h2 className="font-semibold">Belum ada invoice</h2>
                                <p className="text-muted-foreground text-sm">
                                    Buat invoice dari booking yang tersedia.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 lg:grid-cols-2">
                        {invoices.map((invoice) => (
                            <Card key={invoice.id}>
                                <CardContent className="grid h-full gap-4 px-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-semibold">
                                                {invoice.invoice_number}
                                            </p>
                                            <p className="text-muted-foreground text-sm">
                                                {invoice.booking.customer.name} -{" "}
                                                {invoice.booking.package.title}
                                            </p>
                                        </div>
                                        <InvoiceStatusBadge status={invoice.status} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 rounded-lg border p-3 text-sm">
                                        <div>
                                            <p className="text-muted-foreground text-xs">Terbit</p>
                                            <p>{formatDate(invoice.issued_date)}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-xs">
                                                Jatuh tempo
                                            </p>
                                            <p>
                                                {invoice.due_date
                                                    ? formatDate(invoice.due_date)
                                                    : "-"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-xs">Total</p>
                                            <p className="font-semibold">
                                                {formatCurrency(Number(invoice.amount))}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground text-xs">Sisa</p>
                                            <p className="font-semibold">
                                                {formatCurrency(Number(invoice.remaining_amount))}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-auto flex gap-2 border-t pt-4">
                                        <Button size="sm" variant="outline" asChild>
                                            <Link href={show(invoice.id)}>
                                                <Eye />
                                                Detail
                                            </Link>
                                        </Button>
                                        {auth.permissions.deleteInvoices && (
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => deleteInvoice(invoice)}
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

export function InvoiceStatusBadge({ status }: { status: InvoiceData["status"] }) {
    return (
        <Badge
            variant={
                status === "overdue" ? "destructive" : status === "unpaid" ? "secondary" : "default"
            }
        >
            {statusLabels[status]}
        </Badge>
    );
}

InvoicesIndex.layout = { breadcrumbs: [{ title: "Invoices", href: index() }] };
