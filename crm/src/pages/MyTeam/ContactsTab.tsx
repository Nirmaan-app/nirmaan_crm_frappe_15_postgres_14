// src/pages/MyTeam/ContactsTab.tsx

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate ,formatDateWithOrdinal} from "@/utils/FormatDate";
import { Link } from "react-router-dom";
import { contactClick,companyClick } from "@/utils/LinkNavigate";

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
                        <TableHead>Update Date</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {contacts.length > 0 ? contacts.map(contact => (
                        <TableRow key={contact.name}>
                            <TableCell>
                                <Link to={contactClick(contact.name)} className="text-red-600 underline font-medium">
                                    {contact.first_name} {contact.last_name}
                                </Link>
                            </TableCell>
                            <TableCell>
                                <Link to={companyClick(contact.company)} className="text-red-600 underline">
                                    {contact["company.company_name"] || contact.company}
                                </Link>
                            </TableCell>
                            <TableCell>{contact.mobile || 'N/A'}</TableCell>
                            <TableCell>{formatDateWithOrdinal(contact.creation)}</TableCell>

                            <TableCell className="text-red-600  font-medium cursor-pointer">
                               {formatDateWithOrdinal(contact.last_meeting)||'--'}
                            </TableCell>

                            <TableCell>{formatDateWithOrdinal(contact.modified)}</TableCell>
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