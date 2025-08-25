// src/auth/RealTimeProvider.tsx

import { useFrappeDocTypeEventListener, useSWRConfig } from 'frappe-react-sdk';
import { useAuth } from './AuthProvider';
import { useCallback } from 'react';

const DOCTYPES_TO_LISTEN = [
    'CRM Task', 'CRM Company', 'CRM Contacts', 'CRM BOQ', 'CRM Note',
];

export const RealTimeProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const { mutate } = useSWRConfig();

    const handleEvent = useCallback((event) => {
        console.log(`[Real-Time Event Received]`, event);

        // --- THIS IS THE CRITICAL FIX ---
        // Instead of a simple string, we pass a function to mutate.
        // This function will be called for every single key in the SWR cache.
        // It should return `true` if the key should be revalidated.
        mutate(
            (key) => Array.isArray(key) && key[0] === event.doctype,
            undefined, // We pass `undefined` for the data to trigger a refetch
            { revalidate: true } // Explicitly tell SWR to revalidate
        );

        // We still mutate the specific doc key for detail pages
        mutate(`${event.doctype}/${event.docname}`);
        
    }, [mutate]);

    // Use the hook for each doctype at the top level
    useFrappeDocTypeEventListener('CRM Task', handleEvent, { enabled: !!currentUser && currentUser !== 'Guest' });
    useFrappeDocTypeEventListener('CRM Company', handleEvent, { enabled: !!currentUser && currentUser !== 'Guest' });
    useFrappeDocTypeEventListener('CRM Contacts', handleEvent, { enabled: !!currentUser && currentUser !== 'Guest' });
    useFrappeDocTypeEventListener('CRM BOQ', handleEvent, { enabled: !!currentUser && currentUser !== 'Guest' });
    useFrappeDocTypeEventListener('CRM Note', handleEvent, { enabled: !!currentUser && currentUser !== 'Guest' });

    return <>{children}</>;
};