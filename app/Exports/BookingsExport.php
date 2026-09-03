<?php

namespace App\Exports;

use App\Actions\BuildBookingReportQuery;
use App\Models\Booking;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithFreezePane;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Shared\Date as ExcelDate;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/** @implements WithMapping<Booking> */
class BookingsExport implements FromQuery, WithColumnFormatting, WithColumnWidths, WithFreezePane, WithHeadings, WithMapping, WithStyles, WithTitle
{
    public function __construct(
        public readonly string $startDate,
        public readonly string $endDate,
    ) {}

    /** @return Builder<Booking> */
    public function query(): Builder
    {
        return (new BuildBookingReportQuery)->handle(
            CarbonImmutable::parse($this->startDate),
            CarbonImmutable::parse($this->endDate),
        )
            ->with([
                'customer:id,name,phone',
                'package:id,title,destination',
                'invoice:id,booking_id,invoice_number,amount,due_date,status',
                'invoice.payments' => fn ($query) => $query
                    ->where('status', 'paid')
                    ->select(['id', 'invoice_id', 'amount', 'status']),
            ])
            ->orderBy('created_at')
            ->orderBy('id');
    }

    /** @return list<string> */
    public function headings(): array
    {
        return [
            'No.',
            'Tanggal Booking',
            'Customer',
            'Telepon',
            'Package',
            'Tujuan',
            'Tanggal Berangkat',
            'Peserta',
            'Status Booking',
            'Total Booking',
            'Nomor Invoice',
            'Status Invoice',
            'Sudah Dibayar',
            'Sisa Tagihan',
        ];
    }

    /** @return list<int|float|string|null> */
    public function map(mixed $row): array
    {
        /** @var Booking $booking */
        $booking = $row;
        $paidAmount = (float) ($booking->invoice?->paidAmount() ?? 0);
        $invoiceAmount = (float) ($booking->invoice?->amount ?? 0);

        return [
            $booking->id,
            ExcelDate::dateTimeToExcel($booking->created_at),
            $this->spreadsheetSafeText($booking->customer->name),
            $this->spreadsheetSafeText($booking->customer->phone),
            $this->spreadsheetSafeText($booking->package->title),
            $this->spreadsheetSafeText($booking->package->destination),
            ExcelDate::dateTimeToExcel($booking->departure_date),
            $booking->participant_count,
            $this->bookingStatusLabel($booking->status),
            (float) $booking->total_price,
            $booking->invoice?->invoice_number,
            $booking->invoice ? $this->invoiceStatusLabel($booking->invoice->calculatedStatus()) : null,
            $paidAmount,
            max(0, $invoiceAmount - $paidAmount),
        ];
    }

    /** @return array<string, string> */
    public function columnFormats(): array
    {
        return [
            'B' => 'dd mmmm yyyy',
            'G' => 'dd mmmm yyyy',
            'H' => '#,##0',
            'J' => '"Rp" #,##0',
            'M' => '"Rp" #,##0',
            'N' => '"Rp" #,##0',
        ];
    }

    /** @return array<string, float|int> */
    public function columnWidths(): array
    {
        return [
            'A' => 8,
            'B' => 18,
            'C' => 28,
            'D' => 18,
            'E' => 32,
            'F' => 22,
            'G' => 20,
            'H' => 12,
            'I' => 20,
            'J' => 20,
            'K' => 24,
            'L' => 20,
            'M' => 20,
            'N' => 20,
        ];
    }

    /** @return array<int|string, array<string, mixed>> */
    public function styles(Worksheet $sheet): array
    {
        $lastRow = $sheet->getHighestRow();

        $sheet->setAutoFilter("A1:N{$lastRow}");
        $sheet->getStyle("A1:N{$lastRow}")->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);

        return [
            1 => [
                'font' => [
                    'bold' => true,
                    'color' => ['rgb' => 'FFFFFF'],
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '0F766E'],
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                ],
            ],
        ];
    }

    public function freezePane(): string
    {
        return 'A2';
    }

    public function title(): string
    {
        return 'Laporan Booking';
    }

    private function spreadsheetSafeText(?string $value): string
    {
        $value ??= '';

        return preg_match('/^[=+\-@\t\r]/u', $value) === 1
            ? "'{$value}"
            : $value;
    }

    private function bookingStatusLabel(string $status): string
    {
        return match ($status) {
            'pending' => 'Pending',
            'confirmed' => 'Dikonfirmasi',
            'cancelled' => 'Dibatalkan',
            'completed' => 'Selesai',
            default => $status,
        };
    }

    private function invoiceStatusLabel(string $status): string
    {
        return match ($status) {
            'unpaid' => 'Belum dibayar',
            'paid' => 'Lunas',
            'overdue' => 'Jatuh tempo',
            default => $status,
        };
    }
}
