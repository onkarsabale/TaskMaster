import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import * as authApi from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';

const loginSchema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = loginSchema.extend({
    username: z.string().min(1, 'Full Name is required'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    terms: z.literal(true, {
        message: "You must accept the Terms and Conditions",
    }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;
type FormData = LoginFormData & Partial<RegisterFormData>; // Union-like type to support both modes

export const Login = () => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [authError, setAuthError] = useState('');
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.login);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        clearErrors,
    } = useForm<FormData>({
        resolver: zodResolver(isRegistering ? registerSchema : loginSchema),
    });

    // Reset form and errors moved to handlers

    const onSubmit = async (data: FormData) => {
        setAuthError('');
        try {
            let user;
            if (isRegistering) {
                // RegisterFormData type assertion or safe access
                const regData = data as RegisterFormData;
                user = await authApi.register({
                    email: regData.email,
                    password: regData.password,
                    username: regData.username,
                });
            } else {
                user = await authApi.login({
                    email: data.email,
                    password: data.password,
                });
            }
            // Pass token to store for Authorization header fallback
            setAuth(user, user.token);
            navigate('/');
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setAuthError(error.response?.data?.message || 'An error occurred during authentication');
        }
    };

    return (
        <div className="font-display bg-[rgb(var(--color-bg))] min-h-screen flex flex-col text-[rgb(var(--color-text))] antialiased selection:bg-[rgb(var(--color-primary))]/30 selection:text-[rgb(var(--color-primary))]">
            {/* Header */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-200 dark:border-gray-800 px-6 lg:px-10 py-4 bg-[rgb(var(--color-bg))]/50 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="size-8 flex items-center justify-center rounded-lg bg-[rgb(var(--color-primary))] text-white">
                        <span className="material-symbols-outlined text-[20px]">check_circle</span>
                    </div>
                    <h2 className="text-[rgb(var(--color-text))] text-lg font-bold leading-tight tracking-[-0.015em]">TaskMaster</h2>
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center py-10 px-4 sm:px-6">
                <div className="w-full max-w-[480px] flex flex-col gap-6">
                    {/* Auth Card */}
                    <div className="bg-white dark:bg-[#1e2736] rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">
                        {/* Headline */}
                        <div className="pt-8 pb-2 px-8 text-center">
                            <h1 className="text-slate-900 dark:text-white tracking-tight text-3xl font-bold leading-tight">
                                {isRegistering ? 'Create an account' : 'Welcome back'}
                            </h1>
                            <p className="text-slate-500 dark:text-[#9da8b9] text-sm font-normal leading-normal pt-2">
                                {isRegistering
                                    ? 'Enter your details to manage your tasks effectively.'
                                    : 'Sign in to access your task dashboard.'}
                            </p>
                        </div>

                        {/* Tabs */}
                        <div className="px-8 mt-6">
                            <div className="flex border-b border-gray-200 dark:border-gray-700 w-full">
                                <button
                                    onClick={() => {
                                        setIsRegistering(false);
                                        reset();
                                        clearErrors();
                                        setAuthError('');
                                    }}
                                    className={`flex flex-col items-center justify-center border-b-[3px] pb-3 pt-4 flex-1 cursor-pointer transition-colors ${!isRegistering
                                        ? 'border-b-[rgb(var(--color-primary))] text-[rgb(var(--color-primary))]'
                                        : 'border-b-transparent hover:border-b-gray-300 dark:hover:border-b-gray-600 text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                        } `}
                                >
                                    <p className="text-sm font-bold leading-normal tracking-[0.015em]">Login</p>
                                </button>
                                <button
                                    onClick={() => {
                                        setIsRegistering(true);
                                        reset();
                                        clearErrors();
                                        setAuthError('');
                                    }}
                                    className={`flex flex-col items-center justify-center border-b-[3px] pb-3 pt-4 flex-1 cursor-pointer transition-colors ${isRegistering
                                        ? 'border-b-[rgb(var(--color-primary))] text-[rgb(var(--color-primary))]'
                                        : 'border-b-transparent hover:border-b-gray-300 dark:hover:border-b-gray-600 text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                        } `}
                                >
                                    <p className="text-sm font-bold leading-normal tracking-[0.015em]">Register</p>
                                </button>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit(onSubmit)} className="p-8 flex flex-col gap-5">
                            {/* Full Name (Register only) */}
                            {isRegistering && (
                                <label className="flex flex-col gap-1.5">
                                    <span className="text-slate-900 dark:text-white text-sm font-medium leading-normal">Full Name</span>
                                    <div className="relative">
                                        <input
                                            {...register('username')}
                                            className={`form-input flex w-full rounded-lg border bg-gray-50 dark:bg-[#111418] focus:ring-1 h-12 pl-11 pr-4 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#9da8b9] text-sm transition-colors ${errors.username
                                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                : 'border-gray-200 dark:border-gray-600 focus:border-[rgb(var(--color-primary))] focus:ring-[rgb(var(--color-primary))]'
                                                } `}
                                            placeholder="Jane Doe"
                                            type="text"
                                        />
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#9da8b9] text-[20px]">person</span>
                                    </div>
                                    {errors.username && <span className="text-red-500 text-xs">{errors.username.message}</span>}
                                </label>
                            )}

                            {/* Email */}
                            <label className="flex flex-col gap-1.5">
                                <span className="text-slate-900 dark:text-white text-sm font-medium leading-normal">Email Address</span>
                                <div className="relative">
                                    <input
                                        {...register('email')}
                                        className={`form-input flex w-full rounded-lg border bg-gray-50 dark:bg-[#111418] focus:ring-1 h-12 pl-11 pr-4 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#9da8b9] text-sm transition-colors ${errors.email
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                            : 'border-gray-200 dark:border-gray-600 focus:border-[rgb(var(--color-primary))] focus:ring-[rgb(var(--color-primary))]'
                                            } `}
                                        placeholder="you@example.com"
                                        type="email"
                                    />
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#9da8b9] text-[20px]">mail</span>
                                </div>
                                {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
                            </label>

                            {/* Password */}
                            <label className="flex flex-col gap-1.5">
                                <span className="text-slate-900 dark:text-white text-sm font-medium leading-normal">Password</span>
                                <div className="relative">
                                    <input
                                        {...register('password')}
                                        className={`form-input flex w-full rounded-lg border bg-gray-50 dark:bg-[#111418] focus:ring-1 h-12 pl-11 pr-11 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#9da8b9] text-sm transition-colors ${errors.password
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                            : 'border-gray-200 dark:border-gray-600 focus:border-[rgb(var(--color-primary))] focus:ring-[rgb(var(--color-primary))]'
                                            } `}
                                        placeholder="Create a password"
                                        type="password"
                                    />
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#9da8b9] text-[20px]">lock</span>
                                    {/* Visibility toggle could go here */}
                                </div>
                                {errors.password && <span className="text-red-500 text-xs">{errors.password.message}</span>}
                            </label>

                            {/* Confirm Password (Register only) */}
                            {isRegistering && (
                                <label className="flex flex-col gap-1.5">
                                    <span className="text-slate-900 dark:text-white text-sm font-medium leading-normal">Confirm Password</span>
                                    <div className="relative">
                                        <input
                                            {...register('confirmPassword')}
                                            className={`form-input flex w-full rounded-lg border bg-[rgb(var(--color-bg))] focus:ring-1 h-12 pl-11 pr-11 text-[rgb(var(--color-text))] placeholder:text-slate-400 text-sm transition-colors ${errors.confirmPassword
                                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                                : 'border-gray-300 dark:border-gray-700 focus:border-[rgb(var(--color-primary))] focus:ring-[rgb(var(--color-primary))]'
                                                } `}
                                            placeholder="Confirm your password"
                                            type="password"
                                        />
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#9da8b9] text-[20px]">lock_reset</span>
                                    </div>
                                    {errors.confirmPassword && (
                                        <span className="text-red-500 text-xs">{errors.confirmPassword.message}</span>
                                    )}
                                </label>
                            )}

                            {/* Terms Checkbox (Register only) */}
                            {isRegistering && (
                                <div className="flex flex-col">
                                    <label className="flex items-start gap-3 mt-1 cursor-pointer group">
                                        <div className="relative flex items-center">
                                            <input
                                                {...register('terms')}
                                                className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-gray-300 dark:border-gray-700 bg-[rgb(var(--color-bg))] checked:border-[rgb(var(--color-primary))] checked:bg-[rgb(var(--color-primary))] transition-all"
                                                type="checkbox"
                                            />
                                            <span className="material-symbols-outlined pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[16px] text-white opacity-0 peer-checked:opacity-100">check</span>
                                        </div>
                                        <span className="text-slate-600 dark:text-slate-400 text-sm font-normal leading-tight group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
                                            I agree to the <a className="text-[rgb(var(--color-primary))] hover:underline" href="#">Terms of Service</a> and <a className="text-[rgb(var(--color-primary))] hover:underline" href="#">Privacy Policy</a>.
                                        </span>
                                    </label>
                                    {errors.terms && <span className="text-red-500 text-xs mt-1">{errors.terms.message}</span>}
                                </div>
                            )}

                            {/* API Error Message */}
                            {authError && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                                    {authError}
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-[rgb(var(--color-primary))] hover:bg-blue-600 text-white text-sm font-bold leading-normal tracking-[0.015em] shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                            >
                                <span className="truncate">{isRegistering ? 'Create Account' : 'Sign In'}</span>
                            </button>

                            {/* Divider & Socials (Visual Only) */}
                            <div className="relative flex py-2 items-center">
                                <div className="flex-grow border-t border-gray-200 dark:border-[#3b4554]"></div>
                                <span className="flex-shrink-0 mx-4 text-slate-400 dark:text-[#9da8b9] text-xs font-medium uppercase">Or continue with</span>
                                <div className="flex-grow border-t border-gray-200 dark:border-[#3b4554]"></div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button type="button" className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-[rgb(var(--color-bg))] h-10 px-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <svg className="size-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    <span className="text-slate-700 dark:text-white text-sm font-semibold">Google</span>
                                </button>
                                <button type="button" className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-[rgb(var(--color-bg))] h-10 px-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <svg className="size-5 text-[rgb(var(--color-text))]" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.03.66-3.72-1.455-3.72-1.455-.54-1.38-1.335-1.755-1.335-1.755-1.005-.69.075-.675.075-.675 1.11.075 1.695 1.14 1.695 1.14 1.005 1.725 2.64 1.23 3.285.945.105-.735.39-1.23.705-1.515-2.64-.3-5.43-1.32-5.43-5.91 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.285 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                                    </svg>
                                    <span className="text-slate-700 dark:text-white text-sm font-semibold">GitHub</span>
                                </button>
                            </div>
                        </form>

                        {/* Footer */}
                        <div className="text-center pb-8 px-8">
                            <p className="text-slate-500 dark:text-[#9da8b9] text-sm">
                                {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
                                <button
                                    onClick={() => setIsRegistering(!isRegistering)}
                                    className="text-[rgb(var(--color-primary))] font-bold hover:underline"
                                >
                                    {isRegistering ? 'Log in' : 'Sign up'}
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
