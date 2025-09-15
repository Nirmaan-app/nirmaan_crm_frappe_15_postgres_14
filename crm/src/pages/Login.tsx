// File: src/pages/Login.tsx (Refactored for Split-Screen Desktop Layout)

import { useAuth } from '@/auth/AuthProvider'; // Assuming this is still needed for context, though useFrappeAuth also provides
import { useFrappeAuth } from 'frappe-react-sdk';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FrappeError } from 'frappe-react-sdk';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from 'lucide-react'; // For loading spinner
import logo from "@/assets/nirmaan-red.svg"


// 1. Define the validation schema with Zod
const loginSchema = z.object({
    email: z.string(), // Keeping as is: you can uncomment .email(...) if validation is desired.
    password: z.string().min(1, { message: "Password is required." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage = () => {
    const { login, currentUser, isLoading: isAuthLoading } = useFrappeAuth();
    const navigate = useNavigate(); // Keep navigate for programmatic navigation if needed

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

    // 3. Handle form submission - NO LOGIC CHANGE
    const onSubmit = async (data: LoginFormValues) => {
        try {
            await login({
                username: data.email,
                password: data.password
            });
            window.location.href = '/'; // Full page reload on success
        } catch (err) {
            const error = err as FrappeError;
            setError("root", {
                type: "manual",
                message: error.message || 'An unknown error occurred. Please try again.',
            });
        }
    };

    // 4. If a user session is still loading, show a full-screen spinner. - NO LOGIC CHANGE
    if (isAuthLoading) {
        return (
            <div className="flex items-center justify-center h-screen w-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Redirect if already logged in. - NO LOGIC CHANGE
    if (!currentUser) {
        // console.error(error)
        
    // 6. Render the login form with the new split-screen UI.
    return (
        // Main container for the split layout
        <div className="min-h-screen grid grid-cols-1 bg-gray-100 dark:bg-gray-900">
            {/* Left side: Login Form */}
            <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md">
                    <Card className="shadow-lg"> {/* Add shadow for better appearance */}
                        <CardHeader className="space-y-2 text-center"> {/* Increased space-y for new elements */}
                            {/* NEW: Logo and "Login" title */}
                            <div className="flex items-center justify-center gap-1 pr-4"> {/* Use flex to align logo and title */}
                                <img
                                    src={logo} // Your existing logo path
                                    alt="Nirmaan CRM"
                                    className="h-12 w-12 object-contain" // Adjust size as needed
                                />
                                <CardTitle className="text-3xl font-bold text-destructive">CRM</CardTitle> {/* Changed title to just "Login" */}
                            </div>

                            {/* NEW: Welcome Message
                            <p className="text-lg font-semibold text-foreground">
                                Welcome to Nirmaan CRM
                            </p> */}

                            {/* Original CardDescription */}
                            <CardDescription className="text-muted-foreground text-sm">
                                Enter your credentials to access your account.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6"> {/* Increased spacing */}
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
                                        <p className="text-sm font-medium text-destructive text-center">
                                            {form.formState.errors.root.message}
                                        </p>
                                    )}
                                    <div className="text-right text-sm">
                                        <Link className="text-blue-600 hover:underline hover:text-blue-800" to={"/forgot-password"}>
                                            Forgot Password?
                                        </Link>
                                    </div>
                                    <Button type="submit" className="w-full bg-destructive hover:bg-destructive/90" disabled={isSubmitting}>
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Sign In
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Right side: Company Logo/Banner - Hidden on mobile, shown on large screens */}
            {/* <div
                className="hidden lg:flex items-center justify-center p-8 bg-destructive" // Red background for the banner
            >
                <img
                    src="/web-app-manifest-512x512.png" // Path to your image in the public folder
                    alt="Company Banner"
                    className="max-w-full h-auto max-h-96 object-contain" // Ensures image scales down but keeps aspect ratio
                />
            </div> */}
        </div>
    )
} else {
    return <Navigate to="/"/>;
}
};
// import { useAuth } from '@/auth/AuthProvider';
// import { useFrappeAuth } from 'frappe-react-sdk'; // <-- ADD THIS
// import { Navigate, useNavigate,Link } from 'react-router-dom';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import * as z from 'zod';
// import { FrappeError } from 'frappe-react-sdk';

// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Loader2 } from 'lucide-react';


// // 1. Define the validation schema with Zod
// const loginSchema = z.object({
//     email: z.string(),//.email({ message: "Please enter a valid email address." }),
//     password: z.string().min(1, { message: "Password is required." }),
// });

// type LoginFormValues = z.infer<typeof loginSchema>;

// export const LoginPage = () => {
//     // const { login, currentUser,isAuthLoading } = useAuth();
//     const { login, currentUser, isLoading: isAuthLoading } = useFrappeAuth();
//     // const navigate = useNavigate();

//     // 2. Set up the form with react-hook-form and Zod resolver
//     const form = useForm<LoginFormValues>({
//         resolver: zodResolver(loginSchema),
//         defaultValues: {
//             email: "",
//             password: "",
//         },
//     });

//     const {
//         formState: { isSubmitting },
//         setError,
//     } = form;

//     // 3. Handle form submission
//     const onSubmit = async (data: LoginFormValues) => {
//         try {
//             // 3. Call the SDK's login function with the EXACT object structure it needs.
//             // This is the most critical change.
//             await login({
//                 username: data.email,
//                 password: data.password
//             });

//             // 4. On success, manually trigger the full page reload.
//             // This ensures the entire app state and Frappe boot info are refreshed.
//             window.location.href = '/';
//         } catch (err) {
//             const error = err as FrappeError;
//             // Set a user-friendly error message on the form
//             setError("root", {
//                 type: "manual",
//                 message: error.message || 'An unknown error occurred. Please try again.',
//             });
//         }
//     };

//     // 4. If a user session is still loading, show a spinner.
//     if (isAuthLoading) {
//         return (
//             <div className="flex items-center justify-center h-screen w-full">
//                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
//             </div>
//         );
//     }

//     if (currentUser && currentUser !== 'Guest') {
//         return <Navigate to="/" replace />;
//     }

//     // 6. Render the beautiful and functional login form.
//     return (
//         <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
//             <Card className="w-full max-w-sm">
//                 <CardHeader>
//                     <CardTitle className="text-2xl">Login</CardTitle>
//                     <CardDescription>Enter your email below to login to your CRM account.</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                     <Form {...form}>
//                         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//                             <FormField
//                                 control={form.control}
//                                 name="email"
//                                 render={({ field }) => (
//                                     <FormItem>
//                                         <FormLabel>Email</FormLabel>
//                                         <FormControl>
//                                             <Input placeholder="name@company.com" {...field} />
//                                         </FormControl>
//                                         <FormMessage />
//                                     </FormItem>
//                                 )}
//                             />
//                             <FormField
//                                 control={form.control}
//                                 name="password"
//                                 render={({ field }) => (
//                                     <FormItem>
//                                         <FormLabel>Password</FormLabel>
//                                         <FormControl>
//                                             <Input type="password" placeholder="••••••••" {...field} />
//                                         </FormControl>
//                                         <FormMessage />
//                                     </FormItem>
//                                 )}
//                             />
//                             {form.formState.errors.root && (
//                                 <p className="text-sm font-medium text-destructive">
//                                     {form.formState.errors.root.message}
//                                 </p>
//                             )}
//                             <div className="text-end text-sm">
//                                             <Link className="hover:text-blue-600" to={"/forgot-password"}>
//                                                   Forgot Password?
//                                             </Link>
//                                             </div>
//                             <Button type="submit" className="w-full" disabled={isSubmitting}>
//                                 {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//                                 Sign In
//                             </Button>
//                         </form>
//                     </Form>
//                 </CardContent>
//             </Card>
//         </div>
//     );
// };