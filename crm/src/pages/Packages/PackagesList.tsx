import { useFrappeGetDocList, useFrappeDeleteDoc, useSWRConfig } from "frappe-react-sdk";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { useUserRoleLists } from "@/hooks/useUserRoleLists";
import { PackageDialog } from "./PackageDialog";
import { toast } from "@/hooks/use-toast";

export const PackagesList = () => {
    const { data: packages, isLoading, error } = useFrappeGetDocList("CRM BOQ Package", {
        fields: ["name", "package_name", "assigned_lead"],
        limit: 0
    });

    const { getUserFullNameByEmail } = useUserRoleLists();

    // Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState<any>(null);

    const { deleteDoc, loading: deleting } = useFrappeDeleteDoc();
    const { mutate } = useSWRConfig();

    const handleAdd = () => {
        setEditingPackage(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (pkg: any) => {
        setEditingPackage(pkg);
        setIsDialogOpen(true);
    };

    const handleDelete = async (pkgName: string) => {
        if (!confirm(`Are you sure you want to delete package "${pkgName}"?`)) return;
        try {
            await deleteDoc("CRM BOQ Package", pkgName);
            toast({ title: "Deleted", description: "Package deleted successfully." });
            mutate(key =>
                (typeof key === 'string' && key.includes('CRM BOQ Package')) ||
                (Array.isArray(key) && key[0] === 'CRM BOQ Package')
            );
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    };

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Specialization Management</h2>
                <Button onClick={handleAdd} className="bg-destructive hover:bg-destructive/90 text-white gap-2">
                    <Plus className="h-4 w-4" /> Add Package
                </Button>
            </div>

            <Card className="border shadow-sm rounded-lg overflow-hidden bg-white">
                <div className="grid grid-cols-12 gap-4 p-4 border-b font-semibold text-xs tracking-wider text-muted-foreground bg-gray-50/50 uppercase">
                    <div className="col-span-5">PACKAGE NAME</div>
                    <div className="col-span-5">ASSIGNED LEAD</div>
                    <div className="col-span-2 text-right">ACTIONS</div>
                </div>

                {isLoading && (
                    <div className="p-4 space-y-3">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                )}

                {!isLoading && packages?.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                        No packages found. Click "Add Package" to create one.
                    </div>
                )}

                {!isLoading && packages?.map((pkg) => (
                    <div key={pkg.name} className="grid grid-cols-12 gap-4 p-4 border-b last:border-0 items-center hover:bg-gray-50/50 transition-colors">
                        <div className="col-span-5 font-medium text-sm text-gray-900">
                            {pkg.package_name}
                        </div>
                        <div className="col-span-5 flex items-center">
                            {pkg.assigned_lead ? (
                                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-[4px] text-xs font-semibold flex items-center gap-1.5 border border-blue-100">
                                    <div className="h-3 w-3 bg-blue-600 rounded-sm flex items-center justify-center">
                                        <div className="h-1.5 w-1.5 bg-white rounded-full"></div>
                                    </div>
                                    {getUserFullNameByEmail(pkg.assigned_lead) || pkg.assigned_lead}
                                </span>
                            ) : (
                                <span className="italic opacity-50 text-sm">Not Assigned</span>
                            )}
                        </div>
                        <div className="col-span-2 flex justify-end gap-2 text-gray-400">
                            <button onClick={() => handleEdit(pkg)} className="hover:text-gray-900 p-1.5 transition-colors" disabled={deleting}>
                                <Edit2 className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDelete(pkg.name)} className="hover:text-destructive p-1.5 transition-colors" disabled={deleting}>
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </Card>

            {isDialogOpen && (
                <PackageDialog
                    isOpen={isDialogOpen}
                    onClose={() => setIsDialogOpen(false)}
                    pkg={editingPackage}
                />
            )}
        </div>
    );
};
