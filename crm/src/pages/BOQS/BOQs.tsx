// src/pages/BOQS/BOQs.tsx
import { useViewport } from "@/hooks/useViewPort";
import { BoqList } from "./BoqList";
import { BOQ } from "./BOQ";
import { useStateSyncedWithParams } from "@/hooks/useSearchParamsManager";
import { useDialogStore } from "@/store/dialogStore";
import { Plus } from "lucide-react";

const DesktopPlaceholder = () => (
    <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-secondary">
        <span className="text-muted-foreground">Please select a BOQ from the list</span>
    </div>
);

export const BOQs = () => {
    const { isMobile } = useViewport();
    const [id, setId] = useStateSyncedWithParams<string>("id", "");
    const { openNewBoqDialog } = useDialogStore();

    if (isMobile) {
        return <BoqList />;
    }

    return (
        <div className="grid grid-cols-[400px,1fr] gap-6 h-[calc(100vh-var(--navbar-height)-80px)]">
            {/* Master Panel (Left) */}
            <div className="bg-background rounded-lg border p-4 flex flex-col">
                <h2 className="text-lg font-semibold mb-4">BOQs</h2>
                <BoqList
                    onBoqSelect={setId}
                    activeBoqId={id}
                />
                <div className="mt-4">
                    <button onClick={openNewBoqDialog} className="w-full h-12 bg-destructive text-white rounded-lg flex items-center justify-center gap-2">
                        <Plus size={20} /> Add New BOQ
                    </button>
                </div>
            </div>

            {/* Detail Panel (Right) */}
            <div className="overflow-y-auto">
                {id ? <BOQ /> : <DesktopPlaceholder />}
            </div>
        </div>
    );
};