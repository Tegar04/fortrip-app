export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
    permissions: {
        manageSiteSettings: boolean;
        viewBanners: boolean;
        createBanners: boolean;
        editBanners: boolean;
        deleteBanners: boolean;
        viewPackages: boolean;
        createPackages: boolean;
        editPackages: boolean;
        deletePackages: boolean;
        viewTestimonials: boolean;
        createTestimonials: boolean;
        editTestimonials: boolean;
        deleteTestimonials: boolean;
        viewCustomers: boolean;
        createCustomers: boolean;
        editCustomers: boolean;
        deleteCustomers: boolean;
        viewBookings: boolean;
        createBookings: boolean;
        editBookings: boolean;
        deleteBookings: boolean;
    };
};
