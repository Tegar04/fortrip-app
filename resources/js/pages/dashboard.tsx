import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    CalendarCheck2,
    CalendarClock,
    CircleDollarSign,
    Clock3,
    Images,
    MapPinned,
    Plus,
    ReceiptText,
    TriangleAlert,
} from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { formatCurrency } from '@/pages/admin/bookings/booking-form';
import { formatDate, StatusBadge } from '@/pages/admin/bookings/index';
import { dashboard } from '@/routes';
import { create as createBanner } from '@/routes/admin/banners';
import {
    create as createBooking,
    index as bookingsIndex,
    show as showBooking,
} from '@/routes/admin/bookings';
import {
    index as invoicesIndex,
    show as showInvoice,
} from '@/routes/admin/invoices';
import { create as createPackage } from '@/routes/admin/packages';
import { index as reportsIndex } from '@/routes/admin/reports';

type DashboardStatistics = {
    pending_bookings: number;
    upcoming_departures: number;
    outstanding_invoices: number;
    overdue_invoices: number;
    monthly_revenue: number;
};

type DashboardBooking = {
    id: number;
    booked_at: string;
    departure_date: string;
    participant_count: number;
    total_price: string;
    status: string;
    customer: {
        name: string;
        phone: string;
    };
    package: {
        title: string;
        destination: string;
    };
    invoice: {
        id: number;
        invoice_number: string;
    } | null;
};

type OverdueInvoice = {
    id: number;
    invoice_number: string;
    due_date: string | null;
    remaining_amount: string;
    customer_name: string;
    package_title: string;
};

type Props = {
    today_label: string;
    month_label: string;
    statistics: DashboardStatistics;
    pending_bookings: DashboardBooking[];
    overdue_invoices: OverdueInvoice[];
    upcoming_departures: DashboardBooking[];
    recent_bookings: DashboardBooking[];
};

export default function Dashboard({
    today_label: todayLabel,
    month_label: monthLabel,
    statistics,
    pending_bookings: pendingBookings,
    overdue_invoices: overdueInvoices,
    upcoming_departures: upcomingDepartures,
    recent_bookings: recentBookings,
}: Props) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
                    <Heading
                        title={`Selamat datang, ${auth.user.name}`}
                        description={`${todayLabel} · Ringkasan operasional ForTrip`}
                    />
                    <div className="flex flex-wrap gap-2">
                        {auth.permissions.createBookings && (
                            <Button asChild>
                                <Link href={createBooking()}>
                                    <Plus />
                                    Buat booking
                                </Link>
                            </Button>
                        )}
                        {auth.permissions.createPackages && (
                            <Button variant="outline" asChild>
                                <Link href={createPackage()}>
                                    <MapPinned />
                                    Tambah package
                                </Link>
                            </Button>
                        )}
                        {auth.permissions.createBanners && (
                            <Button variant="outline" asChild>
                                <Link href={createBanner()}>
                                    <Images />
                                    Tambah banner
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatisticCard
                        title="Booking pending"
                        value={statistics.pending_bookings.toLocaleString(
                            'id-ID',
                        )}
                        description="Menunggu konfirmasi admin"
                        icon={Clock3}
                        href={bookingsIndex.url()}
                        tone="amber"
                    />
                    <StatisticCard
                        title="Keberangkatan 30 hari"
                        value={statistics.upcoming_departures.toLocaleString(
                            'id-ID',
                        )}
                        description="Booking pending dan dikonfirmasi"
                        icon={CalendarClock}
                        href={bookingsIndex.url()}
                        tone="blue"
                    />
                    <StatisticCard
                        title="Invoice belum lunas"
                        value={statistics.outstanding_invoices.toLocaleString(
                            'id-ID',
                        )}
                        description={`${statistics.overdue_invoices} sudah jatuh tempo`}
                        icon={ReceiptText}
                        href={invoicesIndex.url()}
                        tone={statistics.overdue_invoices > 0 ? 'red' : 'blue'}
                    />
                    <StatisticCard
                        title={`Revenue ${monthLabel}`}
                        value={formatCurrency(statistics.monthly_revenue)}
                        description="Pembayaran berstatus berhasil"
                        icon={CircleDollarSign}
                        href={reportsIndex.url()}
                        tone="emerald"
                    />
                </div>

                <div className="grid gap-6 xl:grid-cols-3">
                    <Card className="xl:col-span-2">
                        <CardHeader className="flex-row items-start justify-between gap-4">
                            <div className="grid gap-1.5">
                                <CardTitle>Perlu ditindaklanjuti</CardTitle>
                                <CardDescription>
                                    Prioritas booking dan tagihan yang
                                    membutuhkan perhatian.
                                </CardDescription>
                            </div>
                            <TriangleAlert className="size-5 text-amber-600" />
                        </CardHeader>
                        <CardContent className="grid gap-6 md:grid-cols-2">
                            <AttentionSection
                                title="Booking pending"
                                count={statistics.pending_bookings}
                            >
                                {pendingBookings.length === 0 ? (
                                    <EmptyMessage text="Tidak ada booking yang menunggu konfirmasi." />
                                ) : (
                                    pendingBookings.map((booking) => (
                                        <Link
                                            key={booking.id}
                                            href={showBooking(booking.id)}
                                            className="hover:bg-muted/60 flex items-center justify-between gap-3 rounded-lg border p-3 transition"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium">
                                                    {booking.customer.name}
                                                </p>
                                                <p className="text-muted-foreground truncate text-xs">
                                                    {booking.package.title}
                                                </p>
                                            </div>
                                            <div className="shrink-0 text-right">
                                                <p className="text-xs font-medium">
                                                    #{booking.id}
                                                </p>
                                                <p className="text-muted-foreground text-xs">
                                                    {formatShortDate(
                                                        booking.departure_date,
                                                    )}
                                                </p>
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </AttentionSection>

                            <AttentionSection
                                title="Invoice jatuh tempo"
                                count={statistics.overdue_invoices}
                            >
                                {overdueInvoices.length === 0 ? (
                                    <EmptyMessage text="Tidak ada invoice yang melewati jatuh tempo." />
                                ) : (
                                    overdueInvoices.map((invoice) => (
                                        <Link
                                            key={invoice.id}
                                            href={showInvoice(invoice.id)}
                                            className="hover:bg-muted/60 flex items-center justify-between gap-3 rounded-lg border border-red-200 p-3 transition dark:border-red-900"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium">
                                                    {invoice.customer_name}
                                                </p>
                                                <p className="text-muted-foreground truncate text-xs">
                                                    {invoice.invoice_number}
                                                </p>
                                            </div>
                                            <div className="shrink-0 text-right">
                                                <p className="text-xs font-semibold text-red-600 dark:text-red-400">
                                                    {formatCurrency(
                                                        Number(
                                                            invoice.remaining_amount,
                                                        ),
                                                    )}
                                                </p>
                                                <p className="text-muted-foreground text-xs">
                                                    {invoice.due_date
                                                        ? formatShortDate(
                                                              invoice.due_date,
                                                          )
                                                        : '-'}
                                                </p>
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </AttentionSection>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex-row items-start justify-between gap-4">
                            <div className="grid gap-1.5">
                                <CardTitle>Keberangkatan terdekat</CardTitle>
                                <CardDescription>
                                    Jadwal aktif dalam 30 hari ke depan.
                                </CardDescription>
                            </div>
                            <CalendarCheck2 className="text-primary size-5" />
                        </CardHeader>
                        <CardContent className="grid gap-3">
                            {upcomingDepartures.length === 0 ? (
                                <EmptyMessage text="Belum ada keberangkatan dalam 30 hari." />
                            ) : (
                                upcomingDepartures.map((booking) => (
                                    <Link
                                        key={booking.id}
                                        href={showBooking(booking.id)}
                                        className="hover:bg-muted/60 grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg border p-3 transition"
                                    >
                                        <div className="bg-primary/10 text-primary grid size-11 place-items-center rounded-lg text-center">
                                            <span className="text-xs leading-tight font-semibold">
                                                {formatShortDate(
                                                    booking.departure_date,
                                                )}
                                            </span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium">
                                                {booking.package.title}
                                            </p>
                                            <p className="text-muted-foreground truncate text-xs">
                                                {booking.customer.name} ·{' '}
                                                {booking.participant_count}{' '}
                                                peserta
                                            </p>
                                        </div>
                                        <StatusBadge status={booking.status} />
                                    </Link>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="flex-row items-start justify-between gap-4">
                        <div className="grid gap-1.5">
                            <CardTitle>Booking terbaru</CardTitle>
                            <CardDescription>
                                Enam pemesanan terbaru yang masuk ke sistem.
                            </CardDescription>
                        </div>
                        {auth.permissions.viewBookings && (
                            <Button size="sm" variant="outline" asChild>
                                <Link href={bookingsIndex()}>
                                    Lihat semua
                                    <ArrowRight />
                                </Link>
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        {recentBookings.length === 0 ? (
                            <EmptyMessage text="Belum ada booking yang tercatat." />
                        ) : (
                            <div className="overflow-x-auto rounded-lg border">
                                <table className="w-full min-w-[900px] text-sm">
                                    <thead className="bg-muted/70 text-left">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">
                                                Booking
                                            </th>
                                            <th className="px-4 py-3 font-medium">
                                                Customer
                                            </th>
                                            <th className="px-4 py-3 font-medium">
                                                Package
                                            </th>
                                            <th className="px-4 py-3 font-medium">
                                                Keberangkatan
                                            </th>
                                            <th className="px-4 py-3 font-medium">
                                                Status
                                            </th>
                                            <th className="px-4 py-3 text-right font-medium">
                                                Total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {recentBookings.map((booking) => (
                                            <tr
                                                key={booking.id}
                                                className="hover:bg-muted/40"
                                            >
                                                <td className="px-4 py-3">
                                                    <Link
                                                        href={showBooking(
                                                            booking.id,
                                                        )}
                                                        className="font-medium underline-offset-4 hover:underline"
                                                    >
                                                        #{booking.id}
                                                    </Link>
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
                                                        {
                                                            booking.package
                                                                .destination
                                                        }
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {formatDate(
                                                        booking.departure_date,
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <StatusBadge
                                                        status={booking.status}
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-right font-semibold">
                                                    {formatCurrency(
                                                        Number(
                                                            booking.total_price,
                                                        ),
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
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
    href,
    tone,
}: {
    title: string;
    value: string;
    description: string;
    icon: typeof Clock3;
    href: string;
    tone: 'amber' | 'blue' | 'red' | 'emerald';
}) {
    const toneClasses = {
        amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
        blue: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
        red: 'bg-red-500/10 text-red-700 dark:text-red-400',
        emerald: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    };

    return (
        <Link href={href} className="group">
            <Card className="h-full transition group-hover:-translate-y-0.5 group-hover:shadow-md">
                <CardContent className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <p className="text-muted-foreground text-sm">{title}</p>
                        <p className="mt-1 truncate text-2xl font-semibold tracking-tight">
                            {value}
                        </p>
                        <p className="text-muted-foreground mt-1 text-xs">
                            {description}
                        </p>
                    </div>
                    <div
                        className={`grid size-10 shrink-0 place-items-center rounded-lg ${toneClasses[tone]}`}
                    >
                        <Icon className="size-5" />
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

function AttentionSection({
    title,
    count,
    children,
}: {
    title: string;
    count: number;
    children: React.ReactNode;
}) {
    return (
        <section className="grid content-start gap-3">
            <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold">{title}</h3>
                <Badge variant={count > 0 ? 'secondary' : 'outline'}>
                    {count}
                </Badge>
            </div>
            <div className="grid gap-2">{children}</div>
        </section>
    );
}

function EmptyMessage({ text }: { text: string }) {
    return (
        <div className="text-muted-foreground rounded-lg border border-dashed p-5 text-center text-sm">
            {text}
        </div>
    );
}

function formatShortDate(value: string): string {
    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        timeZone: 'UTC',
    }).format(new Date(`${value}T00:00:00Z`));
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
