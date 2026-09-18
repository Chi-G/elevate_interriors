export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-gray-300 text-[#B8874A] shadow-sm focus:ring-[#C9A24B] ' +
                className
            }
        />
    );
}
