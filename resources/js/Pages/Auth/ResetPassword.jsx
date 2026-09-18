import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout
            title="Set new password"
            description="Create a new secure password for your account to regain access."
        >
            <Head title="Reset Password - Elevate Interiors" />

            <form onSubmit={submit}>
                <div>
                    <label className="block font-sans text-[0.875rem] font-medium text-[#211E1A] mb-1.5">
                        Email address
                    </label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="w-full rounded-xl border border-[#E7E2D8] bg-[#EFECE6]/80 px-4 py-3 font-sans text-[1rem] font-normal text-[#6B655B] cursor-not-allowed select-none opacity-80 transition"
                        autoComplete="username"
                        disabled
                        readOnly
                    />
                    {errors.email && (
                        <p className="mt-1.5 text-sm text-[#B3453A]">{errors.email}</p>
                    )}
                </div>

                <div className="mt-5">
                    <label className="block font-sans text-[0.875rem] font-medium text-[#211E1A] mb-1.5">
                        New password
                    </label>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-[#E7E2D8] bg-[#F7F5EF] px-4 py-3 font-sans text-[1rem] font-normal text-[#211E1A] placeholder:text-[#B4AD9B] focus:outline-none focus:ring-2 focus:ring-[#C9A24B]/60 focus:border-[#C9A24B] transition"
                        autoComplete="new-password"
                        autoFocus
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />
                    {errors.password && (
                        <p className="mt-1.5 text-sm text-[#B3453A]">{errors.password}</p>
                    )}
                </div>

                <div className="mt-5">
                    <label className="block font-sans text-[0.875rem] font-medium text-[#211E1A] mb-1.5">
                        Confirm new password
                    </label>
                    <input
                        type="password"
                        id="password_confirmation"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-[#E7E2D8] bg-[#F7F5EF] px-4 py-3 font-sans text-[1rem] font-normal text-[#211E1A] placeholder:text-[#B4AD9B] focus:outline-none focus:ring-2 focus:ring-[#C9A24B]/60 focus:border-[#C9A24B] transition"
                        autoComplete="new-password"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        required
                    />
                    {errors.password_confirmation && (
                        <p className="mt-1.5 text-sm text-[#B3453A]">
                            {errors.password_confirmation}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full mt-7 rounded-xl bg-[#151312] hover:bg-[#211E1A] disabled:opacity-60 text-white font-sans text-[0.9rem] font-medium tracking-wide py-3.5 transition-all shadow-md hover:shadow-lg cursor-pointer"
                >
                    {processing ? 'Resetting…' : 'Reset password'}
                </button>

                <div className="mt-5">
                    <Link
                        href={route('login')}
                        className="font-sans text-[0.875rem] font-medium text-[#8A6A2E] hover:text-[#B8874A] transition-colors"
                    >
                        ← Back to sign in
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
