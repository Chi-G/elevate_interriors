import { useEffect, useRef, useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
import LockoutModal from '@/Components/LockoutModal';

export default function Login({ status, canResetPassword }) {
  const { app, flash } = usePage().props;
  const [showPassword, setShowPassword] = useState(false);
  const [showLockoutModal, setShowLockoutModal] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [entered, setEntered] = useState(false);

  const prefersReducedMotion = useRef(
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );

  // Helper to resolve asset paths across environments
  const getAsset = (path) => {
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return app?.is_production && app?.url ? `${app.url}/${cleanPath}` : `/${cleanPath}`;
  };

  const logoSrc = getAsset('brand-logo.png');

  // Slideshow images from public/ (bg.png + 1.png through 10.png)
  const slides = [
    {
      src: getAsset('bg.png'),
      caption: 'The premium standard for modern inventory tracking and structural stock management.',
    },
    {
      src: getAsset('1.png'),
      caption: 'Full traceability from stockroom to showroom floor.',
    },
    {
      src: getAsset('2.png'),
      caption: 'Every unit logged, every structural movement accounted for.',
    },
    {
      src: getAsset('3.png'),
      caption: 'Curated spaces, synchronized stock intelligence.',
    },
    {
      src: getAsset('4.png'),
      caption: 'Built for the standard Elevate holds itself to.',
    },
    {
      src: getAsset('5.png'),
      caption: 'Precision logistics for bespoke architectural furniture.',
    },
    {
      src: getAsset('6.png'),
      caption: 'Seamless warehouse operations and catalog oversight.',
    },
    {
      src: getAsset('7.png'),
      caption: 'Real-time stock adjustments with zero guesswork.',
    },
    {
      src: getAsset('8.png'),
      caption: 'Elevated craftsmanship, meticulously cataloged.',
    },
    {
      src: getAsset('9.png'),
      caption: 'Streamlined procurement from verified global suppliers.',
    },
    {
      src: getAsset('10.png'),
      caption: 'Intelligent analytics powering luxury interior design.',
    },
  ];

  const { data, setData, post, processing, errors, reset } = useForm({
    email: '',
    password: '',
    remember: false,
  });

  // Handle staff lockout state
  useEffect(() => {
    if (flash?.lockout) {
      setShowLockoutModal(true);
    }
  }, [flash?.lockout]);

  // Entrance animation
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 60);
    return () => clearTimeout(t);
  }, []);

  // Slideshow auto-advance (6s interval)
  useEffect(() => {
    if (prefersReducedMotion.current) return;
    const id = setInterval(() => {
      setActiveSlide((i) => (i + 1) % slides.length);
    }, 6000);
    return () => clearInterval(id);
  }, [slides.length]);

  const submit = (e) => {
    e.preventDefault();

    const startTime = Date.now();
    window.dispatchEvent(
      new CustomEvent('elevate:start-loader', {
        detail: { text: 'AUTHENTICATING & LOADING DASHBOARD...' },
      })
    );

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
    <div className="min-h-screen w-full bg-[#FBFAF6] flex font-sans">
      <Head title="Sign In - Elevate Interiors" />

      {/* ---------- Left: Image Slideshow ---------- */}
      <div className="hidden lg:block relative lg:w-[58%] overflow-hidden bg-[#0E1522]">
        {slides.map((slide, i) => (
          <div
            key={i}
            aria-hidden={i !== activeSlide}
            className="absolute inset-0 transition-opacity duration-[1400ms] ease-out"
            style={{ opacity: i === activeSlide ? 1 : 0 }}
          >
            <img
              src={slide.src}
              alt=""
              className={`h-full w-full object-cover ${i === activeSlide && !prefersReducedMotion.current
                  ? 'animate-[kenburns_9s_ease-out_forwards]'
                  : ''
                }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220]/90 via-[#0B1220]/30 to-transparent" />
          </div>
        ))}

        <div className="relative h-full flex flex-col justify-end p-14 z-10">
          <p className="text-[#E9DFC8] text-lg font-light leading-snug max-w-md mb-6 transition-opacity duration-700">
            {slides[activeSlide].caption}
          </p>

          <h1 className="text-white text-[2.75rem] leading-[1.05] font-serif font-semibold tracking-tight mb-3">
            Elevate Interiors
          </h1>
          <p className="text-[#C9BFA5] text-sm max-w-sm">
            The premium standard for modern inventory tracking and structural stock management.
          </p>

          {/* Slide Progress Indicators */}
          <div className="flex gap-1.5 mt-8 flex-wrap max-w-md">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
                className="h-[3px] rounded-full transition-all duration-500 cursor-pointer p-0 border-0 outline-none"
                style={{
                  width: i === activeSlide ? '1.75rem' : '0.65rem',
                  backgroundColor:
                    i === activeSlide
                      ? '#C9A24B'
                      : 'rgba(233, 223, 200, 0.35)',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ---------- Right: Login Panel ---------- */}
      <div className="w-full lg:w-[42%] flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-sm">
          <div
            className="flex flex-col items-start text-left mb-8 transition-all duration-700 ease-out"
            style={{
              opacity: entered ? 1 : 0,
              transform: entered ? 'translateY(0)' : 'translateY(8px)',
            }}
          >
            <img
              src={logoSrc}
              alt="Elevate Interiors"
              className="h-16 w-16 rounded-2xl shadow-[0_4px_20px_rgba(184,135,74,0.18)] mb-6 object-contain bg-white p-2 border border-[#E7E2D8]"
            />
            <h2 className="font-serif font-medium text-[2.25rem] leading-[1.15] text-[#211E1A] tracking-tight mb-2.5">
              Welcome back
            </h2>
            <p className="font-sans text-[0.95rem] font-normal text-[#787163] leading-relaxed">
              Sign in to manage your inventory and operations.
            </p>
          </div>

          <form
            onSubmit={submit}
            className="transition-all duration-700 ease-out delay-150"
            style={{
              opacity: entered ? 1 : 0,
              transform: entered ? 'translateY(0)' : 'translateY(10px)',
            }}
          >
            {status && (
              <div className="mb-5 text-sm font-medium text-[#3F6B4F] bg-[#EDF3EE] rounded-lg px-4 py-2.5 border border-[#c3d9c8]">
                {status}
              </div>
            )}

            <div>
              <label className="block font-sans text-[0.875rem] font-medium text-[#211E1A] mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={data.email}
                autoComplete="username"
                placeholder="admin@elevateinteriors.space"
                onChange={(e) => setData('email', e.target.value)}
                className="w-full rounded-xl border border-[#E7E2D8] bg-[#F7F5EF] px-4 py-3 font-sans text-[1rem] font-normal text-[#211E1A] placeholder:text-[#B4AD9B] focus:outline-none focus:ring-2 focus:ring-[#C9A24B]/60 focus:border-[#C9A24B] transition"
                required
              />
              {errors.email && (
                <p className="mt-1.5 text-sm text-[#B3453A]">{errors.email}</p>
              )}
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-sans text-[0.875rem] font-medium text-[#211E1A]">
                  Password
                </label>
                {canResetPassword && (
                  <Link
                    href={route('password.request')}
                    className="font-sans text-[0.875rem] font-medium text-[#8A6A2E] hover:text-[#B8874A] transition-colors"
                  >
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={data.password}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  onChange={(e) => setData('password', e.target.value)}
                  className="w-full rounded-xl border border-[#E7E2D8] bg-[#F7F5EF] px-4 py-3 pr-12 font-sans text-[1rem] font-normal text-[#211E1A] placeholder:text-[#B4AD9B] focus:outline-none focus:ring-2 focus:ring-[#C9A24B]/60 focus:border-[#C9A24B] transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#8A8474] hover:text-[#211E1A] transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-sm text-[#B3453A]">{errors.password}</p>
              )}
            </div>

            <label className="flex items-center gap-2.5 mt-5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={data.remember}
                onChange={(e) => setData('remember', e.target.checked)}
                className="h-4 w-4 rounded border-[#D8D2C2] text-[#B8874A] focus:ring-[#C9A24B]/60 cursor-pointer"
              />
              <span className="font-sans text-[0.875rem] font-normal text-[#5B5646]">
                Keep me signed in
              </span>
            </label>

            <button
              type="submit"
              disabled={processing}
              className="w-full mt-7 rounded-xl bg-[#151312] hover:bg-[#211E1A] disabled:opacity-60 text-white font-sans text-[0.9rem] font-medium tracking-wide py-3.5 transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              {processing ? 'Signing in…' : 'Access system'}
            </button>

            <p className="font-sans text-[0.75rem] font-normal text-[#9E9786] mt-6">
              Elevate Interiors v1.0
            </p>
          </form>
        </div>
      </div>

      {/* Lockout Security Modal */}
      <LockoutModal
        show={showLockoutModal}
        onClose={() => setShowLockoutModal(false)}
        lockoutData={flash?.lockout}
      />

      {/* Ken Burns Keyframes */}
      <style>{`
        @keyframes kenburns {
          from { transform: scale(1); }
          to { transform: scale(1.08); }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-\\[kenburns_9s_ease-out_forwards\\] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
