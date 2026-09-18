export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center justify-center rounded-xl border border-transparent bg-[#B8874A] px-5 py-2.5 text-sm font-medium text-white transition-all shadow-sm hover:bg-[#A3743B] active:bg-[#8E632F] focus:outline-none focus:ring-2 focus:ring-[#C9A24B]/50 active:scale-95 cursor-pointer disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 ${
                    disabled ? 'opacity-50' : ''
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
