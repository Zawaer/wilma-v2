"use client";

import * as React from 'react'
import { EyeIcon, EyeOffIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const PasswordInput = React.forwardRef<HTMLInputElement, React.ComponentPropsWithoutRef<'input'>>(
	({ className, type, ...props }, ref) => {
		const [showPassword, setShowPassword] = React.useState(false)

		return (
			<div className="relative">
				<Input
					type={showPassword ? 'text' : 'password'}
					className={cn('hide-password-toggle pr-10', className)}
					ref={ref}
					{...props}
				/>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute w-4 h-4 right-2 top-2.5 hover:bg-transparent"
                    onClick={() => setShowPassword((prev) => !prev)}
                >
                    {showPassword ? (
                        <EyeOffIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    ) : (
                        <EyeIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    )}
                    <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
			    </Button>

			{/* hides browsers password toggles */}
			<style>{`
					.hide-password-toggle::-ms-reveal,
					.hide-password-toggle::-ms-clear {
						visibility: hidden;
						pointer-events: none;
						display: none;
					}
                `}</style>
		</div>
	)
})
PasswordInput.displayName = 'PasswordInput'

export { PasswordInput }
