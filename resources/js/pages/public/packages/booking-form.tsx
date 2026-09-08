import { useForm } from '@inertiajs/react';
import { CalendarDays } from 'lucide-react';
import { useRef, useState, type FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { store } from '@/routes/packages/bookings';

export type PublicBookingOptions = {
    min_departure_date: string;
    max_participants: number;
    submission_token: string;
};

const contactFields = [
    {
        name: 'name',
        label: 'Nama lengkap',
        type: 'text',
        required: true,
        maxLength: 255,
        autoComplete: 'name',
    },
    {
        name: 'phone',
        label: 'Nomor telepon / WhatsApp',
        type: 'tel',
        required: true,
        maxLength: 30,
        autoComplete: 'tel',
    },
    {
        name: 'email',
        label: 'Email',
        type: 'email',
        required: true,
        maxLength: 255,
        autoComplete: 'email',
    },
] as const;

export default function PublicBookingForm({
    slug,
    price,
    options,
}: {
    slug: string;
    price: string;
    options: PublicBookingOptions;
}) {
    const form = useForm({
        name: '',
        phone: '',
        email: '',
        address: '',
        departure_date: '',
        participant_count: '1',
        submission_token: options.submission_token,
    });
    const departureDateInput = useRef<HTMLInputElement>(null);
    const [failure, setFailure] = useState('');
    const [success, setSuccess] = useState(false);
    const participantCount = Number(form.data.participant_count);
    const validCount =
        Number.isInteger(participantCount) &&
        participantCount >= 1 &&
        participantCount <= options.max_participants;

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setFailure('');
        setSuccess(false);
        form.post(store.url(slug), {
            preserveScroll: true,
            onSuccess: (page) => {
                form.reset();
                const nextOptions = page.props.booking as PublicBookingOptions;
                form.setData('submission_token', nextOptions.submission_token);
                setSuccess(true);
            },
            onError: () => {
                requestAnimationFrame(() =>
                    document
                        .querySelector<HTMLElement>(
                            '#public-booking [aria-invalid="true"]',
                        )
                        ?.focus(),
                );
            },
            onHttpException: (response) => {
                setFailure(
                    response.status === 429
                        ? 'Terlalu banyak pengajuan. Tunggu beberapa saat sebelum mencoba lagi.'
                        : response.status === 419
                          ? 'Sesi telah berakhir. Muat ulang halaman sebelum mengirim kembali.'
                          : response.status === 404
                            ? 'Paket ini sudah tidak tersedia. Silakan pilih paket lainnya.'
                            : 'Pengajuan belum dapat dipastikan. Coba kirim kembali atau hubungi admin.',
                );
                return false;
            },
            onNetworkError: () => {
                setFailure(
                    'Koneksi terputus. Periksa internet lalu kirim kembali; pengajuan yang sama tidak akan dibuat dua kali.',
                );
                return false;
            },
        });
    }

    return (
        <section
            id="public-booking"
            aria-labelledby="booking-heading"
            className="grid scroll-mt-24 gap-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-9"
        >
            <div className="grid gap-2">
                <h2
                    id="booking-heading"
                    className="text-2xl font-semibold text-slate-950"
                >
                    Ajukan booking
                </h2>
                <p className="text-sm leading-6 text-slate-600">
                    Keberangkatan boleh hari ini. Pengajuan menunggu konfirmasi
                    ketersediaan dari admin.
                </p>
            </div>
            {success && (
                <p
                    role="status"
                    className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800"
                >
                    Pengajuan booking diterima. Admin akan menghubungi Anda
                    untuk mengonfirmasi ketersediaan dan keberangkatan.
                </p>
            )}
            <form onSubmit={submit} className="grid gap-5">
                {failure && (
                    <p
                        role="alert"
                        className="rounded-xl bg-red-50 p-4 text-sm text-red-700"
                    >
                        {failure}
                    </p>
                )}
                <InputError
                    role="alert"
                    message={form.errors.submission_token}
                />
                <fieldset
                    disabled={form.processing}
                    className="grid gap-5 disabled:opacity-70"
                >
                    <legend className="sr-only">Data pengajuan booking</legend>
                    {contactFields.map((field) => (
                        <div key={field.name} className="grid gap-2">
                            <Label htmlFor={`booking-${field.name}`}>
                                {field.label}
                            </Label>
                            <Input
                                id={`booking-${field.name}`}
                                name={field.name}
                                type={field.type}
                                required={field.required}
                                maxLength={field.maxLength}
                                autoComplete={field.autoComplete}
                                value={form.data[field.name]}
                                onChange={(event) =>
                                    form.setData(field.name, event.target.value)
                                }
                                aria-invalid={!!form.errors[field.name]}
                                aria-describedby={`booking-${field.name}-error`}
                            />
                            {field.name === 'phone' && (
                                <p className="text-xs text-slate-500">
                                    Gunakan angka; tanda + boleh di awal untuk
                                    kode negara. Contoh: 081234567890 atau
                                    +6281234567890.
                                </p>
                            )}
                            <InputError
                                id={`booking-${field.name}-error`}
                                message={form.errors[field.name]}
                            />
                        </div>
                    ))}
                    <div className="grid gap-2">
                        <Label htmlFor="booking-address">
                            Alamat (opsional)
                        </Label>
                        <textarea
                            id="booking-address"
                            name="address"
                            autoComplete="street-address"
                            maxLength={1000}
                            rows={3}
                            value={form.data.address}
                            onChange={(event) =>
                                form.setData('address', event.target.value)
                            }
                            aria-invalid={!!form.errors.address}
                            aria-describedby="booking-address-error"
                            className="w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-emerald-600"
                        />
                        <InputError
                            id="booking-address-error"
                            message={form.errors.address}
                        />
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="booking-date">
                                Tanggal keberangkatan
                            </Label>
                            <div className="relative">
                                <Input
                                    ref={departureDateInput}
                                    id="booking-date"
                                    name="departure_date"
                                    type="date"
                                    required
                                    min={options.min_departure_date}
                                    value={form.data.departure_date}
                                    onChange={(event) =>
                                        form.setData(
                                            'departure_date',
                                            event.target.value,
                                        )
                                    }
                                    aria-invalid={!!form.errors.departure_date}
                                    aria-describedby="booking-date-error"
                                    className="pr-10 [&::-webkit-calendar-picker-indicator]:hidden"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-1/2 right-1 size-7 -translate-y-1/2 text-slate-500 hover:text-emerald-700"
                                    aria-label="Buka kalender tanggal keberangkatan"
                                    aria-controls="booking-date"
                                    onClick={() => {
                                        const input =
                                            departureDateInput.current;
                                        if (!input) {
                                            return;
                                        }
                                        try {
                                            input.showPicker();
                                        } catch {
                                            input.focus();
                                        }
                                    }}
                                >
                                    <CalendarDays
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                </Button>
                            </div>
                            <InputError
                                id="booking-date-error"
                                message={form.errors.departure_date}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="booking-participants">
                                Jumlah peserta (1–{options.max_participants})
                            </Label>
                            <Input
                                id="booking-participants"
                                name="participant_count"
                                type="number"
                                required
                                min={1}
                                max={options.max_participants}
                                step={1}
                                value={form.data.participant_count}
                                onChange={(event) =>
                                    form.setData(
                                        'participant_count',
                                        event.target.value,
                                    )
                                }
                                aria-invalid={!!form.errors.participant_count}
                                aria-describedby="booking-participants-error"
                            />
                            <InputError
                                id="booking-participants-error"
                                message={form.errors.participant_count}
                            />
                        </div>
                    </div>
                    <p
                        aria-live="polite"
                        className="rounded-xl bg-slate-50 p-4 font-semibold text-slate-800"
                    >
                        Estimasi total:{' '}
                        {validCount
                            ? new Intl.NumberFormat('id-ID', {
                                  style: 'currency',
                                  currency: 'IDR',
                                  maximumFractionDigits: 0,
                              }).format(Number(price) * participantCount)
                            : '—'}
                    </p>
                    <p className="text-xs leading-6 text-slate-500">
                        Data kontak Anda digunakan untuk memproses pengajuan
                        booking dan menghubungi Anda terkait perjalanan ini.
                        Pengajuan belum menjamin ketersediaan hingga
                        dikonfirmasi admin.
                    </p>
                    <Button
                        type="submit"
                        disabled={form.processing}
                        className="rounded-full bg-emerald-700 text-white hover:bg-emerald-800"
                    >
                        {form.processing
                            ? 'Mengirim pengajuan…'
                            : 'Ajukan booking'}
                    </Button>
                </fieldset>
            </form>
        </section>
    );
}
