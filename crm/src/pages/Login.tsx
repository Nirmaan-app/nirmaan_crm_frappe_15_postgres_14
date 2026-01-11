// File: src/pages/Login.tsx - Brand-aligned Industrial Design

import { useFrappeAuth } from 'frappe-react-sdk';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FrappeError } from 'frappe-react-sdk';

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowRight, Building2, Users, BarChart3, Target, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import logo from "@/assets/nirmaan-red.svg";

const loginSchema = z.object({
    email: z.string().min(1, { message: "Email is required." }),
    password: z.string().min(1, { message: "Password is required." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage = () => {
    const { login, currentUser, isLoading: isAuthLoading } = useFrappeAuth();
    const navigate = useNavigate();

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const {
        formState: { isSubmitting },
        setError,
    } = form;

    const [showPassword, setShowPassword] = useState(false);

    const onSubmit = async (data: LoginFormValues) => {
        try {
            await login({
                username: data.email,
                password: data.password
            });
            window.location.href = `/${import.meta.env.VITE_BASE_NAME}`;
        } catch (err) {
            const error = err as FrappeError;
            setError("root", {
                type: "manual",
                message: error.message || 'Invalid credentials. Please try again.',
            });
        }
    };

    if (isAuthLoading) {
        return (
            <div className="flex items-center justify-center h-screen w-full bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                    <p className="text-muted-foreground text-sm tracking-wide animate-pulse">Loading...</p>
                </div>
            </div>
        );
    }

    if (currentUser) {
        navigate("/");
    }

    if (!currentUser) {
        return (
            <div className="min-h-screen grid lg:grid-cols-2 bg-background">
                {/* Left Panel - Login Form */}
                <div className="flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24 relative overflow-hidden">
                    {/* Industrial grid pattern background */}
                    <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
                        <svg className="w-full h-full text-foreground" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid)" />
                        </svg>
                    </div>

                    {/* Accent corner detail */}
                    <div className="absolute top-0 left-0 w-32 h-32">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-transparent" />
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-transparent" />
                    </div>

                    <div className="relative z-10 w-full max-w-md mx-auto">
                        {/* Logo & Branding */}
                        <div className="mb-12 animate-[fadeSlideDown_0.6s_ease-out]">
                            <div className="flex items-center gap-3 mb-8">
                                <img
                                    src={logo}
                                    alt="Nirmaan"
                                    className="h-11 w-11 object-contain"
                                />
                                <div className="h-8 w-px bg-border" />
                                <span className="text-2xl font-semibold tracking-tight text-primary">
                                    CRM
                                </span>
                            </div>
                            <h1 className="text-4xl font-bold text-foreground tracking-tight mb-3">
                                Welcome back
                            </h1>
                            <p className="text-muted-foreground text-lg">
                                Sign in to continue to your workspace
                            </p>
                        </div>

                        {/* Form */}
                        <div className="animate-[fadeSlideUp_0.6s_ease-out_0.1s_both]">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-foreground font-medium">
                                                    Email address
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="you@company.com"
                                                        className="h-12 px-4 bg-card border-input rounded-md text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 focus:ring-4 transition-all duration-200"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-primary" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="flex items-center justify-between">
                                                    <FormLabel className="text-foreground font-medium">
                                                        Password
                                                    </FormLabel>
                                                    <Link
                                                        to="/forgot-password"
                                                        className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                                                    >
                                                        Forgot password?
                                                    </Link>
                                                </div>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            type={showPassword ? "text" : "password"}
                                                            placeholder="Enter your password"
                                                            className="h-12 px-4 pr-12 bg-card border-input rounded-md text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 focus:ring-4 transition-all duration-200"
                                                            {...field}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                                                            tabIndex={-1}
                                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                                        >
                                                            {showPassword ? (
                                                                <EyeOff className="h-5 w-5" />
                                                            ) : (
                                                                <Eye className="h-5 w-5" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="text-primary" />
                                            </FormItem>
                                        )}
                                    />

                                    {form.formState.errors.root && (
                                        <div className="p-4 rounded-md bg-primary/10 border border-primary/20 animate-[shake_0.5s_ease-in-out]">
                                            <p className="text-sm text-primary font-medium">
                                                {form.formState.errors.root.message}
                                            </p>
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-md shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 group"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Signing in...
                                            </>
                                        ) : (
                                            <>
                                                Sign in
                                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        </div>

                        {/* Footer */}
                        <div className="mt-12 pt-8 border-t border-border animate-[fadeIn_0.6s_ease-out_0.3s_both]">
                            <p className="text-sm text-muted-foreground text-center">
                                Nirmaan CRM &middot; Built for modern sales teams
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Brand Showcase with Industrial Theme */}
                <div className="hidden lg:flex relative overflow-hidden" style={{ background: 'hsl(var(--primary))' }}>
                    {/* Industrial geometric overlay */}
                    <div className="absolute inset-0">
                        {/* Abstract shapes */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
                        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl transform -translate-x-1/2 -translate-y-1/2" />
                    </div>

                    {/* Diagonal industrial lines */}
                    <div className="absolute inset-0 opacity-10">
                        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern id="diagonals" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                                    <line x1="0" y1="0" x2="0" y2="40" stroke="white" strokeWidth="1"/>
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#diagonals)" />
                        </svg>
                    </div>

                    {/* Corner accent - industrial detail */}
                    <div className="absolute bottom-0 right-0 w-48 h-48">
                        <div className="absolute bottom-0 right-0 w-full h-2 bg-gradient-to-l from-white/20 to-transparent" />
                        <div className="absolute bottom-0 right-0 w-2 h-full bg-gradient-to-t from-white/20 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 text-white">
                        <div className="max-w-lg">
                            <h2 className="text-4xl xl:text-5xl font-bold leading-tight mb-6 animate-[fadeSlideLeft_0.8s_ease-out_0.2s_both]">
                                Streamline your
                                <br />
                                <span className="text-white/70">sales pipeline</span>
                            </h2>
                            <p className="text-lg text-white/70 mb-12 leading-relaxed animate-[fadeSlideLeft_0.8s_ease-out_0.3s_both]">
                                Manage leads, track opportunities, and close deals faster with Nirmaan CRM's intuitive platform.
                            </p>

                            {/* Feature highlights - Industrial card style */}
                            <div className="grid grid-cols-2 gap-4 animate-[fadeSlideUp_0.8s_ease-out_0.4s_both]">
                                <FeatureCard
                                    icon={<Building2 className="h-5 w-5" />}
                                    title="Company Management"
                                    delay="0.5s"
                                />
                                <FeatureCard
                                    icon={<Users className="h-5 w-5" />}
                                    title="Contact Tracking"
                                    delay="0.6s"
                                />
                                <FeatureCard
                                    icon={<BarChart3 className="h-5 w-5" />}
                                    title="BOQ & Quotes"
                                    delay="0.7s"
                                />
                                <FeatureCard
                                    icon={<Target className="h-5 w-5" />}
                                    title="Task Management"
                                    delay="0.8s"
                                />
                            </div>
                        </div>

                        {/* Bottom decoration - Industrial line */}
                        <div className="absolute bottom-8 left-12 xl:left-20 right-12 xl:right-20">
                            <div className="flex items-center gap-4 text-white/50 text-sm">
                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                                <span className="font-medium tracking-wide uppercase text-xs">Trusted by sales teams</span>
                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Global styles for animations */}
                <style>{`
                    @keyframes fadeSlideDown {
                        from {
                            opacity: 0;
                            transform: translateY(-20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    @keyframes fadeSlideUp {
                        from {
                            opacity: 0;
                            transform: translateY(20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    @keyframes fadeSlideLeft {
                        from {
                            opacity: 0;
                            transform: translateX(30px);
                        }
                        to {
                            opacity: 1;
                            transform: translateX(0);
                        }
                    }
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    @keyframes shake {
                        0%, 100% { transform: translateX(0); }
                        20% { transform: translateX(-8px); }
                        40% { transform: translateX(8px); }
                        60% { transform: translateX(-4px); }
                        80% { transform: translateX(4px); }
                    }
                `}</style>
            </div>
        );
    }
};

// Feature card component with industrial styling
const FeatureCard = ({
    icon,
    title,
    delay
}: {
    icon: React.ReactNode;
    title: string;
    delay: string;
}) => (
    <div
        className="flex items-center gap-3 p-4 rounded-md bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15 hover:border-white/20 transition-all duration-300"
        style={{ animation: `fadeSlideUp 0.6s ease-out ${delay} both` }}
    >
        <div className="flex-shrink-0 p-2 rounded-md bg-white/10">
            {icon}
        </div>
        <span className="text-sm font-medium text-white/90">{title}</span>
    </div>
);
