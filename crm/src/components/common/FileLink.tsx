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

    // 2. Construct the full, absolute URL.
    // We get the base URL from the current window's location.
    const fullUrl = `${window.location.protocol}//${window.location.hostname}:${8001}${href}`;
console.log(fullUrl)
    return (
        // 3. Use a standard <a> tag.
        <a
            href={fullUrl}
            target="_blank" // This is the crucial attribute to open in a new tab.
            rel="noopener noreferrer" // Security best practice for opening new tabs.
            className="font-semibold text-blue-600 underline hover:text-blue-800 inline-flex items-center gap-1.5"
        >
            <LinkIcon className="w-4 h-4" />
            <span>{label}</span>
        </a>
    );
};