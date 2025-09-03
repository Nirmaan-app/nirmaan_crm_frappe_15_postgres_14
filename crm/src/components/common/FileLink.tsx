// You can place this component in a file like `src/components/common/FileLink.tsx`

import React from 'react';
import { LinkIcon } from 'lucide-react'; // For a nice visual cue

interface FileLinkProps {
    /** The full URL of the file from Frappe, e.g., /private/files/....png */
    href?: string | null;
    /** The text to display for the link, e.g., "View Visiting Card" */
    label?: string;
}

export const FileLink = ({ href, label = "View File" }: FileLinkProps) => {

    // 1. Check if the href exists.
    if (!href) {
        // If there's no URL, render a disabled-looking text.
        return <span className="font-semibold text-gray-500 cursor-not-allowed">Not available</span>;
    }

    const frappePort = import.meta.env.VITE_BASE_NAME;
    const portSegment = frappePort ? `` : `:${8001}`;
    console.log("protocol",window.location.protocol)
    console.log("hostname",window.location.hostname)
    console.log("portSegment",portSegment)
    console.log("href",href)
    const fullUrl = `${window.location.protocol}//${window.location.hostname}${portSegment}${href}`;
console.log("fullUrl",fullUrl)
    return (
        // 3. Use a standard <a> tag.
        <a
            href={fullUrl}
            target="_blank" // This is the crucial attribute to open in a new tab.
            rel="noopener noreferrer" // Security best practice for opening new tabs.
            className="font-semibold text-sm text-blue-600 underline hover:text-blue-800 inline-flex items-center gap-1.5"
        >
            <LinkIcon className="w-3 h-3" />
            <span>{label}</span>
        </a>
    );
};