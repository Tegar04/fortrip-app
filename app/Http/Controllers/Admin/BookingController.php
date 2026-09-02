<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreBookingRequest;
use App\Http\Requests\Admin\UpdateBookingRequest;
use App\Http\Requests\Admin\UpdateBookingStatusRequest;
use App\Models\Booking;
use App\Models\Customer;
use App\Models\Package;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    public function index(): Response
    {
        $bookings = Booking::query()
            ->with(['customer:id,name,email,phone,address', 'package:id,title,destination,price'])
            ->latest('id')
            ->get()
            ->map(fn (Booking $booking): array => $this->bookingData($booking));

        return Inertia::render('admin/bookings/index', [
            'bookings' => $bookings,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/bookings/create', $this->formOptions());
    }

    public function store(StoreBookingRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $package = Package::query()->findOrFail($validated['package_id']);

        Booking::query()->create([
            ...$validated,
            'total_price' => $this->calculateTotalPrice($package, $validated['participant_count']),
            'status' => 'pending',
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Booking created.'),
        ]);

        return to_route('admin.bookings.index');
    }

    public function show(Booking $booking): Response
    {
        $booking->load(['customer', 'package']);

        return Inertia::render('admin/bookings/show', [
            'booking' => $this->bookingData($booking),
        ]);
    }

    public function edit(Booking $booking): Response
    {
        $booking->load(['customer', 'package']);

        return Inertia::render('admin/bookings/edit', [
            'booking' => $this->bookingData($booking),
            ...$this->formOptions(),
        ]);
    }

    public function update(UpdateBookingRequest $request, Booking $booking): RedirectResponse
    {
        if ($booking->status !== 'pending') {
            throw ValidationException::withMessages([
                'booking' => __('Only pending bookings can be edited.'),
            ]);
        }

        $validated = $request->validated();
        $package = Package::query()->findOrFail($validated['package_id']);

        $booking->update([
            ...$validated,
            'total_price' => $this->calculateTotalPrice($package, $validated['participant_count']),
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Booking updated.'),
        ]);

        return to_route('admin.bookings.show', $booking);
    }

    public function destroy(Booking $booking): RedirectResponse
    {
        if ($booking->invoice()->exists()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => __('Bookings with invoices cannot be deleted.'),
            ]);

            return back();
        }

        $booking->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Booking deleted.'),
        ]);

        return to_route('admin.bookings.index');
    }

    public function updateStatus(UpdateBookingStatusRequest $request, Booking $booking): RedirectResponse
    {
        $status = $request->string('status')->toString();

        if (! $booking->canTransitionTo($status)) {
            throw ValidationException::withMessages([
                'status' => __('This booking status transition is not allowed.'),
            ]);
        }

        $booking->update(['status' => $status]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Booking status updated.'),
        ]);

        return back();
    }

    /** @return array{customers: array<int, array{id: int, name: string, phone: string}>, packages: array<int, array{id: int, title: string, destination: string, price: string}>} */
    private function formOptions(): array
    {
        return [
            'customers' => Customer::query()
                ->orderBy('name')
                ->get(['id', 'name', 'phone'])
                ->map(fn (Customer $customer): array => [
                    'id' => $customer->id,
                    'name' => $customer->name,
                    'phone' => $customer->phone,
                ])->all(),
            'packages' => Package::query()
                ->orderBy('title')
                ->get(['id', 'title', 'destination', 'price'])
                ->map(fn (Package $package): array => [
                    'id' => $package->id,
                    'title' => $package->title,
                    'destination' => $package->destination,
                    'price' => $package->price,
                ])->all(),
        ];
    }

    private function calculateTotalPrice(Package $package, int $participantCount): string
    {
        $totalPrice = (float) $package->price * $participantCount;

        if ($totalPrice > 9999999999.99) {
            throw ValidationException::withMessages([
                'participant_count' => __('The booking total exceeds the supported maximum.'),
            ]);
        }

        return number_format($totalPrice, 2, '.', '');
    }

    /** @return array{id: int, departure_date: string, participant_count: int, total_price: string, status: string, available_statuses: list<string>, customer: array{id: int, name: string, email: ?string, phone: string, address: ?string}, package: array{id: int, title: string, destination: string, price: string}} */
    private function bookingData(Booking $booking): array
    {
        return [
            'id' => $booking->id,
            'departure_date' => $booking->departure_date->toDateString(),
            'participant_count' => $booking->participant_count,
            'total_price' => $booking->total_price,
            'status' => $booking->status,
            'available_statuses' => $booking->availableStatusTransitions(),
            'customer' => [
                'id' => $booking->customer->id,
                'name' => $booking->customer->name,
                'email' => $booking->customer->email,
                'phone' => $booking->customer->phone,
                'address' => $booking->customer->address,
            ],
            'package' => [
                'id' => $booking->package->id,
                'title' => $booking->package->title,
                'destination' => $booking->package->destination,
                'price' => $booking->package->price,
            ],
        ];
    }
}
