import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { Loader2 } from 'lucide-react'; // Assuming you use lucide-react with shadcn

export const ProtectedRoute = () => {
    const { currentUser, isLoading } = useAuth();

    if (isLoading) {
        // A full-page spinner provides better UX than a simple text message.
        return (
            <div className="flex items-center justify-center h-screen w-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!currentUser || currentUser === 'Guest') {
        // The `replace` prop is important to prevent breaking the browser's back button.
        return <Navigate to="/login" replace />;
    }

    // If authenticated, render the nested routes.
    return <Outlet />;
};