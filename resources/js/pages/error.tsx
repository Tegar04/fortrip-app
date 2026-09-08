import { Head, Link } from '@inertiajs/react';
import { home } from '@/routes';
const messages: Record<number, { title: string; description: string }> = {
    403: {
        title: 'Akses tidak diizinkan',
        description: 'Anda tidak memiliki izin untuk membuka halaman ini.',
    },
    404: {
        title: 'Halaman tidak ditemukan',
        description: 'Halaman atau paket yang Anda cari sudah tidak tersedia.',
    },
    419: {
        title: 'Sesi telah berakhir',
        description: 'Muat ulang halaman sebelum mencoba kembali.',
    },
    429: {
        title: 'Terlalu banyak permintaan',
        description: 'Tunggu beberapa saat sebelum mencoba kembali.',
    },
    500: {
        title: 'Terjadi gangguan',
        description:
            'Kami belum dapat memproses permintaan Anda. Silakan coba beberapa saat lagi.',
    },
};
export default function ErrorPage({ status }: { status: number }) {
    const message = messages[status] ?? messages[500];
    return (
        <main className="grid min-h-screen place-items-center bg-slate-950 px-5 py-16 text-white">
            <Head title={message.title}>
                <meta
                    head-key="robots"
                    name="robots"
                    content="noindex, nofollow"
                />
            </Head>
            <div className="grid max-w-lg gap-6 text-center">
                <p className="text-7xl font-semibold text-emerald-300">
                    {status}
                </p>
                <h1 className="text-3xl font-semibold">{message.title}</h1>
                <p className="leading-7 text-slate-300">
                    {message.description}
                </p>
                <Link
                    href={home()}
                    className="rounded-full bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-300"
                >
                    Kembali ke Home
                </Link>
            </div>
        </main>
    );
}
