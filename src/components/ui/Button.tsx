import { ButtonHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'gold', size = 'md', loading, children, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-raleway font-semibold tracking-wide rounded-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#c9a96e] focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed'

    const variants = {
      gold: 'bg-[#c9a96e] hover:bg-[#a8813e] text-white shadow-sm hover:shadow-md',
      outline: 'border-2 border-[#c9a96e] text-[#c9a96e] hover:bg-[#c9a96e] hover:text-white',
      ghost: 'text-[#c9a96e] hover:bg-[#c9a96e]/10',
    }

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-sm',
      lg: 'px-8 py-4 text-base',
    }

    return (
      <button
        ref={ref}
        className={clsx(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading...
          </span>
        ) : children}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
