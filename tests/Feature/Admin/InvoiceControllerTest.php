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

function invoiceModuleUser(string $email): User
{
    test()->seed(RoleAndPermissionSeeder::class);

    return User::query()->where('email', $email)->firstOrFail();
}

describe('invoice access and pages', function () {
    test('guests are redirected from the invoice list', function () {
        $this->get(route('admin.invoices.index'))
            ->assertRedirect(route('login'));
    });

    test('staff can view an invoice with booking and payment data', function () {
        $this->withoutVite();
        $staff = invoiceModuleUser('staff@travel.com');
        $invoice = Invoice::factory()->create();
        Payment::factory()->for($invoice)->create([
            'amount' => '250000.00',
            'status' => 'paid',
        ]);

        $this->actingAs($staff)
            ->get(route('admin.invoices.show', $invoice))
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/invoices/show')
                ->where('invoice.id', $invoice->id)
                ->where('invoice.booking.id', $invoice->booking_id)
                ->has('invoice.payments', 1));
    });

    test('staff cannot delete invoices', function () {
        $staff = invoiceModuleUser('staff@travel.com');
        $invoice = Invoice::factory()->create();

        $this->actingAs($staff)
            ->delete(route('admin.invoices.destroy', $invoice))
            ->assertForbidden();

        $this->assertModelExists($invoice);
    });

    test('an invoice becomes overdue only after its due date', function () {
        $this->travelTo(CarbonImmutable::parse('2026-09-03 10:00:00'));
        $invoice = Invoice::factory()->create([
            'amount' => '1000000.00',
            'due_date' => '2026-09-03',
            'status' => 'unpaid',
        ]);

        expect($invoice->calculatedStatus())->toBe('unpaid');

        $this->travelTo(CarbonImmutable::parse('2026-09-04 00:01:00'));
        expect($invoice->calculatedStatus())->toBe('overdue');
    });
});

describe('invoice creation', function () {
    test('staff creates an invoice with a generated number and server-owned amount', function () {
        $this->travelTo(CarbonImmutable::parse('2026-09-03 10:00:00'));
        $staff = invoiceModuleUser('staff@travel.com');
        $booking = Booking::factory()->create([
            'total_price' => '3750000.00',
            'status' => 'confirmed',
        ]);

        $response = $this->actingAs($staff)->post(route('admin.invoices.store'), [
            'booking_id' => $booking->id,
            'due_date' => '2026-09-10',
            'amount' => 1,
            'status' => 'paid',
            'invoice_number' => 'FORGED',
        ]);

        $invoice = Invoice::query()->sole();
        $response->assertSessionHasNoErrors()
            ->assertRedirect(route('admin.invoices.show', $invoice));
        expect($invoice->invoice_number)->toBe(sprintf('INV-20260903-%04d', $booking->id))
            ->and($invoice->amount)->toBe('3750000.00')
            ->and($invoice->issued_date->toDateString())->toBe('2026-09-03')
            ->and($invoice->status)->toBe('unpaid');
    });

    test('cancelled bookings and bookings with invoices are rejected', function () {
        $staff = invoiceModuleUser('staff@travel.com');
        $cancelledBooking = Booking::factory()->create(['status' => 'cancelled']);
        $invoicedBooking = Booking::factory()->create(['status' => 'confirmed']);
        Invoice::factory()->for($invoicedBooking)->create();

        $this->actingAs($staff)
            ->post(route('admin.invoices.store'), ['booking_id' => $cancelledBooking->id])
            ->assertSessionHasErrors('booking_id');
        $this->actingAs($staff)
            ->post(route('admin.invoices.store'), ['booking_id' => $invoicedBooking->id])
            ->assertSessionHasErrors('booking_id');

        $this->assertDatabaseCount('invoices', 1);
    });
});

describe('invoice download and deletion', function () {
    test('staff downloads a generated invoice pdf', function () {
        $staff = invoiceModuleUser('staff@travel.com');
        $invoice = Invoice::factory()->create([
            'invoice_number' => 'INV-20260903-0001',
        ]);

        $this->actingAs($staff)
            ->get(route('admin.invoices.download', $invoice))
            ->assertDownload('INV-20260903-0001.pdf')
            ->assertHeader('content-type', 'application/pdf');
    });

    test('the pdf template escapes customer and package content', function () {
        $customer = Customer::factory()->create([
            'name' => '<script>alert("customer")</script>',
        ]);
        $package = Package::factory()->create([
            'title' => '<script>alert("package")</script>',
        ]);
        $booking = Booking::factory()->for($customer)->for($package)->create();
        $invoice = Invoice::factory()->for($booking)->create();
        $invoice->load(['booking.customer', 'booking.package']);

        $html = view('pdf.invoice', [
            'invoice' => $invoice,
            'settings' => [],
            'paidAmount' => '0.00',
            'remainingAmount' => $invoice->amount,
        ])->render();

        expect($html)
            ->not->toContain('<script>alert("customer")</script>')
            ->not->toContain('<script>alert("package")</script>')
            ->toContain('&lt;script&gt;alert');
    });

    test('admin deletes an invoice without payments', function () {
        $admin = invoiceModuleUser('admin@travel.com');
        $invoice = Invoice::factory()->create();

        $this->actingAs($admin)
            ->delete(route('admin.invoices.destroy', $invoice))
            ->assertRedirect(route('admin.invoices.index'));

        $this->assertModelMissing($invoice);
    });

    test('admin cannot delete an invoice with payment history', function () {
        $admin = invoiceModuleUser('admin@travel.com');
        $invoice = Invoice::factory()->create();
        Payment::factory()->for($invoice)->create();

        $this->actingAs($admin)
            ->delete(route('admin.invoices.destroy', $invoice))
            ->assertRedirect();

        $this->assertModelExists($invoice);
    });
});
