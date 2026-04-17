import { cn } from "@/lib/utils";
import { RefreshCw, Check, Save } from "lucide-react";

export function SaveButton({
  status,
  onClick,
}: {
  status: "idle" | "saving" | "saved";
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={status === "saving"}
      className={cn(
        "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer shadow-sm",
        status === "saved"
          ? "bg-emerald-500 text-white shadow-emerald-500/30"
          : "bg-primary text-white hover:bg-primary/90 shadow-primary/20",
      )}
    >
      {status === "saving" ? (
        <>
          <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
        </>
      ) : status === "saved" ? (
        <>
          <Check className="w-4 h-4" /> Saved!
        </>
      ) : (
        <>
          <Save className="w-4 h-4" /> Save Changes
        </>
      )}
    </button>
  );
}
