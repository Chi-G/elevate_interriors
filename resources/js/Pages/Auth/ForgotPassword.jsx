import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <GuestLayout
            title="Reset password"
            description="Enter your email address and we will send you a password reset link to regain access."
        >
            <Head title="Forgot Password - Elevate Interiors" />

            {status && (
                <div className="mb-5 text-sm font-medium text-[#3F6B4F] bg-[#EDF3EE] rounded-lg px-4 py-2.5 border border-[#c3d9c8]">
                    {status}
                </div>
            )}

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
                        placeholder="admin@elevateinteriors.space"
                        className="w-full rounded-xl border border-[#E7E2D8] bg-[#F7F5EF] px-4 py-3 font-sans text-[1rem] font-normal text-[#211E1A] placeholder:text-[#B4AD9B] focus:outline-none focus:ring-2 focus:ring-[#C9A24B]/60 focus:border-[#C9A24B] transition"
                        autoFocus
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    {errors.email && (
                        <p className="mt-1.5 text-sm text-[#B3453A]">{errors.email}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full mt-6 rounded-xl bg-[#151312] hover:bg-[#211E1A] disabled:opacity-60 text-white font-sans text-[0.9rem] font-medium tracking-wide py-3.5 transition-all shadow-md hover:shadow-lg cursor-pointer"
                >
                    {processing ? 'Sending link…' : 'Email password reset link'}
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
