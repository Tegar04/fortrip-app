import { Form, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import {
    store,
    update,
} from '@/actions/App/Http/Controllers/Admin/BookingController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { index, show } from '@/routes/admin/bookings';

export type CustomerOption = { id: number; name: string; phone: string };
export type PackageOption = {
    id: number;
    title: string;
    destination: string;
    price: string;
};
export type BookingData = {
    id: number;
    departure_date: string;
    participant_count: number;
    total_price: string;
    status: string;
    available_statuses: string[];
    customer: {
        id: number;
        name: string;
        email: string | null;
        phone: string;
        address: string | null;
    };
    package: PackageOption;
};

type BookingFormData = {
    booking: string;
    customer_id: string;
    package_id: string;
    departure_date: string;
    participant_count: string;
};

export default function BookingForm({
    booking,
    customers,
    packages,
}: {
    booking?: BookingData;
    customers: CustomerOption[];
    packages: PackageOption[];
}) {
    const [packageId, setPackageId] = useState(
        booking?.package.id.toString() ?? packages[0]?.id.toString() ?? '',
    );
    const [participantCount, setParticipantCount] = useState(
        booking?.participant_count ?? 1,
    );
    const selectedPackage = packages.find(
        (packageData) => packageData.id.toString() === packageId,
    );
    const estimatedTotal = useMemo(
        () => Number(selectedPackage?.price ?? 0) * participantCount,
        [selectedPackage, participantCount],
    );
    const formAction = booking ? update.form(booking.id) : store.form();
    const cancelHref = booking ? show(booking.id) : index();

    return (
        <Form<BookingFormData>
            {...formAction}
            options={{ preserveScroll: true }}
            className="grid gap-6"
        >
            {({ errors, processing }) => (
                <>
                    <Card>
                        <CardHeader>
                            <CardTitle>Detail booking</CardTitle>
                            <CardDescription>
                                Pilih customer, paket, tanggal berangkat, dan
                                jumlah peserta. Total dihitung oleh server.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-5">
                            <InputError message={errors.booking} />
                            <div className="grid gap-5 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="customer_id">
                                        Customer
                                    </Label>
                                    <select
                                        id="customer_id"
                                        name="customer_id"
                                        defaultValue={
                                            booking?.customer.id ?? ''
                                        }
                                        className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-[3px]"
                                        required
                                    >
                                        <option value="" disabled>
                                            Pilih customer
                                        </option>
                                        {customers.map((customer) => (
                                            <option
                                                key={customer.id}
                                                value={customer.id}
                                            >
                                                {customer.name} —{' '}
                                                {customer.phone}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.customer_id} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="package_id">Package</Label>
                                    <select
                                        id="package_id"
                                        name="package_id"
                                        value={packageId}
                                        onChange={(event) =>
                                            setPackageId(event.target.value)
                                        }
                                        className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border px-3 text-sm outline-none focus-visible:ring-[3px]"
                                        required
                                    >
                                        <option value="" disabled>
                                            Pilih package
                                        </option>
                                        {packages.map((packageData) => (
                                            <option
                                                key={packageData.id}
                                                value={packageData.id}
                                            >
                                                {packageData.title} —{' '}
                                                {packageData.destination}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.package_id} />
                                </div>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="departure_date">
                                        Tanggal keberangkatan
                                    </Label>
                                    <Input
                                        id="departure_date"
                                        name="departure_date"
                                        type="date"
                                        min={new Date()
                                            .toISOString()
                                            .slice(0, 10)}
                                        defaultValue={
                                            booking?.departure_date ?? ''
                                        }
                                        required
                                    />
                                    <InputError
                                        message={errors.departure_date}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="participant_count">
                                        Jumlah peserta
                                    </Label>
                                    <Input
                                        id="participant_count"
                                        name="participant_count"
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={participantCount}
                                        onChange={(event) =>
                                            setParticipantCount(
                                                Number(event.target.value),
                                            )
                                        }
                                        required
                                    />
                                    <InputError
                                        message={errors.participant_count}
                                    />
                                </div>
                            </div>

                            <div className="bg-muted rounded-lg p-4">
                                <p className="text-muted-foreground text-sm">
                                    Estimasi total
                                </p>
                                <p className="text-xl font-semibold">
                                    {formatCurrency(estimatedTotal)}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                    {formatCurrency(
                                        Number(selectedPackage?.price ?? 0),
                                    )}{' '}
                                    × {participantCount} peserta
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex gap-3">
                        <Button
                            disabled={
                                processing ||
                                customers.length === 0 ||
                                packages.length === 0
                            }
                        >
                            {processing
                                ? 'Menyimpan...'
                                : booking
                                  ? 'Simpan perubahan'
                                  : 'Buat booking'}
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={cancelHref}>Batal</Link>
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}

export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);
}
