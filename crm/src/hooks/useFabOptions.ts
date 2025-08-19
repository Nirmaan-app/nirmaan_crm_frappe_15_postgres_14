// src/hooks/useFabOptions.ts
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDialogStore } from '@/store/dialogStore';

export interface FabOption {
    label: string;
    action: () => void;
}

export const useFabOptions = () => {
    const location = useLocation();
    const [options, setOptions] = useState<FabOption[]>([]);
    const {
        openNewCompanyDialog,
        openNewContactDialog,
        openNewBoqDialog,
        openNewTaskDialog
    } = useDialogStore();

    useEffect(() => {
        const { pathname, search } = location;
        const params = new URLSearchParams(search);
        const id = params.get('id');
        let newOptions: FabOption[] = [];

        if (pathname.startsWith('/companies/company') && id) {
            newOptions = [
                { label: "Add New BOQ", action: () => openNewBoqDialog({ companyId: id }) },
                { label: "Add New Contact", action: () => openNewContactDialog({ companyId: id }) },
                { label: "Add New Task", action: () => openNewTaskDialog({ companyId: id }) }
            ];
        } else if (pathname.startsWith('/contacts/contact') && id) {
            newOptions = [
                { label: "Add New Task", action: () => openNewTaskDialog({ contactId: id }) },
                { label: "Add New BOQ", action: () => openNewBoqDialog({ contactId: id }) }
            ];
        } else if (pathname.startsWith('/boqs/boq') && id) {
            newOptions = [
                { label: "Add Follow-up Task", action: () => openNewTaskDialog({ boqId: id }) }
            ];
        } else if (pathname.startsWith('/companies')) {
            newOptions = [{ label: "Add New Company", action: openNewCompanyDialog }];
        } else if (pathname.startsWith('/contacts')) {
            newOptions = [{ label: "Add New Contact", action: openNewContactDialog }];
        } else if (pathname.startsWith('/boqs')) {
            newOptions = [{ label: "Add New BOQ", action: openNewBoqDialog }];
        } else if (pathname.startsWith('/tasks')) {
            newOptions = [{ label: "Add New Task", action: openNewTaskDialog }];
        } else if (pathname === '/') {
            newOptions = [
                { label: "Add New Company", action: openNewCompanyDialog },
                { label: "Add New Contact", action: openNewContactDialog },
                { label: "Add New BOQ", action: openNewBoqDialog },
                { label: "Add New Task", action: openNewTaskDialog },
            ];
        }

        setOptions(newOptions);
    }, [location, openNewCompanyDialog, openNewContactDialog, openNewBoqDialog, openNewTaskDialog]);

    return options;
};