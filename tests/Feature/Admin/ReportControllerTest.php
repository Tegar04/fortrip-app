<?php

use App\Exports\BookingsExport;
use App\Models\Booking;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Package;
use App\Models\Payment;
use App\Models\User;
use Carbon\CarbonImmutable;
use Database\Seeders\RoleAndPermissionSeeder;
use Inertia\Testing\AssertableInertia as Assert;
use Maatwebsite\Excel\Excel as ExcelFormat;
use Maatwebsite\Excel\Facades\Excel;
use PhpOffice\PhpSpreadsheet\IOFactory;

function reportModuleUser(string $email): User
{
    test()->seed(RoleAndPermissionSeeder::class);

    return User::query()->where('email', $email)->firstOrFail();
}

test('guests are redirected from reports', function () {
    $this->get(route('admin.reports.index'))
        ->assertRedirect(route('login'));
});

test('users without an operational role cannot view reports', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('admin.reports.index'))
        ->assertForbidden();
});

test('staff sees period statistics, status counts, and matching booking rows', function () {
    $this->withoutVite();
    $this->travelTo(CarbonImmutable::parse('2026-09-03 12:00:00'));
    $staff = reportModuleUser('staff@travel.com');

    $pending = Booking::factory()->create([
        'status' => 'pending',
        'total_price' => '100000.00',
        'created_at' => '2026-08-05 08:00:00',
    ]);
    $confirmed = Booking::factory()->create([
        'status' => 'confirmed',
        'total_price' => '200000.00',
        'created_at' => '2026-08-10 08:00:00',
    ]);
    $completed = Booking::factory()->create([
        'status' => 'completed',
        'total_price' => '300000.00',
        'created_at' => '2026-08-15 08:00:00',
    ]);
    Booking::factory()->create([
        'status' => 'cancelled',
        'total_price' => '400000.00',
        'created_at' => '2026-08-20 08:00:00',
    ]);
    Booking::factory()->create([
        'status' => 'completed',
        'total_price' => '900000.00',
        'created_at' => '2026-07-31 23:59:59',
    ]);

    $confirmedInvoice = Invoice::factory()->for($confirmed)->create(['amount' => '200000.00']);
    Payment::factory()->for($confirmedInvoice)->create([
        'amount' => '150000.00',
        'status' => 'paid',
    ]);
    Payment::factory()->for($confirmedInvoice)->create([
        'amount' => '50000.00',
        'status' => 'pending',
    ]);
    $completedInvoice = Invoice::factory()->for($completed)->create(['amount' => '300000.00']);
    Payment::factory()->for($completedInvoice)->create([
        'amount' => '300000.00',
        'status' => 'paid',
    ]);

    $this->actingAs($staff)
        ->get(route('admin.reports.index', [
            'start_date' => '2026-08-01',
            'end_date' => '2026-08-31',
        ]))
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/reports/index')
            ->where('filters.start_date', '2026-08-01')
            ->where('filters.end_date', '2026-08-31')
            ->where('statistics.total_bookings', 4)
            ->where('statistics.total_booking_value', 600000)
            ->where('statistics.total_revenue', 450000)
            ->where('statistics.status_counts', [
                'pending' => 1,
                'confirmed' => 1,
                'cancelled' => 1,
                'completed' => 1,
            ])
            ->where('charts.granularity', 'day')
            ->has('charts.points', 31)
            ->where('charts.points.4.pending', 1)
            ->where('charts.points.9.confirmed', 1)
            ->where('charts.points.9.revenue', 150000)
            ->where('charts.points.14.completed', 1)
            ->where('charts.points.14.revenue', 300000)
            ->where('charts.points.19.cancelled', 1)
            ->has('bookings.data', 4)
            ->where('bookings.data.3.id', $pending->id));
});

test('report charts adapt their granularity to the selected period', function () {
    $this->withoutVite();
    $staff = reportModuleUser('staff@travel.com');

    $this->actingAs($staff)
        ->get(route('admin.reports.index', [
            'start_date' => '2026-08-01',
            'end_date' => '2026-12-31',
        ]))
        ->assertInertia(fn (Assert $page) => $page
            ->where('charts.granularity', 'week')
            ->has('charts.points', 22));

    $this->actingAs($staff)
        ->get(route('admin.reports.index', [
            'start_date' => '2026-01-01',
            'end_date' => '2026-08-31',
        ]))
        ->assertInertia(fn (Assert $page) => $page
            ->where('charts.granularity', 'month')
            ->has('charts.points', 8));
});

test('reports default to the current month', function () {
    $this->withoutVite();
    $this->travelTo(CarbonImmutable::parse('2026-09-03 12:00:00'));
    $staff = reportModuleUser('staff@travel.com');

    $this->actingAs($staff)
        ->get(route('admin.reports.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.start_date', '2026-09-01')
            ->where('filters.end_date', '2026-09-03'));
});

test('an end date before the start date is rejected', function () {
    $staff = reportModuleUser('staff@travel.com');

    $this->actingAs($staff)
        ->get(route('admin.reports.index', [
            'start_date' => '2026-09-03',
            'end_date' => '2026-09-01',
        ]))
        ->assertSessionHasErrors('end_date');
});

test('staff downloads a filtered bookings export', function () {
    Excel::fake();
    $staff = reportModuleUser('staff@travel.com');

    $this->actingAs($staff)
        ->get(route('admin.reports.export', [
            'start_date' => '2026-08-01',
            'end_date' => '2026-08-31',
        ]))
        ->assertOk();

    Excel::assertDownloaded(
        'laporan-booking-2026-08-01-sampai-2026-08-31.xlsx',
        fn (BookingsExport $export): bool => $export->startDate === '2026-08-01'
            && $export->endDate === '2026-08-31',
    );
});

test('the real workbook contains typed values, formatting, and formula injection protection', function () {
    $customer = Customer::factory()->create([
        'name' => '=2+2',
        'phone' => '+628123456789',
    ]);
    $package = Package::factory()->create([
        'title' => '@SUM(A1:A2)',
        'destination' => 'Bali',
    ]);
    $booking = Booking::factory()->for($customer)->for($package)->create([
        'status' => 'confirmed',
        'total_price' => '1000000.00',
        'created_at' => '2026-08-10 08:00:00',
    ]);
    $invoice = Invoice::factory()->for($booking)->create([
        'amount' => '1000000.00',
        'due_date' => '2026-08-20',
    ]);
    Payment::factory()->for($invoice)->create([
        'amount' => '250000.00',
        'status' => 'paid',
    ]);

    $contents = Excel::raw(
        new BookingsExport('2026-08-01', '2026-08-31'),
        ExcelFormat::XLSX,
    );
    $temporaryFile = tempnam(sys_get_temp_dir(), 'fortrip-report-');
    file_put_contents($temporaryFile, $contents);

    try {
        $spreadsheet = IOFactory::load($temporaryFile);
        $sheet = $spreadsheet->getActiveSheet();

        expect($sheet->getTitle())->toBe('Laporan Booking')
            ->and($sheet->getCell('A1')->getValue())->toBe('No.')
            ->and($sheet->getCell('C2')->getValue())->toBe("'=2+2")
            ->and($sheet->getCell('D2')->getValue())->toBe("'+628123456789")
            ->and($sheet->getCell('E2')->getValue())->toBe("'@SUM(A1:A2)")
            ->and($sheet->getCell('J2')->getValue())->toBe(1000000.0)
            ->and($sheet->getCell('M2')->getValue())->toBe(250000.0)
            ->and($sheet->getCell('N2')->getValue())->toBe(750000.0)
            ->and($sheet->getStyle('J2')->getNumberFormat()->getFormatCode())->toBe('"Rp" #,##0')
            ->and($sheet->getStyle('A1')->getFont()->getBold())->toBeTrue()
            ->and($sheet->getAutoFilter()->getRange())->toBe('A1:N2')
            ->and($sheet->getFreezePane())->toBe('A2');
    } finally {
        @unlink($temporaryFile);
    }
});
