<?php

use App\Models\Invoice;
use App\Models\Payment;
use App\Models\User;
use Carbon\CarbonImmutable;
use Database\Seeders\RoleAndPermissionSeeder;

function paymentModuleUser(string $email): User
{
    test()->seed(RoleAndPermissionSeeder::class);

    return User::query()->where('email', $email)->firstOrFail();
}

test('staff records a successful payment and the invoice becomes paid', function () {
    $this->travelTo(CarbonImmutable::parse('2026-09-03 10:15:00'));
    $staff = paymentModuleUser('staff@travel.com');
    $invoice = Invoice::factory()->create([
        'amount' => '1500000.00',
        'status' => 'unpaid',
    ]);

    $this->actingAs($staff)->post(route('admin.invoices.payments.store', $invoice), [
        'payment_reference' => 'TRX-001',
        'amount' => '1500000.00',
        'payment_method' => 'bank_transfer',
        'status' => 'paid',
        'paid_at' => now()->subYear()->toDateTimeString(),
        'notes' => 'Lunas melalui transfer.',
    ])->assertSessionHasNoErrors();

    $payment = Payment::query()->sole();
    expect($payment->payment_reference)->toBe('TRX-001')
        ->and($payment->paid_at->toDateTimeString())->toBe('2026-09-03 10:15:00')
        ->and($invoice->refresh()->status)->toBe('paid');
});

test('a partial successful payment leaves the invoice unpaid', function () {
    $staff = paymentModuleUser('staff@travel.com');
    $invoice = Invoice::factory()->create([
        'amount' => '1500000.00',
        'due_date' => now()->addWeek(),
        'status' => 'unpaid',
    ]);

    $this->actingAs($staff)->post(
        route('admin.invoices.payments.store', $invoice),
        validPaymentPayload(['amount' => '500000.00']),
    )->assertSessionHasNoErrors();

    expect($invoice->refresh()->status)->toBe('unpaid')
        ->and($invoice->remainingAmount())->toBe('1000000.00');
});

test('payments over the remaining balance are rejected', function () {
    $staff = paymentModuleUser('staff@travel.com');
    $invoice = Invoice::factory()->create(['amount' => '1000000.00']);
    Payment::factory()->for($invoice)->create([
        'amount' => '750000.00',
        'status' => 'paid',
    ]);

    $this->actingAs($staff)->post(
        route('admin.invoices.payments.store', $invoice),
        validPaymentPayload(['amount' => '250000.01']),
    )->assertSessionHasErrors([
        'amount' => 'The payment amount cannot exceed the remaining invoice balance.',
    ]);

    $this->assertDatabaseCount('payments', 1);
});

test('invalid payment method and status are rejected', function () {
    $staff = paymentModuleUser('staff@travel.com');
    $invoice = Invoice::factory()->create(['amount' => '1000000.00']);

    $this->actingAs($staff)->post(
        route('admin.invoices.payments.store', $invoice),
        validPaymentPayload([
            'payment_method' => 'credit_card',
            'status' => 'refunded',
        ]),
    )->assertSessionHasErrors(['payment_method', 'status']);

    $this->assertDatabaseCount('payments', 0);
});

test('pending and failed payments do not reduce the invoice balance', function (string $status) {
    $staff = paymentModuleUser('staff@travel.com');
    $invoice = Invoice::factory()->create(['amount' => '1000000.00']);

    $this->actingAs($staff)->post(
        route('admin.invoices.payments.store', $invoice),
        validPaymentPayload(['amount' => '1000000.00', 'status' => $status]),
    )->assertSessionHasNoErrors();

    expect($invoice->refresh()->status)->toBe('unpaid')
        ->and($invoice->remainingAmount())->toBe('1000000.00');
})->with(['pending', 'failed']);

test('admin deletes a payment and recalculates the invoice status', function () {
    $admin = paymentModuleUser('admin@travel.com');
    $invoice = Invoice::factory()->create([
        'amount' => '1000000.00',
        'due_date' => now()->addWeek(),
        'status' => 'paid',
    ]);
    $payment = Payment::factory()->for($invoice)->create([
        'amount' => '1000000.00',
        'status' => 'paid',
    ]);

    $this->actingAs($admin)
        ->delete(route('admin.invoices.payments.destroy', [$invoice, $payment]))
        ->assertRedirect();

    $this->assertModelMissing($payment);
    expect($invoice->refresh()->status)->toBe('unpaid');
});

test('staff cannot delete payment history', function () {
    $staff = paymentModuleUser('staff@travel.com');
    $invoice = Invoice::factory()->create();
    $payment = Payment::factory()->for($invoice)->create();

    $this->actingAs($staff)
        ->delete(route('admin.invoices.payments.destroy', [$invoice, $payment]))
        ->assertForbidden();

    $this->assertModelExists($payment);
});

/**
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function validPaymentPayload(array $overrides = []): array
{
    return array_replace([
        'payment_reference' => 'TRX-DEFAULT',
        'amount' => '1000000.00',
        'payment_method' => 'bank_transfer',
        'status' => 'paid',
        'notes' => null,
    ], $overrides);
}
