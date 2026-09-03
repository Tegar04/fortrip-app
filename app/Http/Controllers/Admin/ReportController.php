<?php

namespace App\Http\Controllers\Admin;

use App\Actions\BuildBookingReportChartData;
use App\Actions\BuildBookingReportQuery;
use App\Exports\BookingsExport;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ReportFilterRequest;
use App\Models\Booking;
use App\Models\Payment;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class ReportController extends Controller
{
    public function index(
        ReportFilterRequest $request,
        BuildBookingReportQuery $buildReportQuery,
        BuildBookingReportChartData $buildChartData,
    ): Response {
        $filters = $request->filters();
        $startDate = CarbonImmutable::parse($filters['start_date']);
        $endDate = CarbonImmutable::parse($filters['end_date']);
        $reportQuery = $buildReportQuery->handle($startDate, $endDate);
        $statusCounts = (clone $reportQuery)
            ->select('status')
            ->selectRaw('count(*) as aggregate')
            ->groupBy('status')
            ->pluck('aggregate', 'status');

        $bookings = (clone $reportQuery)
            ->with([
                'customer:id,name,phone',
                'package:id,title,destination',
                'invoice:id,booking_id,invoice_number,amount,due_date,status',
                'invoice.payments' => fn ($query) => $query
                    ->where('status', 'paid')
                    ->select(['id', 'invoice_id', 'amount', 'status']),
            ])
            ->latest('created_at')
            ->latest('id')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Booking $booking): array => $this->bookingData($booking));

        return Inertia::render('admin/reports/index', [
            'filters' => $filters,
            'statistics' => [
                'total_bookings' => (clone $reportQuery)->count(),
                'total_booking_value' => (float) (clone $reportQuery)
                    ->where('status', '!=', 'cancelled')
                    ->sum('total_price'),
                'total_revenue' => $this->totalRevenue($startDate, $endDate),
                'status_counts' => [
                    'pending' => (int) ($statusCounts['pending'] ?? 0),
                    'confirmed' => (int) ($statusCounts['confirmed'] ?? 0),
                    'cancelled' => (int) ($statusCounts['cancelled'] ?? 0),
                    'completed' => (int) ($statusCounts['completed'] ?? 0),
                ],
            ],
            'charts' => $buildChartData->handle($startDate, $endDate),
            'bookings' => $bookings,
        ]);
    }

    public function download(ReportFilterRequest $request): BinaryFileResponse
    {
        $filters = $request->filters();
        $filename = sprintf('laporan-booking-%s-sampai-%s.xlsx', $filters['start_date'], $filters['end_date']);

        return Excel::download(
            new BookingsExport($filters['start_date'], $filters['end_date']),
            $filename,
        );
    }

    private function totalRevenue(CarbonImmutable $startDate, CarbonImmutable $endDate): float
    {
        return (float) Payment::query()
            ->where('status', 'paid')
            ->whereHas('invoice.booking', fn (Builder $query) => $query->whereBetween('created_at', [
                $startDate->startOfDay(),
                $endDate->endOfDay(),
            ]))
            ->sum('amount');
    }

    /** @return array<string, mixed> */
    private function bookingData(Booking $booking): array
    {
        $paidAmount = $booking->invoice?->paidAmount() ?? '0.00';

        return [
            'id' => $booking->id,
            'booked_at' => $booking->created_at->toDateString(),
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
                'status' => $booking->invoice->calculatedStatus(),
                'paid_amount' => $paidAmount,
                'remaining_amount' => number_format(
                    max(0, (float) $booking->invoice->amount - (float) $paidAmount),
                    2,
                    '.',
                    '',
                ),
            ] : null,
        ];
    }
}
