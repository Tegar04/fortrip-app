import { Form, Head } from '@inertiajs/react';
import {
    edit,
    update,
} from '@/actions/App/Http/Controllers/Admin/SiteSettingController';
import Heading from '@/components/heading';
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

type SiteSettingsForm = {
    company_name: string;
    company_tagline: string | null;
    company_address: string | null;
    company_phone: string | null;
    company_email: string | null;
    whatsapp_number: string | null;
    facebook_url: string | null;
    instagram_url: string | null;
    youtube_url: string | null;
    hero_title: string;
    hero_subtitle: string | null;
};

type Props = {
    settings: SiteSettingsForm;
};

export default function SiteSettings({ settings }: Props) {
    return (
        <>
            <Head title="Site settings" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <Heading
                    title="Site settings"
                    description="Kelola identitas bisnis, informasi kontak, media sosial, dan konten utama landing page."
                />

                <Form<SiteSettingsForm>
                    {...update.form()}
                    options={{ preserveScroll: true }}
                    setDefaultsOnSuccess
                    className="grid gap-6"
                >
                    {({ errors, isDirty, processing, recentlySuccessful }) => (
                        <>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Identitas bisnis</CardTitle>
                                    <CardDescription>
                                        Informasi utama yang ditampilkan kepada
                                        pelanggan.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-5 md:grid-cols-2">
                                    <Field
                                        id="company_name"
                                        label="Nama perusahaan"
                                        error={errors.company_name}
                                    >
                                        <Input
                                            id="company_name"
                                            name="company_name"
                                            defaultValue={settings.company_name}
                                            required
                                        />
                                    </Field>

                                    <Field
                                        id="company_tagline"
                                        label="Tagline"
                                        error={errors.company_tagline}
                                    >
                                        <Input
                                            id="company_tagline"
                                            name="company_tagline"
                                            defaultValue={
                                                settings.company_tagline ?? ''
                                            }
                                        />
                                    </Field>

                                    <Field
                                        id="company_email"
                                        label="Email"
                                        error={errors.company_email}
                                    >
                                        <Input
                                            id="company_email"
                                            name="company_email"
                                            type="email"
                                            defaultValue={
                                                settings.company_email ?? ''
                                            }
                                        />
                                    </Field>

                                    <Field
                                        id="company_phone"
                                        label="Nomor telepon"
                                        error={errors.company_phone}
                                    >
                                        <Input
                                            id="company_phone"
                                            name="company_phone"
                                            type="tel"
                                            defaultValue={
                                                settings.company_phone ?? ''
                                            }
                                        />
                                    </Field>

                                    <Field
                                        id="whatsapp_number"
                                        label="Nomor WhatsApp"
                                        error={errors.whatsapp_number}
                                    >
                                        <Input
                                            id="whatsapp_number"
                                            name="whatsapp_number"
                                            type="tel"
                                            defaultValue={
                                                settings.whatsapp_number ?? ''
                                            }
                                        />
                                    </Field>

                                    <Field
                                        id="company_address"
                                        label="Alamat"
                                        error={errors.company_address}
                                        className="md:col-span-2"
                                    >
                                        <Textarea
                                            id="company_address"
                                            name="company_address"
                                            defaultValue={
                                                settings.company_address ?? ''
                                            }
                                        />
                                    </Field>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Konten hero</CardTitle>
                                    <CardDescription>
                                        Judul dan deskripsi pembuka pada landing
                                        page.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-5">
                                    <Field
                                        id="hero_title"
                                        label="Judul hero"
                                        error={errors.hero_title}
                                    >
                                        <Input
                                            id="hero_title"
                                            name="hero_title"
                                            defaultValue={settings.hero_title}
                                            required
                                        />
                                    </Field>

                                    <Field
                                        id="hero_subtitle"
                                        label="Subjudul hero"
                                        error={errors.hero_subtitle}
                                    >
                                        <Textarea
                                            id="hero_subtitle"
                                            name="hero_subtitle"
                                            defaultValue={
                                                settings.hero_subtitle ?? ''
                                            }
                                        />
                                    </Field>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Media sosial</CardTitle>
                                    <CardDescription>
                                        Gunakan URL lengkap yang diawali http://
                                        atau https://.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-5 md:grid-cols-3">
                                    <Field
                                        id="facebook_url"
                                        label="Facebook"
                                        error={errors.facebook_url}
                                    >
                                        <Input
                                            id="facebook_url"
                                            name="facebook_url"
                                            type="url"
                                            defaultValue={
                                                settings.facebook_url ?? ''
                                            }
                                        />
                                    </Field>

                                    <Field
                                        id="instagram_url"
                                        label="Instagram"
                                        error={errors.instagram_url}
                                    >
                                        <Input
                                            id="instagram_url"
                                            name="instagram_url"
                                            type="url"
                                            defaultValue={
                                                settings.instagram_url ?? ''
                                            }
                                        />
                                    </Field>

                                    <Field
                                        id="youtube_url"
                                        label="YouTube"
                                        error={errors.youtube_url}
                                    >
                                        <Input
                                            id="youtube_url"
                                            name="youtube_url"
                                            type="url"
                                            defaultValue={
                                                settings.youtube_url ?? ''
                                            }
                                        />
                                    </Field>
                                </CardContent>
                            </Card>

                            <div className="flex items-center gap-4">
                                <Button disabled={processing || !isDirty}>
                                    {processing
                                        ? 'Menyimpan...'
                                        : 'Simpan perubahan'}
                                </Button>
                                {recentlySuccessful && (
                                    <p className="text-muted-foreground text-sm">
                                        Perubahan tersimpan.
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

function Field({
    id,
    label,
    error,
    className,
    children,
}: {
    id: string;
    label: string;
    error?: string;
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <div className={`grid gap-2 ${className ?? ''}`}>
            <Label htmlFor={id}>{label}</Label>
            {children}
            <InputError message={error} />
        </div>
    );
}

SiteSettings.layout = {
    breadcrumbs: [
        {
            title: 'Site settings',
            href: edit(),
        },
    ],
};
