// File: src/pages/ForgotPassword.tsx (Refactored for Split-Screen Desktop Layout)

import { useNavigate, Navigate, Link } from "react-router-dom"; // Added Link for navigation
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Loader2 } from "lucide-react"; // Loader2 is useful for button spinner

import { FrappeConfig, FrappeContext } from "frappe-react-sdk"; // Keep if still needed for direct call to FrappeContext

// Shadcn UI components for form and display
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useContext, useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast"; // Your custom use-toast hook
import { cn } from "@/lib/utils";
import { useAuth } from "@/auth/AuthProvider"; // Assuming useAuth is correctly providing currentUser

const forgotPasswordSchema = z.object({
  userId: z.string().min(1, { message: "User ID is required." }).email("Please enter a valid email address."), // Added email validation for userId
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      userId: "",
    },
  });
  // Safely get 'call' from FrappeContext
  const { call } = useContext(FrappeContext) as FrappeConfig; // Assuming FrappeConfig has 'call'

  const {
    formState: { isSubmitting, errors },
    setError,
  } = form;

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      await call.post('frappe.core.doctype.user.user.reset_password', {
        user: values.userId
      })

      toast({
        title: "Success!",
        description: "Password Reset Email has been sent to your registered email ID.",
        variant: "success",
      });
      
      navigate("/login"); 

    } catch (err: any) {
      console.error("Forgot Password Error:", err);
      // Use FrappeError type guard if frappe-react-sdk provides it, otherwise safe cast
      const errorMessage = err.message || 'An unknown error occurred. Please try again.';
      setError("root", {
        type: "manual",
        message: errorMessage,
      });
      toast({
        title: "Failed!",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Redirect if already logged in
  if (currentUser && currentUser !== 'Guest') {
    return <Navigate to="/" replace />;
  }

  return (
    // Main container for the split layout (same as login)
    <div className="min-h-screen grid grid-cols-1 bg-gray-100 dark:bg-gray-900">
      {/* Left side: Forgot Password Form */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <Card className="shadow-lg">
            <CardHeader className="space-y-4 text-center"> {/* Adjusted spacing */}
                {/* Logo and "Forgot Password" title */}
                <div className="flex items-center justify-center gap-3">
                    <img
                        src="/web-app-manifest-512x512.png" // Your existing logo path
                        alt="Nirmaan CRM Logo"
                        className="h-8 w-8 object-contain"
                    />
                    <CardTitle className="text-2xl font-bold text-destructive">Forgot Password</CardTitle>
                </div>

                {/* Welcome Message (optional, but consistent with login page) */}
                <p className="text-lg font-semibold text-foreground">
                    Reset Your Nirmaan CRM Password
                </p>
                
                <CardDescription className="text-muted-foreground text-sm">
                    Enter your registered email ID to receive a password reset link.
                </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Back to Login button */}
              <Button 
                variant="link" // Use "link" variant for button styling
                className="mb-6 px-0 text-destructive hover:text-destructive flex items-center justify-start gap-1 h-auto" 
                onClick={() => navigate("/login")}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Button>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="userId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Registered Email ID</FormLabel> {/* Changed label for clarity */}
                        <FormControl>
                          <Input
                            type="email" // Changed type to email for better UX
                            placeholder="your.email@company.com" // Updated placeholder
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {errors.root && (
                    <p className="text-sm font-medium text-destructive text-center">
                      {errors.root.message}
                    </p>
                  )}

                  <Button type="submit" className="w-full bg-destructive hover:bg-destructive/90" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {/* Added spinner back */}
                    {isSubmitting ? "Sending..." : "Send Reset Link"} 
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right side: Company Logo/Banner with description text (same as login) */}
      {/* <div
          className="hidden lg:flex flex-col items-center justify-center p-8 bg-destructive text-white"
      >
          <img
              src="/web-app-manifest-512x512.png" // Path to your image in the public folder
              alt="Company Banner"
              className="max-w-full h-auto max-h-96 object-contain"
          />
          
      </div> */}
    </div>
  );
}


// import { useNavigate, Navigate } from "react-router-dom";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { ArrowLeft } from "lucide-react"; // Only ArrowLeft needed now

// import { FrappeConfig, FrappeContext } from "frappe-react-sdk";


// // Shadcn UI components for form and display
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { useContext, useState } from "react";

// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { toast } from "@/hooks/use-toast"; // Your custom use-toast hook
// // import logo from "@/assets/logo-svg.svg"; // --- REMOVED: Logo import ---
// import { cn } from "@/lib/utils";
// import { useAuth } from "@/auth/AuthProvider";

// const forgotPasswordSchema = z.object({
//   userId: z.string().min(1, { message: "User ID is required." }),
// });

// type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

// export default function  ForgotPassword(){
//   const { currentUser } = useAuth();

//   const navigate = useNavigate();

//   const form = useForm<ForgotPasswordFormValues>({
//     resolver: zodResolver(forgotPasswordSchema),
//     defaultValues: {
//       userId: "",
//     },
//   });
//   const { call } = useContext(FrappeContext) as FrappeConfig

//   const {
//     formState: { isSubmitting, errors },
//     setError,
//   } = form;

//   const onSubmit = async (values: ForgotPasswordFormValues) => {
//     try {
//        await call.post('frappe.core.doctype.user.user.reset_password', {
//         user: values.userId
//       })

//       toast({
//         title: "Success!",
//         description: "Password Reset Email has been sent to your registered email ID.",
//         variant: "success",
//       });
      
//       navigate("/login"); 

//     } catch (err: any) {
//       console.error("Forgot Password Error:", err);
//       setError("root", {
//         type: "manual",
//         message: err.message || 'An unknown error occurred. Please try again.',
//       });
//       toast({
//         title: "Failed!",
//         description: err.message || "Unable to send password reset link.",
//         variant: "destructive",
//       });
//     }
//   };

//   if (currentUser && currentUser !== 'Guest') {
//     return <Navigate to="/" replace />;
//   }

//   return (
//     <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
//       <Card className="w-full max-w-sm">
//         <CardHeader className="space-y-1 text-center">
//             {/* --- REMOVED: Logo div --- */}
//             <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
//             <CardDescription className="text-muted-foreground text-sm">
//                 Enter your User ID to reset the password.
//             </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <Button 
//             variant="ghost" 
//             className="mb-4 text-destructive hover:text-destructive flex items-center justify-start gap-1 p-0 h-auto" 
//             onClick={() => navigate("/login")}
//           >
//             <ArrowLeft className="h-4 w-4" />
//             Go Back
//           </Button>

//           <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//               <FormField
//                 control={form.control}
//                 name="userId"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>User ID</FormLabel>
//                     <FormControl>
//                       <Input
//                         type="email"
//                         placeholder="Enter your User ID"
//                         {...field}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {errors.root && (
//                 <p className="text-sm font-medium text-destructive text-center">
//                   {errors.root.message}
//                 </p>
//               )}

//               <Button type="submit" className="w-full bg-destructive hover:bg-destructive/90" disabled={isSubmitting}>
//                 {/* --- REMOVED: Loader2 spinner --- */}
//                 {isSubmitting ? "Resetting..." : "Reset Password"} 
//               </Button>
//             </form>
//           </Form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };