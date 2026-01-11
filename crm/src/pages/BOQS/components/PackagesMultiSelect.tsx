import { useState } from "react";
import ReactSelect, { MultiValue, ActionMeta } from "react-select";
import { BOQ_PACKAGE_OPTIONS } from "@/constants/boqPackages";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PackageOption {
  label: string;
  value: string;
}

// Special "Others" option that triggers the dialog
const OTHERS_OPTION: PackageOption = {
  value: "__others__",
  label: "Others (Add Custom)",
};

interface PackagesMultiSelectProps {
  value: string[];
  onChange: (packages: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function PackagesMultiSelect({
  value,
  onChange,
  placeholder = "Select packages...",
  disabled = false,
}: PackagesMultiSelectProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [customInput, setCustomInput] = useState("");

  // Convert string array to react-select format
  const selectedOptions: PackageOption[] = value.map((v) => ({
    value: v,
    label: v,
  }));

  // Build options: predefined + any existing custom values + "Others" at the end
  const allOptions: PackageOption[] = [
    ...BOQ_PACKAGE_OPTIONS,
    // Add custom values that are already selected but not in predefined options
    ...value
      .filter((v) => !BOQ_PACKAGE_OPTIONS.some((opt) => opt.value === v))
      .map((v) => ({ value: v, label: v })),
    // "Others" option at the end
    OTHERS_OPTION,
  ];

  const handleChange = (
    newValue: MultiValue<PackageOption>,
    actionMeta: ActionMeta<PackageOption>
  ) => {
    // Check if "Others" was just selected
    if (
      actionMeta.action === "select-option" &&
      actionMeta.option?.value === OTHERS_OPTION.value
    ) {
      // Open dialog instead of adding "Others" to selection
      setIsDialogOpen(true);
      return;
    }

    // Filter out "Others" from selected values (should never be in there, but just in case)
    const filteredValues = newValue
      .filter((opt) => opt.value !== OTHERS_OPTION.value)
      .map((opt) => opt.value);

    onChange(filteredValues);
  };

  const handleAddCustomPackage = () => {
    const trimmed = customInput.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setCustomInput("");
    setIsDialogOpen(false);
  };

  const handleDialogClose = () => {
    setCustomInput("");
    setIsDialogOpen(false);
  };

  return (
    <>
      <ReactSelect<PackageOption, true>
        isMulti
        isDisabled={disabled}
        options={allOptions}
        value={selectedOptions}
        onChange={handleChange}
        placeholder={placeholder}
        className="text-sm"
        closeMenuOnSelect={false}
        classNames={{
          control: () =>
            "min-h-10 border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          menu: () => "bg-popover text-popover-foreground border shadow-md z-50",
          option: ({ isFocused, isSelected, data }) =>
            `px-2 py-1.5 text-sm outline-none cursor-default select-none ${
              data.value === OTHERS_OPTION.value
                ? "border-t border-border text-primary font-medium"
                : isSelected
                  ? "bg-accent text-accent-foreground"
                  : isFocused
                    ? "bg-accent text-accent-foreground"
                    : ""
            }`,
        }}
        styles={{
          control: (base) => ({
            ...base,
            backgroundColor: "var(--background)",
            borderColor: "hsl(var(--input))",
            color: "var(--foreground)",
          }),
          singleValue: (base) => ({
            ...base,
            color: "var(--foreground)",
          }),
          multiValue: (base) => ({
            ...base,
            backgroundColor: "hsl(var(--muted))",
          }),
          multiValueLabel: (base) => ({
            ...base,
            color: "hsl(var(--muted-foreground))",
          }),
          multiValueRemove: (base) => ({
            ...base,
            color: "hsl(var(--muted-foreground))",
            ":hover": {
              backgroundColor: "hsl(var(--destructive))",
              color: "hsl(var(--destructive-foreground))",
            },
          }),
          menu: (base) => ({
            ...base,
            zIndex: 50,
          }),
          input: (base) => ({
            ...base,
            color: "var(--foreground)",
          }),
        }}
      />

      {/* Custom Package Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Custom Package</DialogTitle>
            <DialogDescription>
              Enter a custom package name that's not in the predefined list.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="custom-package">Package Name</Label>
              <Input
                id="custom-package"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="e.g. Fire Suppression"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && customInput.trim()) {
                    e.preventDefault();
                    handleAddCustomPackage();
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleDialogClose}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAddCustomPackage}
              disabled={!customInput.trim()}
            >
              Add Package
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
