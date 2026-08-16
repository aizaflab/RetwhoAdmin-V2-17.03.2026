import { DeleteIcon, LoaderIcon } from "@/components/icons/Icons";
import { Button } from "../button/Button";

export interface DeleteModalProps<T = unknown> {
  title: string;
  text: string;
  deleteModal: boolean;
  setDeleteModal: (open: boolean) => void;
  selectedRow: T;
  handleDelete: (row: T) => void;
  isLoading?: boolean;
}

export default function DeleteModal<T = unknown>({
  title,
  text,
  deleteModal,
  setDeleteModal,
  selectedRow,
  handleDelete,
  isLoading,
}: DeleteModalProps<T>) {
  return (
    <div
      onClick={() => setDeleteModal(false)}
      className={`h-screen w-screen fixed top-0 left-0 z-1000 bg-black/50 backdrop-blur-xs transition-opacity duration-300 ani3 ${
        deleteModal
          ? "opacity-100 visible"
          : "opacity-0 invisible pointer-events-none"
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`sm:w-96 w-[94%] bg-card p-5 rounded-xl border border-border absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 flex-col center py-8 ${
          deleteModal
            ? "opacity-100 visible scale-100"
            : "opacity-0 invisible scale-95"
        }`}
      >
        <div className="size-[4.8rem] rounded-full bg-destructive/20 center mb-5">
          <DeleteIcon className="size-9 text-destructive" />
        </div>

        <h3 className="text-lg font-medium text-center text-foreground">
          {title}
        </h3>

        <p className="sm:px-5 text-muted-foreground text-sm text-center mt-2 mb-6">
          {text}
        </p>

        <div className="flex justify-end gap-3">
          <Button
            onClick={() => setDeleteModal(false)}
            variant="outline"
            disabled={isLoading}
          >
            No, Keep It!
          </Button>

          <Button
            onClick={() => handleDelete(selectedRow)}
            disabled={isLoading}
            variant="destructive"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <LoaderIcon />
                Deleting...
              </span>
            ) : (
              "Yes, Delete It!"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
