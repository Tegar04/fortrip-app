import { Form, Link } from '@inertiajs/react';
import {
    store,
    update,
} from '@/actions/App/Http/Controllers/Admin/CustomerController';
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
import { Textarea } from '@/components/ui/textarea';
import { index } from '@/routes/admin/customers';

export type CustomerData = {
    id: number;
    name: string;
    email: string | null;
    phone: string;
    address: string | null;
    bookings_count: number;
};

type CustomerFormData = {
    name: string;
    email: string;
    phone: string;
    address: string;
};

export default function CustomerForm({
    customer,
}: {
    customer?: CustomerData;
}) {
    const formAction = customer ? update.form(customer.id) : store.form();

    return (
        <Form<CustomerFormData>
            {...formAction}
            options={{ preserveScroll: true }}
            className="grid gap-6"
        >
            {({ errors, processing }) => (
                <>
                    <Card>
                        <CardHeader>
                            <CardTitle>Data customer</CardTitle>
                            <CardDescription>
                                Simpan identitas dan kontak yang dapat digunakan
                                untuk pemesanan.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nama lengkap</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    defaultValue={customer?.name ?? ''}
                                    autoComplete="name"
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        defaultValue={customer?.email ?? ''}
                                        autoComplete="email"
                                    />
                                    <InputError message={errors.email} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Nomor telepon</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        defaultValue={customer?.phone ?? ''}
                                        autoComplete="tel"
                                        required
                                    />
                                    <InputError message={errors.phone} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="address">Alamat</Label>
                                <Textarea
                                    id="address"
                                    name="address"
                                    defaultValue={customer?.address ?? ''}
                                    className="min-h-28"
                                    autoComplete="street-address"
                                />
                                <InputError message={errors.address} />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex gap-3">
                        <Button disabled={processing}>
                            {processing
                                ? 'Menyimpan...'
                                : customer
                                  ? 'Simpan perubahan'
                                  : 'Buat customer'}
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={index()}>Batal</Link>
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}
