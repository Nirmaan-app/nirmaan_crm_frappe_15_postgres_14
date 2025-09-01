// src/pages/Home/HomeHeader.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const HomeHeader = () => {
    const navigate = useNavigate();
    const fullName = localStorage.getItem('fullName');

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-xl md:text-2xl font-bold">Welcome, {fullName}!</h1>
                <Button 
                    variant="outline" 
                    className="border-destructive text-destructive hover:bg-destructive/5 hover:text-destructive" 
                    onClick={() => navigate('/calendar')}
                >
                    <Calendar className="w-4 h-4 mr-2" />
                    Calendar
                </Button>
            </div>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Search Names, Company, Project, etc..." className="pl-10 h-12" />
            </div>
        </div>
    );
};