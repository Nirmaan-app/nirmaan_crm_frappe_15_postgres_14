// src/hooks/usePageHeader.ts
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const getPageTitle = (pathname: string): string => {
    if (pathname.startsWith('/companies/company')) return 'Company Details';
    if (pathname.startsWith('/contacts/contact')) return 'Contact Details';
    if (pathname.startsWith('/boqs/boq')) return 'BOQ Details';
    if (pathname.startsWith('/tasks/task')) return 'Task Details';
    if (pathname.startsWith('/companies')) return 'Companies';
    if (pathname.startsWith('/contacts')) return 'Contacts';
    if (pathname.startsWith('/boqs')) return 'BOQs';
    if (pathname.startsWith('/tasks')) return 'Tasks';
    if (pathname.startsWith('/calendar')) return 'Calendar';
    if (pathname.startsWith('/settings')) return 'Settings';
     if (pathname.startsWith('/team')) return 'Team';
    return 'Home';
};

export const usePageHeader = () => {
    const location = useLocation();
    const [title, setTitle] = useState('');
    const [showBackButton, setShowBackButton] = useState(false);

    useEffect(() => {
        const { pathname } = location;
        setTitle(getPageTitle(pathname));
        const mainRoutes = ['/', '/companies', '/contacts', '/boqs', '/tasks', '/settings','/team'];
        setShowBackButton(!mainRoutes.includes(pathname));
    }, [location]);

    return { title, showBackButton };
};