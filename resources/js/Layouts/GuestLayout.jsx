import { Link, usePage } from '@inertiajs/react';

export default function GuestLayout({ title, description, children }) {
    const { app } = usePage().props;

    // Helper to resolve asset paths across environments
    const getAsset = (path) => {
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        return app?.is_production && app?.url ? `${app.url}/${cleanPath}` : `/${cleanPath}`;
    };

    const bgSrc = getAsset('bg.png');
    const logoSrc = getAsset('brand-logo.png');

    return (
        <div className="min-h-screen w-full bg-[#FBFAF6] flex font-sans">
            {/* ---------- Left: Hero Panel ---------- */}
            <div className="hidden lg:block relative lg:w-[58%] overflow-hidden bg-[#0E1522]">
                <div className="absolute inset-0">
                    <img
                        src={bgSrc}
                        alt="Elevate Interiors"
                        className="h-full w-full object-cover animate-[kenburns_9s_ease-out_forwards]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220]/90 via-[#0B1220]/30 to-transparent" />
                </div>

                <div className="relative h-full flex flex-col justify-end p-14 z-10">
                    <h1 className="text-white text-[2.75rem] leading-[1.05] font-serif font-semibold tracking-tight mb-3">
                        Elevate Interiors
                    </h1>
                    <p className="text-[#C9BFA5] text-sm max-w-sm">
                        The premium standard for modern inventory tracking and structural stock management.
                    </p>
                </div>
            </div>

            {/* ---------- Right: Form Panel ---------- */}
            <div className="w-full lg:w-[42%] flex items-center justify-center px-8 py-12">
                <div className="w-full max-w-sm">
                    <div className="flex flex-col items-start text-left mb-8">
                        <Link href="/">
                            <img
                                src={logoSrc}
                                alt="Elevate Interiors"
                                className="h-16 w-16 rounded-2xl shadow-[0_4px_20px_rgba(184,135,74,0.18)] mb-6 object-contain bg-white p-2 border border-[#E7E2D8] hover:border-[#C9A24B] transition-colors"
                            />
                        </Link>
                        {title && (
                            <h2 className="font-serif font-medium text-[2.25rem] leading-[1.15] text-[#211E1A] tracking-tight mb-2.5">
                                {title}
                            </h2>
                        )}
                        {description && (
                            <p className="font-sans text-[0.95rem] font-normal text-[#787163] leading-relaxed">
                                {description}
                            </p>
                        )}
                    </div>

                    {children}

                    <p className="font-sans text-[0.75rem] font-normal text-[#9E9786] mt-6">
                        Elevate Interiors v1.0
                    </p>
                </div>
            </div>

            {/* Ken Burns Keyframes */}
            <style>{`
                @keyframes kenburns {
                    from { transform: scale(1); }
                    to { transform: scale(1.08); }
                }
            `}</style>
        </div>
    );
}
