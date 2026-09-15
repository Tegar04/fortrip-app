<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Database\Query\JoinClause;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $today = today();
        $paidPayments = Payment::query()
            ->select('invoice_id')
            ->selectRaw('SUM(amount) AS paid_amount')
            ->where('status', 'paid')
            ->groupBy('invoice_id');
        $invoiceStatistics = Invoice::query()
            ->leftJoinSub($paidPayments, 'paid_payments', function (JoinClause $join): void {
                $join->on('paid_payments.invoice_id', '=', 'invoices.id');
            })
            ->selectRaw('COUNT(CASE WHEN invoices.amount > COALESCE(paid_payments.paid_amount, 0) THEN 1 END) AS total')
            ->selectRaw(
                'COUNT(CASE WHEN invoices.amount > COALESCE(paid_payments.paid_amount, 0) AND invoices.due_date < ? THEN 1 END) AS overdue',
                [$today->toDateString()],
            )
            ->first();

        $bookingRelations = [
            'customer:id,name,phone',
            'package:id,title,destination',
            'invoice:id,booking_id,invoice_number',
        ];

        $pendingBookings = Booking::query()
            ->with($bookingRelations)
            ->where('status', 'pending')
            ->oldest('created_at')
            ->oldest('id')
            ->limit(5)
            ->get()
            ->map(fn (Booking $booking): array => $this->bookingData($booking));

        $overdueInvoices = Invoice::query()
            ->with(['booking.customer:id,name,phone', 'booking.package:id,title,destination'])
            ->withSum(['payments as paid_amount' => fn ($query) => $query->where('status', 'paid')], 'amount')
            ->where('status', '!=', 'paid')
            ->whereDate('due_date', '<', $today)
            ->oldest('due_date')
            ->oldest('id')
            ->limit(5)
            ->get()
            ->map(fn (Invoice $invoice): array => $this->overdueInvoiceData($invoice));

        $upcomingDepartures = Booking::query()
            ->with($bookingRelations)
            ->whereIn('status', ['pending', 'confirmed'])
            ->whereBetween('departure_date', [$today, $today->copy()->addDays(30)])
            ->orderBy('departure_date')
            ->orderBy('id')
            ->limit(5)
            ->get()
            ->map(fn (Booking $booking): array => $this->bookingData($booking));

        $recentBookings = Booking::query()
            ->with($bookingRelations)
            ->latest('created_at')
            ->latest('id')
            ->limit(6)
            ->get()
            ->map(fn (Booking $booking): array => $this->bookingData($booking));

        return Inertia::render('dashboard', [
            'today_label' => $today->locale('id')->translatedFormat('l, d F Y'),
            'month_label' => $today->locale('id')->translatedFormat('F Y'),
            'statistics' => [
                'pending_bookings' => Booking::query()->where('status', 'pending')->count(),
                'upcoming_departures' => Booking::query()
                    ->whereIn('status', ['pending', 'confirmed'])
                    ->whereBetween('departure_date', [$today, $today->copy()->addDays(30)])
                    ->count(),
                'outstanding_invoices' => (int) ($invoiceStatistics?->getAttribute('total') ?? 0),
                'overdue_invoices' => (int) ($invoiceStatistics?->getAttribute('overdue') ?? 0),
                'monthly_revenue' => (float) Payment::query()
                    ->where('status', 'paid')
                    ->whereBetween('paid_at', [$today->copy()->startOfMonth(), $today->copy()->endOfMonth()])
                    ->sum('amount'),
            ],
            'pending_bookings' => $pendingBookings,
            'overdue_invoices' => $overdueInvoices,
            'upcoming_departures' => $upcomingDepartures,
            'recent_bookings' => $recentBookings,
        ]);
    }

    /** @return array<string, mixed> */
    private function bookingData(Booking $booking): array
    {
        return [
            'id' => $booking->id,
            'booked_at' => $booking->created_at->toIso8601String(),
            'departure_date' => $booking->departure_date->toDateString(),
            'participant_count' => $booking->participant_count,
            'total_price' => $booking->total_price,
            'status' => $booking->status,
            'customer' => [
                'name' => $booking->customer->name,
                'phone' => $booking->customer->phone,
            ],
            'package' => [
                'title' => $booking->package->title,
                'destination' => $booking->package->destination,
            ],
            'invoice' => $booking->invoice ? [
                'id' => $booking->invoice->id,
                'invoice_number' => $booking->invoice->invoice_number,
            ] : null,
        ];
    }

    /** @return array<string, mixed> */
    private function overdueInvoiceData(Invoice $invoice): array
    {
        return [
            'id' => $invoice->id,
            'invoice_number' => $invoice->invoice_number,
            'due_date' => $invoice->due_date?->toDateString(),
            'remaining_amount' => number_format(
                max(0, (float) $invoice->amount - (float) ($invoice->paid_amount ?? 0)),
                2,
                '.',
                '',
            ),
            'customer_name' => $invoice->booking->customer->name,
            'package_title' => $invoice->booking->package->title,
        ];
    }
}
