<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePublicBookingRequest;
use App\Models\Booking;
use App\Models\Customer;
use App\Models\Package;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class PublicBookingController extends Controller
{
    public function store(StorePublicBookingRequest $request, Package $package): RedirectResponse
    {
        $submissionKey = hash('sha256', $package->id.'|'.strtolower($request->validated('submission_token')));

        DB::transaction(function () use ($request, $package, $submissionKey): void {
            $package = Package::query()->lockForUpdate()->findOrFail($package->id);
            abort_unless($package->is_active, 404);

            if (Booking::query()->where('public_submission_key', $submissionKey)->exists()) {
                return;
            }

            $participantCount = $request->integer('participant_count');
            $priceInCents = (int) str_replace('.', '', $package->price);
            $totalInCents = $priceInCents * $participantCount;

            if ($totalInCents > 999999999999) {
                throw ValidationException::withMessages([
                    'participant_count' => 'Total harga melebihi batas pemesanan. Kurangi jumlah peserta atau hubungi admin.',
                ]);
            }

            $customer = Customer::query()->firstOrCreate([
                'phone' => $request->validated('phone'),
                'name' => $request->validated('name'),
                'email' => $request->validated('email'),
                'address' => $request->validated('address'),
            ]);

            $booking = new Booking([
                'customer_id' => $customer->id,
                'package_id' => $package->id,
                'departure_date' => $request->validated('departure_date'),
                'participant_count' => $participantCount,
                'total_price' => intdiv($totalInCents, 100).'.'.str_pad((string) ($totalInCents % 100), 2, '0', STR_PAD_LEFT),
                'status' => 'pending',
            ]);
            $booking->public_submission_key = $submissionKey;
            $booking->save();
        }, 3);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Pengajuan booking diterima. Admin akan menghubungi Anda untuk mengonfirmasi ketersediaan dan keberangkatan.',
        ]);

        return to_route('packages.show', ['package' => $package->slug]);
    }
}
