import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Mail,
    MapPin,
    Pencil,
    Phone,
    Plus,
    Trash2,
    UsersRound,
} from 'lucide-react';
import { destroy } from '@/actions/App/Http/Controllers/Admin/CustomerController';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { CustomerData } from '@/pages/admin/customers/customer-form';
import { create, edit } from '@/routes/admin/customers';

export default function CustomersIndex({
    customers,
}: {
    customers: CustomerData[];
}) {
    const { auth } = usePage().props;

    function deleteCustomer(customer: CustomerData) {
        if (!window.confirm(`Hapus customer "${customer.name}"?`)) {
            return;
        }

        router.delete(destroy.url(customer.id), { preserveScroll: true });
    }

    return (
        <>
            <Head title="Customers" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <Heading
                        title="Customers"
                        description="Kelola identitas pelanggan dan riwayat jumlah booking."
                    />
                    {auth.permissions.createCustomers && (
                        <Button asChild>
                            <Link href={create()}>
                                <Plus />
                                Buat customer
                            </Link>
                        </Button>
                    )}
                </div>

                {customers.length === 0 ? (
                    <Card>
                        <CardContent className="grid min-h-64 place-items-center text-center">
                            <div className="grid justify-items-center gap-3">
                                <div className="bg-muted rounded-full p-4">
                                    <UsersRound className="text-muted-foreground size-8" />
                                </div>
                                <div>
                                    <h2 className="font-semibold">
                                        Belum ada customer
                                    </h2>
                                    <p className="text-muted-foreground text-sm">
                                        Tambahkan customer pertama untuk membuat
                                        booking.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {customers.map((customer) => (
                            <Card key={customer.id}>
                                <CardContent className="grid h-full gap-4 px-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <h2 className="font-semibold">
                                                {customer.name}
                                            </h2>
                                            <Badge variant="secondary">
                                                {customer.bookings_count}{' '}
                                                booking
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="text-muted-foreground grid gap-2 text-sm">
                                        <span className="flex items-center gap-2">
                                            <Phone className="size-4" />
                                            {customer.phone}
                                        </span>
                                        {customer.email && (
                                            <span className="flex items-center gap-2">
                                                <Mail className="size-4" />
                                                {customer.email}
                                            </span>
                                        )}
                                        {customer.address && (
                                            <span className="flex items-start gap-2">
                                                <MapPin className="mt-0.5 size-4 shrink-0" />
                                                {customer.address}
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-auto flex gap-2 border-t pt-4">
                                        {auth.permissions.editCustomers && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                asChild
                                            >
                                                <Link href={edit(customer.id)}>
                                                    <Pencil />
                                                    Edit
                                                </Link>
                                            </Button>
                                        )}
                                        {auth.permissions.deleteCustomers && (
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                disabled={
                                                    customer.bookings_count > 0
                                                }
                                                onClick={() =>
                                                    deleteCustomer(customer)
                                                }
                                            >
                                                <Trash2 />
                                                Hapus
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
