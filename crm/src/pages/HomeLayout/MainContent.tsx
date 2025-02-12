import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ChevronRight, Plus, X } from "lucide-react";
import { useState } from "react";

export const MainContent = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).id === "overlay") {
      setIsOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full relative pt-2">
      <Input type="text" className="focus:border-none rounded-lg" placeholder="Search Names, Company, Project, etc..." />
      <h3 className="text-lg font-semibold text-center dark:text-white">Welcome, Siva!</h3>
      <div className="p-6 border-2 border-muted flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold dark:text-white">Today</p>
          <strong className="text-destructive">11 Feb</strong>
        </div>
        <div className="flex flex-col gap-4 max-sm:text-sm text-muted-foreground">
          {Array.from({ length: 3 }, (_, i) => (
            <>
              <div key={i} className="h-8 flex items-center justify-between">
                Task
                <ChevronRight />
              </div>
              {i !== 2 && <Separator />}
            </>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-white">
        {Array.from({ length: 4 }, (_, i) => (
          <div className="h-20 bg-destructive rounded-lg p-4 flex flex-col items-center justify-center" key={i}>
            <p>Card</p>
            <p>3832</p>
          </div>
        ))}
      </div>

      {/* Overlay for Blur Effect */}
      {isOpen && (
        <div
          id="overlay"
          className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-[1px] transition-opacity duration-300"
          onClick={handleClose}
        />
      )}

      <div className="fixed bottom-24 right-6 flex flex-col items-end gap-4">
        {isOpen && (
          <div
            className="p-4 bg-destructive text-white shadow-lg rounded-lg flex flex-col gap-2 relative z-10"
            style={{ transition: "opacity 0.3s ease-in-out" }}
          >
            <button>New Contact</button>
            <Separator />
            <button>New Company</button>
            <Separator />
            <button>New Project</button>
            <Separator />
            <button>New Task</button>
          </div>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-3 bg-destructive text-white rounded-full shadow-lg flex items-center justify-center transition-transform duration-300 relative z-10 ${
            isOpen ? "rotate-90" : "rotate-0"
          }`}
        >
          {isOpen ? <X size={24} /> : <Plus size={24} />}
        </button>
      </div>
    </div>
  );
};
