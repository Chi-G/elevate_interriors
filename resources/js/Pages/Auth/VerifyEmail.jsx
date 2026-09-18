import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <GuestLayout
            title="Verify your email"
            description="Thanks for joining Elevate Interiors. Please click the link sent to your email address to activate your full system access."
        >
            <Head title="Email Verification - Elevate Interiors" />

            {status === 'verification-link-sent' && (
                <div className="mb-5 text-sm font-medium text-[#3F6B4F] bg-[#EDF3EE] rounded-lg px-4 py-2.5 border border-[#c3d9c8]">
                    A new verification link has been sent to the email address you provided during registration.
                </div>
            )}

            <form onSubmit={submit}>
                <button
                    type="submit"
                    disabled={processing}
                    className="w-full rounded-xl bg-[#151312] hover:bg-[#211E1A] disabled:opacity-60 text-white font-sans text-[0.9rem] font-medium tracking-wide py-3.5 transition-all shadow-md hover:shadow-lg cursor-pointer"
                >
                    {processing ? 'Sending link…' : 'Resend verification email'}
                </button>

                <div className="mt-6 flex items-center justify-between">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="font-sans text-[0.875rem] font-medium text-[#8A6A2E] hover:text-[#B8874A] transition-colors cursor-pointer"
                    >
                        Sign out
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
