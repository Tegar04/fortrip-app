import { Head, Link } from "@inertiajs/react";
import { Banknote, CalendarRange, Download, ListChecks, WalletCards } from "lucide-react";
import { download } from "@/actions/App/Http/Controllers/Admin/ReportController";
import Heading from "@/components/heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/pages/admin/bookings/booking-form";
import { formatDate, StatusBadge } from "@/pages/admin/bookings/index";
import { InvoiceStatusBadge } from "@/pages/admin/invoices/index";
import { ReportCharts, type ReportChartData } from "@/pages/admin/reports/report-charts";
import { show as showBooking } from "@/routes/admin/bookings";
import { show as showInvoice } from "@/routes/admin/invoices";
import { index } from "@/routes/admin/reports";

type ReportFilters = {
    start_date: string;
    end_date: string;
};

type ReportStatistics = {
    total_bookings: number;
    total_booking_value: number;
    total_revenue: number;
    status_counts: Record<"pending" | "confirmed" | "cancelled" | "completed", number>;
};

type ReportBooking = {
    id: number;
    booked_at: string;
    departure_date: string;
    participant_count: number;
    total_price: string;
    status: string;
    customer: { name: string; phone: string };
    package: { title: string; destination: string };
    invoice: {
        id: number;
        invoice_number: string;
        status: "unpaid" | "paid" | "overdue";
        paid_amount: string;
        remaining_amount: string;
    } | null;
};

type PaginatedBookings = {
    data: ReportBooking[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

const statusLabels = {
    pending: "Pending",
    confirmed: "Dikonfirmasi",
    completed: "Selesai",
    cancelled: "Dibatalkan",
};

const statusColors = {
    pending: "bg-amber-500",
    confirmed: "bg-blue-500",
    completed: "bg-emerald-500",
    cancelled: "bg-red-500",
};

export default function ReportsIndex({
    filters,
    statistics,
    charts,
    bookings,
}: {
    filters: ReportFilters;
    statistics: ReportStatistics;
    charts: ReportChartData;
    bookings: PaginatedBookings;
}) {
    const exportUrl = download.url({ query: filters });

    return (
        <>
            <Head title="Laporan" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                    <Heading
                        title="Laporan booking"
                        description="Pantau booking, nilai transaksi, dan revenue berdasarkan periode pencatatan booking."
                    />
                    <Button asChild>
                        <a href={exportUrl}>
                            <Download />
                            Export Excel
                        </a>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarRange className="size-5" />
                            Filter periode
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form
                            action={index.url()}
                            method="get"
                            className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
                        >
                            <div className="grid gap-2">
                                <Label htmlFor="start_date">Tanggal mulai</Label>
                                <Input
                                    id="start_date"
                                    name="start_date"
                                    type="date"
                                    defaultValue={filters.start_date}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="end_date">Tanggal selesai</Label>
                                <Input
                                    id="end_date"
                                    name="end_date"
                                    type="date"
                                    defaultValue={filters.end_date}
                                    required
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit">Terapkan</Button>
                                <Button variant="outline" asChild>
                                    <Link href={index()}>Reset</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <StatisticCard
                        title="Total booking"
                        value={statistics.total_bookings.toLocaleString("id-ID")}
                        description="Semua status dalam periode"
                        icon={ListChecks}
                    />
                    <StatisticCard
                        title="Nilai booking"
                        value={formatCurrency(statistics.total_booking_value)}
                        description="Tidak termasuk booking dibatalkan"
                        icon={WalletCards}
                    />
                    <StatisticCard
                        title="Total revenue"
                        value={formatCurrency(statistics.total_revenue)}
                        description="Pembayaran berstatus berhasil"
                        icon={Banknote}
                    />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Booking per status</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        {(Object.keys(statusLabels) as Array<keyof typeof statusLabels>).map(
                            (status) => {
                                const count = statistics.status_counts[status];
                                const percentage =
                                    statistics.total_bookings === 0
                                        ? 0
                                        : (count / statistics.total_bookings) * 100;

                                return (
                                    <div key={status} className="grid gap-2">
                                        <div className="flex items-center justify-between gap-4 text-sm">
                                            <span>{statusLabels[status]}</span>
                                            <span className="font-semibold">{count}</span>
                                        </div>
                                        <div className="bg-muted h-2 overflow-hidden rounded-full">
                                            <div
                                                className={`h-full rounded-full ${statusColors[status]}`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            },
                        )}
                    </CardContent>
                </Card>

                <ReportCharts charts={charts} />

                <Card>
                    <CardHeader className="flex-row items-center justify-between">
                        <CardTitle>Detail booking</CardTitle>
                        <Badge variant="secondary">{bookings.total} data</Badge>
                    </CardHeader>
                    <CardContent>
                        {bookings.data.length === 0 ? (
                            <div className="py-10 text-center">
                                <p className="font-medium">Tidak ada data pada periode ini.</p>
                                <p className="text-muted-foreground text-sm">
                                    Ubah tanggal mulai atau tanggal selesai untuk melihat periode
                                    lain.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto rounded-lg border">
                                    <table className="w-full min-w-[1050px] text-sm">
                                        <thead className="bg-muted/70 text-left">
                                            <tr>
                                                <th className="px-4 py-3 font-medium">Booking</th>
                                                <th className="px-4 py-3 font-medium">Customer</th>
                                                <th className="px-4 py-3 font-medium">Package</th>
                                                <th className="px-4 py-3 font-medium">
                                                    Keberangkatan
                                                </th>
                                                <th className="px-4 py-3 font-medium">Status</th>
                                                <th className="px-4 py-3 text-right font-medium">
                                                    Total
                                                </th>
                                                <th className="px-4 py-3 font-medium">Invoice</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {bookings.data.map((booking) => (
                                                <tr key={booking.id} className="hover:bg-muted/40">
                                                    <td className="px-4 py-3">
                                                        <Link
                                                            href={showBooking(booking.id)}
                                                            className="font-medium underline-offset-4 hover:underline"
                                                        >
                                                            #{booking.id}
                                                        </Link>
                                                        <p className="text-muted-foreground text-xs">
                                                            {formatDate(booking.booked_at)}
                                                        </p>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <p className="font-medium">
                                                            {booking.customer.name}
                                                        </p>
                                                        <p className="text-muted-foreground text-xs">
                                                            {booking.customer.phone}
                                                        </p>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <p className="font-medium">
                                                            {booking.package.title}
                                                        </p>
                                                        <p className="text-muted-foreground text-xs">
                                                            {booking.package.destination}
                                                        </p>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {formatDate(booking.departure_date)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <StatusBadge status={booking.status} />
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-semibold">
                                                        {formatCurrency(
                                                            Number(booking.total_price),
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {booking.invoice ? (
                                                            <div className="grid justify-items-start gap-1">
                                                                <Link
                                                                    href={showInvoice(
                                                                        booking.invoice.id,
                                                                    )}
                                                                    className="font-medium underline-offset-4 hover:underline"
                                                                >
                                                                    {booking.invoice.invoice_number}
                                                                </Link>
                                                                <InvoiceStatusBadge
                                                                    status={booking.invoice.status}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground">
                                                                -
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex flex-col justify-between gap-3 pt-4 text-sm sm:flex-row sm:items-center">
                                    <p className="text-muted-foreground">
                                        Menampilkan {bookings.from}-{bookings.to} dari{" "}
                                        {bookings.total} data
                                    </p>
                                    <div className="flex gap-2">
                                        {bookings.prev_page_url ? (
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={bookings.prev_page_url}>
                                                    Sebelumnya
                                                </Link>
                                            </Button>
                                        ) : (
                                            <Button variant="outline" size="sm" disabled>
                                                Sebelumnya
                                            </Button>
                                        )}
                                        {bookings.next_page_url ? (
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={bookings.next_page_url}>
                                                    Selanjutnya
                                                </Link>
                                            </Button>
                                        ) : (
                                            <Button variant="outline" size="sm" disabled>
                                                Selanjutnya
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

function StatisticCard({
    title,
    value,
    description,
    icon: Icon,
}: {
    title: string;
    value: string;
    description: string;
    icon: typeof ListChecks;
}) {
    return (
        <Card>
            <CardContent className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-muted-foreground text-sm">{title}</p>
                    <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
                    <p className="text-muted-foreground mt-1 text-xs">{description}</p>
                </div>
                <div className="bg-primary/10 text-primary rounded-lg p-2.5">
                    <Icon className="size-5" />
                </div>
            </CardContent>
        </Card>
    );
}

ReportsIndex.layout = {
    breadcrumbs: [{ title: "Laporan", href: index() }],
};
