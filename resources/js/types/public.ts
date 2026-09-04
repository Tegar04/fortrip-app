export type PublicSite = {
    company_name: string;
    company_tagline: string | null;
    company_address: string | null;
    company_phone: string | null;
    company_email: string | null;
    whatsapp_url: string | null;
    social_urls: {
        facebook: string | null;
        instagram: string | null;
        youtube: string | null;
    };
};

export type HomeContent = {
    hero_title: string;
    hero_subtitle: string | null;
    about_title: string;
    about_description: string;
    packages_title: string;
    packages_subtitle: string | null;
    testimonials_title: string;
    testimonials_subtitle: string | null;
    cta_title: string;
    cta_description: string | null;
    cta_button_text: string;
};

export type PublicBanner = {
    id: number;
    title: string;
    subtitle: string | null;
    button_text: string | null;
    button_url: string | null;
    image_url: string;
};

export type PublicPackage = {
    id: number;
    title: string;
    slug: string;
    excerpt?: string;
    destination: string;
    duration_days: number;
    price: string;
    cover_url: string;
};

export type PublicPackageGalleryImage = {
    id: number;
    url: string;
    thumb_url: string;
};

export type PublicPackageDetail = Omit<PublicPackage, 'excerpt'> & {
    description: string;
    cover_original_url: string;
    gallery: PublicPackageGalleryImage[];
};

export type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export type PaginatedData<T> = {
    current_page: number;
    data: T[];
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
};

export type PublicTestimonial = {
    id: number;
    name: string;
    content: string;
    rating: number;
    avatar_url: string;
};

export type SeoMeta = {
    title: string;
    description: string;
};
