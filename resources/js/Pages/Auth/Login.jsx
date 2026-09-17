import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import LockoutModal from '@/Components/LockoutModal';

export default function Login({ status, canResetPassword }) {
    const { flash } = usePage().props;
    const [showPassword, setShowPassword] = useState(false);
    const [showLockoutModal, setShowLockoutModal] = useState(false);

    useEffect(() => {
        if (flash.lockout) {
            setShowLockoutModal(true);
        }
    }, [flash.lockout]);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        const startTime = Date.now();
        window.dispatchEvent(new CustomEvent('elevate:start-loader', {
            detail: { text: 'AUTHENTICATING & LOADING DASHBOARD...' }
        }));

        post(route('login'), {
            onSuccess: () => {
                const elapsed = Date.now() - startTime;
                const remaining = Math.max(0, 2000 - elapsed);

                setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('elevate:stop-loader'));
                }, remaining);
            },
            onError: () => {
                window.dispatchEvent(new CustomEvent('elevate:stop-loader'));
            },
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <div className="mb-6">
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mb-1">Welcome Back.</h1>
                <p className="text-slate-500 text-sm font-medium">Sign in to manage your inventory and operations.</p>
            </div>

            {status && (
                <div className="mb-6 rounded-md bg-green-50 p-4 text-sm font-medium text-green-800 border border-green-200 shadow-sm">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="email" value="Email Address" className="text-slate-700 font-semibold mb-1" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full rounded-lg border-slate-200 bg-slate-50 shadow-sm focus:border-slate-800 focus:bg-white focus:ring-slate-800 transition-all py-2.5 px-4 text-slate-900"
                        autoComplete="username"
                        isFocused={true}
                        placeholder="admin@elevate.com"
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-1">
                        <InputLabel htmlFor="password" value="Password" className="text-slate-700 font-semibold" />

                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                            >
                                Forgot password?
                            </Link>
                        )}
                    </div>

                    <div className="relative">
                        <TextInput
                            id="password"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full rounded-lg border-slate-200 bg-slate-50 shadow-sm focus:border-slate-800 focus:bg-white focus:ring-slate-800 transition-all py-2.5 pl-4 pr-12 text-slate-900"
                            autoComplete="current-password"
                            placeholder="••••••••"
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center mt-1 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="block">
                    <label className="flex items-center group cursor-pointer w-fit">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="text-slate-800 focus:ring-slate-800 rounded flex-shrink-0 border-slate-300 shadow-sm transition-colors"
                        />
                        <span className="ms-3 text-sm text-slate-600 font-medium group-hover:text-slate-900 transition-colors">
                            Keep me signed in
                        </span>
                    </label>
                </div>

                <div className="pt-2">
                    <PrimaryButton className="w-full justify-center bg-slate-900 hover:bg-slate-800 text-white rounded-lg py-3 font-bold tracking-wide transition-all shadow-md hover:shadow-lg focus:ring-offset-2 focus:ring-slate-900 text-base" disabled={processing}>
                        Access System
                    </PrimaryButton>
                </div>

                <p className="text-center text-[10px] text-slate-400 mt-6 font-medium tracking-wide uppercase">
                    Elevate Interiors System v1.0
                </p>
            </form>

            <LockoutModal 
                show={showLockoutModal} 
                onClose={() => setShowLockoutModal(false)} 
                lockoutData={flash.lockout} 
            />
        </GuestLayout>
    );
}
