<?php

namespace App\Actions;

use App\Models\Booking;
use App\Models\Payment;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;

class BuildBookingReportChartData
{
    private const STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];

    /**
     * @return array{
     *     granularity: 'day'|'week'|'month',
     *     points: array<int, array{
     *         start_date: string,
     *         end_date: string,
     *         pending: int,
     *         confirmed: int,
     *         completed: int,
     *         cancelled: int,
     *         revenue: float
     *     }>
     * }
     */
    public function handle(CarbonInterface $startDate, CarbonInterface $endDate): array
    {
        $start = CarbonImmutable::instance($startDate)->startOfDay();
        $end = CarbonImmutable::instance($endDate)->endOfDay();
        $granularity = $this->granularity($start, $end);
        $points = $this->emptyPoints($start, $end, $granularity);

        Booking::query()
            ->whereBetween('created_at', [$start, $end])
            ->select(['id', 'status', 'created_at'])
            ->orderBy('id')
            ->lazy()
            ->each(function (Booking $booking) use (&$points, $start, $granularity): void {
                if (! in_array($booking->status, self::STATUSES, true)) {
                    return;
                }

                $key = $this->bucketKey($booking->created_at->toImmutable(), $start, $granularity);
                $points[$key][$booking->status]++;
            });

        Payment::query()
            ->join('invoices', 'invoices.id', '=', 'payments.invoice_id')
            ->join('bookings', 'bookings.id', '=', 'invoices.booking_id')
            ->where('payments.status', 'paid')
            ->whereBetween('bookings.created_at', [$start, $end])
            ->select([
                'payments.id',
                'payments.amount',
                'bookings.created_at as booking_created_at',
            ])
            ->orderBy('payments.id')
            ->lazy()
            ->each(function (Payment $payment) use (&$points, $start, $granularity): void {
                $bookingCreatedAt = CarbonImmutable::parse($payment->getAttribute('booking_created_at'));
                $key = $this->bucketKey($bookingCreatedAt, $start, $granularity);
                $points[$key]['revenue'] += (float) $payment->amount;
            });

        return [
            'granularity' => $granularity,
            'points' => array_values($points),
        ];
    }

    /** @return 'day'|'week'|'month' */
    private function granularity(CarbonImmutable $startDate, CarbonImmutable $endDate): string
    {
        $days = (int) $startDate->diffInDays($endDate);

        if ($days <= 30) {
            return 'day';
        }

        if ($days <= 179) {
            return 'week';
        }

        return 'month';
    }

    /**
     * @param  'day'|'week'|'month'  $granularity
     * @return array<string, array{
     *     start_date: string,
     *     end_date: string,
     *     pending: int,
     *     confirmed: int,
     *     completed: int,
     *     cancelled: int,
     *     revenue: float
     * }>
     */
    private function emptyPoints(
        CarbonImmutable $startDate,
        CarbonImmutable $endDate,
        string $granularity,
    ): array {
        $points = [];
        $cursor = $granularity === 'month' ? $startDate->startOfMonth() : $startDate;

        while ($cursor->lessThanOrEqualTo($endDate)) {
            $pointStart = $cursor->greaterThan($startDate) ? $cursor : $startDate;
            $naturalEnd = match ($granularity) {
                'day' => $cursor->endOfDay(),
                'week' => $cursor->addDays(6)->endOfDay(),
                'month' => $cursor->endOfMonth(),
            };
            $pointEnd = $naturalEnd->lessThan($endDate) ? $naturalEnd : $endDate;
            $key = $this->bucketKey($pointStart, $startDate, $granularity);

            $points[$key] = [
                'start_date' => $pointStart->toDateString(),
                'end_date' => $pointEnd->toDateString(),
                'pending' => 0,
                'confirmed' => 0,
                'completed' => 0,
                'cancelled' => 0,
                'revenue' => 0.0,
            ];

            $cursor = match ($granularity) {
                'day' => $cursor->addDay(),
                'week' => $cursor->addWeek(),
                'month' => $cursor->addMonth(),
            };
        }

        return $points;
    }

    /** @param 'day'|'week'|'month' $granularity */
    private function bucketKey(
        CarbonImmutable $date,
        CarbonImmutable $startDate,
        string $granularity,
    ): string {
        return match ($granularity) {
            'day' => $date->toDateString(),
            'week' => (string) intdiv((int) $startDate->diffInDays($date), 7),
            'month' => $date->format('Y-m'),
        };
    }
}
