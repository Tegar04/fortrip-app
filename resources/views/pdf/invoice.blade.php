<!DOCTYPE html>
<html lang="id">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <title>{{ $invoice->invoice_number }}</title>
    <style>
        @page { margin: 34px 42px; }
        * { box-sizing: border-box; }
        body { color: #172033; font-family: DejaVu Sans, sans-serif; font-size: 11px; line-height: 1.5; margin: 0; }
        .header { border-bottom: 2px solid #0f766e; padding-bottom: 18px; width: 100%; }
        .header td { vertical-align: top; }
        .brand { width: 62%; }
        .brand img { height: 42px; margin-right: 10px; vertical-align: middle; width: 42px; }
        .brand-name { color: #0f766e; font-size: 20px; font-weight: bold; vertical-align: middle; }
        .invoice-title { color: #0f766e; font-size: 25px; font-weight: bold; letter-spacing: 1px; margin: 0; text-align: right; }
        .invoice-number { color: #526078; margin-top: 3px; text-align: right; }
        .company-details { color: #526078; font-size: 9px; margin-top: 9px; }
        .meta { margin-top: 24px; width: 100%; }
        .meta td { vertical-align: top; width: 50%; }
        .meta-right { padding-left: 34px; }
        .label { color: #64748b; font-size: 9px; font-weight: bold; letter-spacing: .7px; margin-bottom: 4px; text-transform: uppercase; }
        .customer-name { font-size: 14px; font-weight: bold; }
        .muted { color: #64748b; }
        .dates { border-collapse: collapse; width: 100%; }
        .dates td { border-bottom: 1px solid #e2e8f0; padding: 5px 0; }
        .dates td:last-child { font-weight: bold; text-align: right; }
        .items { border-collapse: collapse; margin-top: 26px; width: 100%; }
        .items th { background: #0f766e; color: white; font-size: 9px; letter-spacing: .5px; padding: 9px; text-align: left; text-transform: uppercase; }
        .items td { border-bottom: 1px solid #dbe3ed; padding: 12px 9px; vertical-align: top; }
        .items .number { text-align: right; white-space: nowrap; }
        .totals { border-collapse: collapse; margin-left: auto; margin-top: 16px; width: 44%; }
        .totals td { padding: 5px 8px; }
        .totals td:last-child { text-align: right; white-space: nowrap; }
        .totals .grand td { background: #e6f5f2; color: #0f766e; font-size: 13px; font-weight: bold; padding: 9px 8px; }
        .status { border: 1px solid #99d5ca; border-radius: 12px; color: #0f766e; display: inline-block; font-size: 9px; font-weight: bold; margin-top: 18px; padding: 3px 9px; text-transform: uppercase; }
        .footer { border-top: 1px solid #dbe3ed; bottom: 0; color: #64748b; font-size: 9px; left: 0; padding-top: 10px; position: fixed; right: 0; text-align: center; }
    </style>
</head>
<body>
    <table class="header">
        <tr>
            <td class="brand">
                <img src="{{ public_path('favicon.svg') }}" alt="Logo">
                <span class="brand-name">{{ $settings['company_name'] ?? config('app.name') }}</span>
                <div class="company-details">
                    @if ($settings['company_address'] ?? null){{ $settings['company_address'] }}<br>@endif
                    @if ($settings['company_phone'] ?? null){{ $settings['company_phone'] }}@endif
                    @if (($settings['company_phone'] ?? null) && ($settings['company_email'] ?? null)) &nbsp;|&nbsp; @endif
                    @if ($settings['company_email'] ?? null){{ $settings['company_email'] }}@endif
                </div>
            </td>
            <td>
                <p class="invoice-title">INVOICE</p>
                <div class="invoice-number">{{ $invoice->invoice_number }}</div>
            </td>
        </tr>
    </table>

    <table class="meta">
        <tr>
            <td>
                <div class="label">Ditagihkan kepada</div>
                <div class="customer-name">{{ $invoice->booking->customer->name }}</div>
                <div class="muted">
                    {{ $invoice->booking->customer->phone }}<br>
                    @if ($invoice->booking->customer->email){{ $invoice->booking->customer->email }}<br>@endif
                    @if ($invoice->booking->customer->address){{ $invoice->booking->customer->address }}@endif
                </div>
            </td>
            <td class="meta-right">
                <table class="dates">
                    <tr><td class="muted">Tanggal terbit</td><td>{{ $invoice->issued_date->locale('id')->translatedFormat('d F Y') }}</td></tr>
                    <tr><td class="muted">Jatuh tempo</td><td>{{ $invoice->due_date?->locale('id')->translatedFormat('d F Y') ?? '-' }}</td></tr>
                    <tr><td class="muted">Booking</td><td>#{{ $invoice->booking->id }}</td></tr>
                </table>
            </td>
        </tr>
    </table>

    <table class="items">
        <thead>
            <tr><th>Rincian perjalanan</th><th class="number">Harga</th><th class="number">Peserta</th><th class="number">Jumlah</th></tr>
        </thead>
        <tbody>
            <tr>
                <td>
                    <strong>{{ $invoice->booking->package->title }}</strong><br>
                    <span class="muted">{{ $invoice->booking->package->destination }} - keberangkatan {{ $invoice->booking->departure_date->locale('id')->translatedFormat('d F Y') }}</span>
                </td>
                <td class="number">Rp {{ number_format((float) $invoice->booking->package->price, 0, ',', '.') }}</td>
                <td class="number">{{ $invoice->booking->participant_count }}</td>
                <td class="number">Rp {{ number_format((float) $invoice->amount, 0, ',', '.') }}</td>
            </tr>
        </tbody>
    </table>

    <table class="totals">
        <tr><td class="muted">Total invoice</td><td>Rp {{ number_format((float) $invoice->amount, 0, ',', '.') }}</td></tr>
        <tr><td class="muted">Sudah dibayar</td><td>Rp {{ number_format((float) $paidAmount, 0, ',', '.') }}</td></tr>
        <tr class="grand"><td>Sisa tagihan</td><td>Rp {{ number_format((float) $remainingAmount, 0, ',', '.') }}</td></tr>
    </table>

    <div class="status">Status: {{ ['unpaid' => 'Belum dibayar', 'paid' => 'Lunas', 'overdue' => 'Jatuh tempo'][$invoice->status] ?? $invoice->status }}</div>

    <div class="footer">Terima kasih telah mempercayakan perjalanan Anda kepada {{ $settings['company_name'] ?? config('app.name') }}.</div>
</body>
</html>
