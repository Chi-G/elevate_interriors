import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout
            title="Confirm security access"
            description="This is a secure area of the system. Please confirm your password before continuing."
        >
            <Head title="Confirm Password - Elevate Interiors" />

            <form onSubmit={submit}>
                <div>
                    <label className="block font-sans text-[0.875rem] font-medium text-[#211E1A] mb-1.5">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-[#E7E2D8] bg-[#F7F5EF] px-4 py-3 font-sans text-[1rem] font-normal text-[#211E1A] placeholder:text-[#B4AD9B] focus:outline-none focus:ring-2 focus:ring-[#C9A24B]/60 focus:border-[#C9A24B] transition"
                        autoFocus
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />
                    {errors.password && (
                        <p className="mt-1.5 text-sm text-[#B3453A]">{errors.password}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full mt-6 rounded-xl bg-[#151312] hover:bg-[#211E1A] disabled:opacity-60 text-white font-sans text-[0.9rem] font-medium tracking-wide py-3.5 transition-all shadow-md hover:shadow-lg cursor-pointer"
                >
                    {processing ? 'Confirming…' : 'Confirm password'}
                </button>
            </form>
        </GuestLayout>
    );
}
