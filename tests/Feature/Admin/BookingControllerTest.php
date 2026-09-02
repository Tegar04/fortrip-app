<?php

use App\Models\Booking;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Package;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Inertia\Testing\AssertableInertia as Assert;

function bookingModuleUser(string $email): User
{
    test()->seed(RoleAndPermissionSeeder::class);

    return User::query()->where('email', $email)->firstOrFail();
}

describe('index and access', function () {
    test('guests are redirected from the booking list', function () {
        $this->get(route('admin.bookings.index'))
            ->assertRedirect(route('login'));
    });

    test('staff can view booking details with customer and package data', function () {
        $this->withoutVite();
        $staff = bookingModuleUser('staff@travel.com');
        $customer = Customer::factory()->create(['name' => 'Siti Rahma']);
        $package = Package::factory()->create(['title' => 'Trip Bali']);
        $booking = Booking::factory()->for($customer)->for($package)->create();

        $this->actingAs($staff)
            ->get(route('admin.bookings.show', $booking))
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/bookings/show')
                ->where('booking.id', $booking->id)
                ->where('booking.customer.name', 'Siti Rahma')
                ->where('booking.package.title', 'Trip Bali'));
    });

    test('staff cannot delete bookings', function () {
        $staff = bookingModuleUser('staff@travel.com');
        $booking = Booking::factory()->create();

        $this->actingAs($staff)
            ->delete(route('admin.bookings.destroy', $booking))
            ->assertForbidden();

        $this->assertModelExists($booking);
    });
});

describe('create and update', function () {
    test('staff can create a pending booking with a server-calculated total', function () {
        $staff = bookingModuleUser('staff@travel.com');
        $customer = Customer::factory()->create();
        $package = Package::factory()->create(['price' => '1250000.00']);

        $response = $this->actingAs($staff)->post(
            route('admin.bookings.store'),
            validBookingPayload($customer, $package, [
                'participant_count' => 3,
                'total_price' => 1,
                'status' => 'completed',
            ]),
        );

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('admin.bookings.index'));

        $booking = Booking::query()->sole();
        expect($booking->total_price)->toBe('3750000.00')
            ->and($booking->status)->toBe('pending');
    });

    test('past departures and invalid participant counts are rejected', function () {
        $staff = bookingModuleUser('staff@travel.com');
        $customer = Customer::factory()->create();
        $package = Package::factory()->create();

        $response = $this->actingAs($staff)->post(
            route('admin.bookings.store'),
            validBookingPayload($customer, $package, [
                'departure_date' => now()->subDay()->toDateString(),
                'participant_count' => 0,
            ]),
        );

        $response->assertSessionHasErrors(['departure_date', 'participant_count']);
        $this->assertDatabaseCount('bookings', 0);
    });

    test('staff can update a pending booking and recalculate its total', function () {
        $staff = bookingModuleUser('staff@travel.com');
        $customer = Customer::factory()->create();
        $oldPackage = Package::factory()->create(['price' => '500000.00']);
        $newPackage = Package::factory()->create(['price' => '750000.00']);
        $booking = Booking::factory()->for($customer)->for($oldPackage)->create([
            'status' => 'pending',
        ]);

        $this->actingAs($staff)->put(
            route('admin.bookings.update', $booking),
            validBookingPayload($customer, $newPackage, ['participant_count' => 4]),
        )->assertSessionHasNoErrors();

        $booking->refresh();
        expect($booking->package_id)->toBe($newPackage->id)
            ->and($booking->total_price)->toBe('3000000.00');
    });

    test('confirmed bookings cannot be edited', function () {
        $staff = bookingModuleUser('staff@travel.com');
        $customer = Customer::factory()->create();
        $package = Package::factory()->create();
        $booking = Booking::factory()->for($customer)->for($package)->create([
            'status' => 'confirmed',
        ]);

        $this->actingAs($staff)->put(
            route('admin.bookings.update', $booking),
            validBookingPayload($customer, $package),
        )->assertSessionHasErrors('booking');

        expect($booking->refresh()->status)->toBe('confirmed');
    });
});

describe('status flow and deletion', function () {
    test('staff can move a booking from pending to confirmed and completed', function () {
        $staff = bookingModuleUser('staff@travel.com');
        $booking = Booking::factory()->create(['status' => 'pending']);

        $this->actingAs($staff)
            ->patch(route('admin.bookings.status.update', $booking), ['status' => 'confirmed'])
            ->assertSessionHasNoErrors();
        expect($booking->refresh()->status)->toBe('confirmed');

        $this->actingAs($staff)
            ->patch(route('admin.bookings.status.update', $booking), ['status' => 'completed'])
            ->assertSessionHasNoErrors();
        expect($booking->refresh()->status)->toBe('completed');
    });

    test('invalid status transitions are rejected without changing the booking', function () {
        $staff = bookingModuleUser('staff@travel.com');
        $booking = Booking::factory()->create(['status' => 'pending']);

        $this->actingAs($staff)
            ->patch(route('admin.bookings.status.update', $booking), ['status' => 'completed'])
            ->assertSessionHasErrors([
                'status' => 'This booking status transition is not allowed.',
            ]);

        expect($booking->refresh()->status)->toBe('pending');
    });

    test('admin can delete a booking without an invoice', function () {
        $admin = bookingModuleUser('admin@travel.com');
        $booking = Booking::factory()->create();

        $this->actingAs($admin)
            ->delete(route('admin.bookings.destroy', $booking))
            ->assertRedirect(route('admin.bookings.index'));

        $this->assertModelMissing($booking);
    });

    test('admin cannot delete a booking with an invoice', function () {
        $admin = bookingModuleUser('admin@travel.com');
        $booking = Booking::factory()->create();
        Invoice::factory()->for($booking)->create();

        $this->actingAs($admin)
            ->delete(route('admin.bookings.destroy', $booking))
            ->assertRedirect();

        $this->assertModelExists($booking);
    });
});

/**
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function validBookingPayload(Customer $customer, Package $package, array $overrides = []): array
{
    return array_replace([
        'customer_id' => $customer->id,
        'package_id' => $package->id,
        'departure_date' => now()->addMonth()->toDateString(),
        'participant_count' => 2,
    ], $overrides);
}
