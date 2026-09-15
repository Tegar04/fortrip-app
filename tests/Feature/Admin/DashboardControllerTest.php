<?php

use App\Models\Booking;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Package;
use App\Models\Payment;
use App\Models\User;
use Carbon\CarbonImmutable;
use Database\Seeders\RoleAndPermissionSeeder;
use Inertia\Testing\AssertableInertia as Assert;

function dashboardModuleUser(string $email): User
{
    test()->seed(RoleAndPermissionSeeder::class);

    return User::query()->where('email', $email)->firstOrFail();
}

test('staff sees operational statistics and prioritized dashboard records', function () {
    $this->withoutVite();
    $this->travelTo(CarbonImmutable::parse('2026-09-15 12:00:00'));
    $staff = dashboardModuleUser('staff@travel.com');
    $customer = Customer::factory()->create([
        'name' => 'Siti Rahma',
        'phone' => '+628123456789',
    ]);
    $package = Package::factory()->create([
        'title' => 'Trip Bali',
        'destination' => 'Bali',
    ]);

    $oldestPending = Booking::factory()->for($customer)->for($package)->create([
        'status' => 'pending',
        'departure_date' => '2026-09-20',
        'total_price' => '1000000.00',
        'created_at' => '2026-09-01 08:00:00',
    ]);
    $newestPending = Booking::factory()->for($customer)->for($package)->create([
        'status' => 'pending',
        'departure_date' => '2026-10-10',
        'created_at' => '2026-09-02 08:00:00',
    ]);
    $confirmedDeparture = Booking::factory()->for($customer)->for($package)->create([
        'status' => 'confirmed',
        'departure_date' => '2026-09-18',
        'created_at' => '2026-09-03 08:00:00',
    ]);
    $farDeparture = Booking::factory()->for($customer)->for($package)->create([
        'status' => 'confirmed',
        'departure_date' => '2026-10-20',
        'created_at' => '2026-09-04 08:00:00',
    ]);
    Booking::factory()->for($customer)->for($package)->create([
        'status' => 'cancelled',
        'departure_date' => '2026-09-17',
        'created_at' => '2026-09-05 08:00:00',
    ]);
    $completed = Booking::factory()->for($customer)->for($package)->create([
        'status' => 'completed',
        'departure_date' => '2026-09-14',
        'created_at' => '2026-09-06 08:00:00',
    ]);

    $overdueInvoice = Invoice::factory()->for($farDeparture)->create([
        'amount' => '1000000.00',
        'due_date' => '2026-09-10',
        'status' => 'overdue',
    ]);
    Payment::factory()->for($overdueInvoice)->create([
        'amount' => '250000.00',
        'status' => 'paid',
        'paid_at' => '2026-09-10 09:00:00',
    ]);
    Invoice::factory()->for($confirmedDeparture)->create([
        'amount' => '500000.00',
        'due_date' => '2026-09-20',
        'status' => 'unpaid',
    ]);
    $paidInvoice = Invoice::factory()->for($completed)->create([
        'amount' => '600000.00',
        'status' => 'paid',
    ]);
    Payment::factory()->for($paidInvoice)->create([
        'amount' => '600000.00',
        'status' => 'paid',
        'paid_at' => '2026-09-14 09:00:00',
    ]);

    $this->actingAs($staff)
        ->get(route('dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('today_label', 'Selasa, 15 September 2026')
            ->where('month_label', 'September 2026')
            ->where('statistics', [
                'pending_bookings' => 2,
                'upcoming_departures' => 3,
                'outstanding_invoices' => 2,
                'overdue_invoices' => 1,
                'monthly_revenue' => 850000,
            ])
            ->has('pending_bookings', 2)
            ->where('pending_bookings.0.id', $oldestPending->id)
            ->where('pending_bookings.1.id', $newestPending->id)
            ->has('overdue_invoices', 1)
            ->where('overdue_invoices.0.id', $overdueInvoice->id)
            ->where('overdue_invoices.0.remaining_amount', '750000.00')
            ->has('upcoming_departures', 3)
            ->where('upcoming_departures.0.id', $confirmedDeparture->id)
            ->where('upcoming_departures.1.id', $oldestPending->id)
            ->where('upcoming_departures.2.id', $newestPending->id)
            ->has('recent_bookings', 6)
            ->where('recent_bookings.0.id', $completed->id));
});

test('staff sees zero-value dashboard states when no operational records exist', function () {
    $this->withoutVite();
    $this->travelTo(CarbonImmutable::parse('2026-09-15 12:00:00'));
    $staff = dashboardModuleUser('staff@travel.com');

    $this->actingAs($staff)
        ->get(route('admin.dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('statistics', [
                'pending_bookings' => 0,
                'upcoming_departures' => 0,
                'outstanding_invoices' => 0,
                'overdue_invoices' => 0,
                'monthly_revenue' => 0,
            ])
            ->has('pending_bookings', 0)
            ->has('overdue_invoices', 0)
            ->has('upcoming_departures', 0)
            ->has('recent_bookings', 0));
});
