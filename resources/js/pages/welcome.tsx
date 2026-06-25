import { Head, Link, usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';

import { useDynamicTheme } from '@/hooks/use-dynamic-theme';

export default function Welcome() {
    useDynamicTheme();
    const { auth, site: settings } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome" />
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
                {/* Background Glow Effects using dynamic colors */}
                <div 
                    className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20" 
                    style={{ backgroundColor: 'var(--primary)' }} 
                />
                <div 
                    className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20" 
                    style={{ backgroundColor: 'var(--accent)' }} 
                />

                <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center max-w-2xl">
                    {/* Logo / App Name */}
                    <div className="flex items-center gap-3">
                        <div 
                            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-transform hover:scale-110" 
                            style={{ 
                                background: 'linear-gradient(to bottom right, var(--primary), var(--accent))',
                                boxShadow: '0 10px 15px -3px color-mix(in srgb, var(--primary), transparent 75%)'
                            }}
                        >
                            {settings.app_logo ? (
                                <img src={settings.app_logo} alt={settings.app_name} className="w-7 h-7 object-contain" />
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            )}
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">{settings.app_name}</h1>
                    </div>

                    {/* Tagline */}
                    <p className="text-lg text-slate-400 leading-relaxed">
                        A clean Laravel + Inertia + React starter kit with authentication, roles & permissions, user management, and a modern UI component library — ready for anything you want to build.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex gap-4 mt-4">
                        {auth.user ? (
                            <Link
                                href="/dashboard"
                                className="px-8 py-3 text-white font-semibold rounded-xl shadow-lg hover:scale-[1.02] transition-all duration-200"
                                style={{ 
                                    background: 'linear-gradient(to right, var(--primary), var(--accent))',
                                    boxShadow: '0 10px 15px -3px color-mix(in srgb, var(--primary), transparent 60%)'
                                }}
                            >
                                Go to Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="px-8 py-3 text-white font-semibold rounded-xl shadow-lg hover:scale-[1.02] transition-all duration-200"
                                    style={{ 
                                        background: 'linear-gradient(to right, var(--primary), var(--accent))',
                                        boxShadow: '0 10px 15px -3px color-mix(in srgb, var(--primary), transparent 60%)'
                                    }}
                                >
                                    Log In
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-8 py-3 border border-slate-600 text-slate-300 font-semibold rounded-xl hover:bg-white/5 hover:border-slate-500 transition-all duration-200"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Feature Pills */}
                    <div className="flex flex-wrap justify-center gap-3 mt-8">
                        {['Auth & 2FA', 'Roles & Permissions', 'User Management', 'Dark Mode', 'Data Tables', 'Modern UI'].map((feature) => (
                            <span
                                key={feature}
                                className="px-4 py-1.5 text-sm font-medium bg-white/5 border border-white/10 rounded-full text-slate-400"
                            >
                                {feature}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="absolute bottom-6 text-sm text-slate-600">
                    Built with Laravel, Inertia.js & React
                </div>
            </div>
        </>
    );
}
