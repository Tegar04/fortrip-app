<?php

namespace App\Actions;

use App\Models\Booking;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;

class BuildBookingReportQuery
{
    /** @return Builder<Booking> */
    public function handle(CarbonInterface $startDate, CarbonInterface $endDate): Builder
    {
        return Booking::query()->whereBetween('created_at', [
            $startDate->copy()->startOfDay(),
            $endDate->copy()->endOfDay(),
        ]);
    }
}
