import { useAuth } from '@/auth/AuthProvider';
// import { useFrappeAuth } from 'frappe-react-sdk'; // <-- ADD THIS
import { Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FrappeError } from 'frappe-react-sdk';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from 'lucide-react';

// 1. Define the validation schema with Zod
const loginSchema = z.object({
    email: z.string(),//.email({ message: "Please enter a valid email address." }),
    password: z.string().min(1, { message: "Password is required." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage = () => {
    const { login, currentUser, isLoading: isAuthLoading } = useAuth();
    // const { login, currentUser, isLoading: isAuthLoading } = useFrappeAuth();
    // const navigate = useNavigate();

    // 2. Set up the form with react-hook-form and Zod resolver
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

    // 3. Handle form submission
    const onSubmit = async (data: LoginFormValues) => {
        try {
            // 3. Call the SDK's login function with the EXACT object structure it needs.
            // This is the most critical change.
            await login({
                username: data.email,
                password: data.password
            });

            // 4. On success, manually trigger the full page reload.
            // This ensures the entire app state and Frappe boot info are refreshed.
            window.location.href = '/';
        } catch (err) {
            const error = err as FrappeError;
            // Set a user-friendly error message on the form
            setError("root", {
                type: "manual",
                message: error.message || 'An unknown error occurred. Please try again.',
            });
        }
    };

    // 4. If a user session is still loading, show a spinner.
    if (isAuthLoading) {
        return (
            <div className="flex items-center justify-center h-screen w-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // 5. If the user is already logged in, redirect them to the homepage.
    if (currentUser && currentUser !== 'Guest') {
        return <Navigate to="/" replace />;
    }

    // 6. Render the beautiful and functional login form.
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Login</CardTitle>
                    <CardDescription>Enter your email below to login to your CRM account.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="name@company.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••••" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {form.formState.errors.root && (
                                <p className="text-sm font-medium text-destructive">
                                    {form.formState.errors.root.message}
                                </p>
                            )}
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Sign In
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
};