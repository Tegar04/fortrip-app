<?php

use App\Models\Booking;
use App\Models\Customer;
use App\Models\Package;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Inertia\Testing\AssertableInertia as Assert;

function customerModuleUser(string $email): User
{
    test()->seed(RoleAndPermissionSeeder::class);

    return User::query()->where('email', $email)->firstOrFail();
}

describe('index and access', function () {
    test('guests are redirected from the customer list', function () {
        $this->get(route('admin.customers.index'))
            ->assertRedirect(route('login'));
    });

    test('staff can view customers with their booking counts', function () {
        $this->withoutVite();
        $staff = customerModuleUser('staff@travel.com');
        $customer = Customer::factory()->create();
        Booking::factory()->count(2)->for($customer)->create();

        $this->actingAs($staff)
            ->get(route('admin.customers.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/customers/index')
                ->has('customers', 1)
                ->where('customers.0.id', $customer->id)
                ->where('customers.0.bookings_count', 2));
    });

    test('staff cannot delete customers', function () {
        $staff = customerModuleUser('staff@travel.com');
        $customer = Customer::factory()->create();

        $this->actingAs($staff)
            ->delete(route('admin.customers.destroy', $customer))
            ->assertForbidden();

        $this->assertModelExists($customer);
    });
});

describe('create and update', function () {
    test('staff can create a customer', function () {
        $staff = customerModuleUser('staff@travel.com');

        $response = $this->actingAs($staff)
            ->post(route('admin.customers.store'), validCustomerPayload());

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('admin.customers.index'));
        $this->assertDatabaseHas('customers', [
            'name' => 'Siti Rahma',
            'email' => 'siti@example.com',
            'phone' => '081234567890',
        ]);
    });

    test('invalid customer contact data is rejected', function () {
        $staff = customerModuleUser('staff@travel.com');

        $response = $this->actingAs($staff)
            ->post(route('admin.customers.store'), validCustomerPayload([
                'name' => '',
                'email' => 'bukan-email',
                'phone' => '',
            ]));

        $response->assertSessionHasErrors(['name', 'email', 'phone']);
        $this->assertDatabaseCount('customers', 0);
    });

    test('staff can update a customer', function () {
        $staff = customerModuleUser('staff@travel.com');
        $customer = Customer::factory()->create(['name' => 'Nama Lama']);

        $this->actingAs($staff)
            ->put(
                route('admin.customers.update', $customer),
                validCustomerPayload(['name' => 'Nama Baru']),
            )
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('admin.customers.index'));

        expect($customer->refresh()->name)->toBe('Nama Baru');
    });
});

describe('deletion', function () {
    test('admin can delete a customer without bookings', function () {
        $admin = customerModuleUser('admin@travel.com');
        $customer = Customer::factory()->create();

        $this->actingAs($admin)
            ->delete(route('admin.customers.destroy', $customer))
            ->assertRedirect(route('admin.customers.index'));

        $this->assertModelMissing($customer);
    });

    test('admin cannot delete a customer with bookings', function () {
        $admin = customerModuleUser('admin@travel.com');
        $customer = Customer::factory()->create();
        $package = Package::factory()->create();
        $booking = Booking::factory()->for($customer)->for($package)->create();

        $this->actingAs($admin)
            ->delete(route('admin.customers.destroy', $customer))
            ->assertRedirect();

        $this->assertModelExists($customer);
        $this->assertModelExists($booking);
    });
});

/**
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function validCustomerPayload(array $overrides = []): array
{
    return array_replace([
        'name' => 'Siti Rahma',
        'email' => 'siti@example.com',
        'phone' => '081234567890',
        'address' => 'Jl. Merdeka No. 10, Jakarta',
    ], $overrides);
}
