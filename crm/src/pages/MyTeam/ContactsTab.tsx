// src/pages/MyTeam/ContactsTab.tsx

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/utils/FormatDate";
import { Link } from "react-router-dom";

export const ContactsTab = ({ contacts }) => {
    return (
        <div className="bg-background rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Date Added</TableHead>
                        <TableHead>Last Task</TableHead>
                        <TableHead>L/T Date</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {contacts.length > 0 ? contacts.map(contact => (
                        <TableRow key={contact.name}>
                            <TableCell>
                                <Link to={`/contacts/contact?id=${contact.name}`} className="text-red-600 underline font-medium">
                                    {contact.first_name} {contact.last_name}
                                </Link>
                            </TableCell>
                            <TableCell>
                                <Link to={`/companies/company?id=${contact.company}`} className="text-red-600 underline">
                                    {contact["company.company_name"] || contact.company}
                                </Link>
                            </TableCell>
                            <TableCell>{contact.mobile || 'N/A'}</TableCell>
                            <TableCell>{formatDate(contact.creation)}</TableCell>
                            <TableCell className="text-red-600 underline font-medium cursor-pointer">
                                {/* This is mocked as per the UI. Real data would require a more complex query. */}
                                {Math.random() > 0.5 ? 'Meeting' : 'Call'}
                            </TableCell>
                            <TableCell>{formatDate(contact.modified)}</TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center h-24">No contacts found for this user.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};