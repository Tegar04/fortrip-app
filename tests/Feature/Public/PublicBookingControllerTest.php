<?php

use App\Models\Booking;
use App\Models\Customer;
use App\Models\Package;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Exceptions;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;

/** @return array<string, mixed> */
function publicBookingPayload(array $overrides = []): array
{
    return array_replace([
        'name' => 'Siti Rahma',
        'phone' => '0812-3456-7890',
        'email' => 'siti@example.com',
        'address' => 'Jl. Merdeka 10',
        'departure_date' => today()->toDateString(),
        'participant_count' => 3,
        'submission_token' => (string) Str::uuid(),
    ], $overrides);
}

test('guests can book today with authoritative price status and package', function () {
    $this->freezeTime();
    $package = Package::factory()->create(['price' => '1250000.15']);
    $otherPackage = Package::factory()->create();
    $otherCustomer = Customer::factory()->create();

    $this->post(route('packages.bookings.store', $package->slug), publicBookingPayload([
        'price' => 1, 'total_price' => 1, 'status' => 'completed',
        'package_id' => $otherPackage->id, 'customer_id' => $otherCustomer->id,
        'public_submission_key' => 'attacker-controlled',
    ]))->assertSessionHasNoErrors()->assertRedirect(route('packages.show', $package->slug));

    $booking = Booking::query()->sole();
    expect($booking->total_price)->toBe('3750000.45')
        ->and($booking->status)->toBe('pending')
        ->and($booking->package_id)->toBe($package->id)
        ->and($booking->customer_id)->not->toBe($otherCustomer->id)
        ->and($booking->departure_date->toDateString())->toBe(today()->toDateString())
        ->and($booking->toArray())->not->toHaveKey('public_submission_key');
    $this->assertDatabaseHas('customers', ['id' => $booking->customer_id, 'phone' => '6281234567890', 'name' => 'Siti Rahma']);
    $this->assertDatabaseCount('invoices', 0);
});

test('public detail provides date limits and a submission token without customer data', function () {
    $this->withoutVite();
    config(['app.timezone' => 'Asia/Jakarta']);
    $this->travelTo(new DateTimeImmutable('2026-09-09 00:30:00', new DateTimeZone('Asia/Jakarta')));
    $package = Package::factory()->create();
    Customer::factory()->create(['name' => 'Private Customer']);

    $this->get(route('packages.show', $package->slug))->assertInertia(fn (Assert $page) => $page
        ->where('booking.min_departure_date', '2026-09-09')
        ->where('booking.max_participants', 50)
        ->where('booking.submission_token', fn ($token) => Str::isUuid($token))
        ->missing('customers')
        ->missing('package.public_submission_key'));
});

test('participant boundaries and an optional address are accepted', function (int $participants) {
    $this->freezeTime();
    $package = Package::factory()->create(['price' => '100.00']);
    $payload = publicBookingPayload(['participant_count' => $participants, 'departure_date' => today()->addDay()->toDateString()]);
    unset($payload['address']);

    $this->post(route('packages.bookings.store', $package->slug), $payload)->assertSessionHasNoErrors()->assertRedirect();

    $this->assertDatabaseHas('bookings', ['participant_count' => $participants, 'status' => 'pending']);
    $this->assertDatabaseHas('customers', ['email' => 'siti@example.com', 'address' => null]);
})->with([1, 50]);

test('invalid booking input saves neither customer nor booking', function (string $field, mixed $value, string $message) {
    $this->freezeTime();
    $package = Package::factory()->create();

    $this->from(route('packages.show', $package->slug))
        ->post(route('packages.bookings.store', $package->slug), publicBookingPayload([$field => $value]))
        ->assertRedirect(route('packages.show', $package->slug))
        ->assertSessionHasErrors([$field => $message]);

    $this->assertDatabaseCount('customers', 0);
    $this->assertDatabaseCount('bookings', 0);
})->with([
    'name required' => ['name', '', 'Nama wajib diisi.'],
    'name array' => ['name', ['bad'], 'Nama harus berupa teks.'],
    'name length' => ['name', str_repeat('a', 256), 'Nama maksimal 255 karakter.'],
    'phone required' => ['phone', '', 'Nomor telepon wajib diisi.'],
    'phone array' => ['phone', ['081234567890'], 'Nomor telepon harus berupa teks.'],
    'phone letters' => ['phone', '0812abc34567890', 'Masukkan nomor telepon yang valid, misalnya 081234567890 atau +6281234567890.'],
    'phone too short' => ['phone', '123', 'Masukkan nomor telepon yang valid, misalnya 081234567890 atau +6281234567890.'],
    'phone too long' => ['phone', str_repeat('6', 16), 'Masukkan nomor telepon yang valid, misalnya 081234567890 atau +6281234567890.'],
    'email required' => ['email', '', 'Email wajib diisi.'],
    'email null' => ['email', null, 'Email wajib diisi.'],
    'email format' => ['email', 'invalid', 'Masukkan alamat email yang valid.'],
    'email length' => ['email', str_repeat('a', 245).'@example.com', 'Email maksimal 255 karakter.'],
    'address array' => ['address', ['bad'], 'Alamat harus berupa teks.'],
    'address length' => ['address', str_repeat('a', 1001), 'Alamat maksimal 1000 karakter.'],
    'date required' => ['departure_date', '', 'Tanggal keberangkatan wajib diisi.'],
    'date format' => ['departure_date', 'next Monday', 'Masukkan tanggal keberangkatan yang valid.'],
    'date impossible' => ['departure_date', '2027-02-30', 'Masukkan tanggal keberangkatan yang valid.'],
    'past date' => ['departure_date', '2000-01-01', 'Tanggal keberangkatan tidak boleh sebelum hari ini.'],
    'count required' => ['participant_count', '', 'Jumlah peserta wajib diisi.'],
    'count zero' => ['participant_count', 0, 'Jumlah peserta minimal 1 orang.'],
    'count negative' => ['participant_count', -1, 'Jumlah peserta minimal 1 orang.'],
    'count too high' => ['participant_count', 51, 'Jumlah peserta maksimal 50 orang.'],
    'count fractional' => ['participant_count', 1.5, 'Jumlah peserta harus berupa bilangan bulat.'],
    'token required' => ['submission_token', '', 'Token pengajuan wajib diisi.'],
    'token invalid' => ['submission_token', 'invalid', 'Form booking tidak valid. Muat ulang halaman lalu coba lagi.'],
]);

test('inactive packages cannot receive bookings even after their page was opened', function () {
    $this->withoutVite();
    $this->freezeTime();
    $package = Package::factory()->create();
    $this->get(route('packages.show', $package->slug))->assertOk();
    $package->update(['is_active' => false]);

    $this->post(route('packages.bookings.store', $package->slug), publicBookingPayload())->assertNotFound();

    $this->assertDatabaseCount('customers', 0);
    $this->assertDatabaseCount('bookings', 0);
});

test('missing package slugs cannot receive bookings', function () {
    $this->freezeTime();
    $this->post(route('packages.bookings.store', 'missing-package'), publicBookingPayload())->assertNotFound();
    $this->assertDatabaseCount('bookings', 0);
    $this->assertDatabaseCount('customers', 0);
});

test('matching normalized contacts reuse a customer without modifying it', function (string $phone) {
    $this->freezeTime();
    $package = Package::factory()->create();
    $customer = Customer::factory()->create([
        'name' => 'Siti Rahma', 'phone' => '6281234567890',
        'email' => 'siti@example.com', 'address' => 'Jl. Merdeka 10',
    ]);
    $original = $customer->getAttributes();

    $this->post(route('packages.bookings.store', $package->slug), publicBookingPayload(['phone' => $phone]))->assertSessionHasNoErrors();

    $this->assertDatabaseCount('customers', 1);
    $this->assertDatabaseHas('bookings', ['customer_id' => $customer->id]);
    expect($customer->fresh()->getAttributes())->toEqual($original);
})->with(['0812-3456-7890', '+6281234567890', '+62 (812) 3456-7890', '6281234567890']);

test('the same phone with different contact details cannot overwrite an existing customer', function () {
    $this->freezeTime();
    $package = Package::factory()->create();
    $customer = Customer::factory()->create(['phone' => '6281234567890']);
    $original = $customer->getAttributes();

    $this->post(route('packages.bookings.store', $package->slug), publicBookingPayload())->assertSessionHasNoErrors();

    expect($customer->fresh()->getAttributes())->toEqual($original)
        ->and(Booking::query()->sole()->customer_id)->not->toBe($customer->id);
    $this->assertDatabaseCount('customers', 2);
    $this->assertDatabaseHas('customers', ['phone' => '6281234567890', 'name' => 'Siti Rahma']);
});

test('replaying a submission creates only one booking and returns a private success message', function () {
    $this->freezeTime();
    $this->withoutVite();
    $package = Package::factory()->create();
    $payload = publicBookingPayload();
    $this->post(route('packages.bookings.store', $package->slug), $payload)->assertSessionHasNoErrors();

    $this->post(route('packages.bookings.store', $package->slug), $payload)->assertSessionHasNoErrors()->assertRedirect();

    $this->assertDatabaseCount('bookings', 1);
    $this->assertDatabaseCount('customers', 1);
    $this->get(route('packages.show', $package->slug))->assertInertia(fn (Assert $page) => $page
        ->hasFlash('toast.type', 'success')
        ->hasFlash('toast.message', 'Pengajuan booking diterima. Admin akan menghubungi Anda untuk mengonfirmasi ketersediaan dan keberangkatan.')
        ->missing('customer')->missing('invoice')->missing('booking.id'));
});

test('new submission tokens allow a separate intentional booking', function () {
    $this->freezeTime();
    $package = Package::factory()->create();
    $this->post(route('packages.bookings.store', $package->slug), publicBookingPayload())->assertSessionHasNoErrors();

    $this->post(route('packages.bookings.store', $package->slug), publicBookingPayload())->assertSessionHasNoErrors();

    $this->assertDatabaseCount('bookings', 2);
    $this->assertDatabaseCount('customers', 1);
});

test('excessive requests are rate limited before writing data', function () {
    $this->freezeTime();
    $package = Package::factory()->create();
    for ($attempt = 0; $attempt < 5; $attempt++) {
        $this->post(route('packages.bookings.store', $package->slug), [])->assertSessionHasErrors();
    }

    $this->post(route('packages.bookings.store', $package->slug), publicBookingPayload())->assertTooManyRequests()->assertHeader('Retry-After');

    $this->assertDatabaseCount('bookings', 0);
    $this->assertDatabaseCount('customers', 0);
});

test('totals exceeding database precision are rejected without partial writes', function () {
    $this->freezeTime();
    $package = Package::factory()->create(['price' => '9999999999.99']);

    $this->post(route('packages.bookings.store', $package->slug), publicBookingPayload())
        ->assertSessionHasErrors(['participant_count' => 'Total harga melebihi batas pemesanan. Kurangi jumlah peserta atau hubungi admin.']);

    $this->assertDatabaseCount('bookings', 0);
    $this->assertDatabaseCount('customers', 0);
});

test('a booking persistence failure rolls back the newly created customer', function () {
    $this->freezeTime();
    $package = Package::factory()->create();
    Exceptions::fake();
    DB::statement("CREATE TRIGGER reject_test_booking BEFORE INSERT ON bookings BEGIN SELECT RAISE(ABORT, 'Booking persistence failure'); END");

    $this->post(route('packages.bookings.store', $package->slug), publicBookingPayload())->assertInternalServerError();

    $this->assertDatabaseCount('bookings', 0);
    $this->assertDatabaseCount('customers', 0);
    Exceptions::assertReported(QueryException::class);
});

test('local today is accepted after midnight in the application timezone', function () {
    config(['app.timezone' => 'Asia/Jakarta']);
    $this->travelTo(new DateTimeImmutable('2026-09-09 00:30:00', new DateTimeZone('Asia/Jakarta')));
    $package = Package::factory()->create();

    $this->post(route('packages.bookings.store', $package->slug), publicBookingPayload(['departure_date' => '2026-09-09']))
        ->assertSessionHasNoErrors();

    $this->assertDatabaseHas('bookings', ['departure_date' => '2026-09-09 00:00:00']);
});

test('UTC today is rejected when it is already yesterday in the application timezone', function () {
    config(['app.timezone' => 'Asia/Jakarta']);
    $this->travelTo(new DateTimeImmutable('2026-09-09 00:30:00', new DateTimeZone('Asia/Jakarta')));
    $package = Package::factory()->create();

    $this->post(route('packages.bookings.store', $package->slug), publicBookingPayload(['departure_date' => '2026-09-08']))
        ->assertSessionHasErrors(['departure_date' => 'Tanggal keberangkatan tidak boleh sebelum hari ini.']);

    $this->assertDatabaseCount('bookings', 0);
    $this->assertDatabaseCount('customers', 0);
});
test('hourly rate limiting prevents sustained submissions across minute windows', function () {
    $this->freezeTime();
    $package = Package::factory()->create();
    for ($window = 0; $window < 4; $window++) {
        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->post(route('packages.bookings.store', $package->slug), [])->assertSessionHasErrors();
        }
        $this->travel(61)->seconds();
    }

    $this->post(route('packages.bookings.store', $package->slug), publicBookingPayload())->assertTooManyRequests();

    $this->assertDatabaseCount('bookings', 0);
    $this->assertDatabaseCount('customers', 0);
});

test('submission token casing cannot bypass duplicate protection', function () {
    $this->freezeTime();
    $package = Package::factory()->create();
    $payload = publicBookingPayload();
    $this->post(route('packages.bookings.store', $package->slug), $payload)->assertSessionHasNoErrors();

    $this->post(route('packages.bookings.store', $package->slug), array_replace($payload, ['submission_token' => strtoupper($payload['submission_token'])]))->assertSessionHasNoErrors();

    $this->assertDatabaseCount('bookings', 1);
    $this->assertDatabaseCount('customers', 1);
});

test('booking submissions without csrf protection are rejected outside the test bypass', function () {
    $this->freezeTime();
    $package = Package::factory()->create();
    $this->app['env'] = 'local';

    $this->post(route('packages.bookings.store', $package->slug), publicBookingPayload())->assertStatus(419);

    $this->assertDatabaseCount('bookings', 0);
    $this->assertDatabaseCount('customers', 0);
});

test('omitting email rejects the booking without saving customer data', function () {
    $this->freezeTime();
    $package = Package::factory()->create();
    $payload = publicBookingPayload();
    unset($payload['email']);

    $this->post(route('packages.bookings.store', $package->slug), $payload)
        ->assertSessionHasErrors(['email' => 'Email wajib diisi.']);

    $this->assertDatabaseCount('bookings', 0);
    $this->assertDatabaseCount('customers', 0);
});
