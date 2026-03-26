import { DeleteIcon, LoaderIcon } from "@/components/icons/Icons";

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
      className={`h-screen w-screen fixed top-0 left-0 z-1000 bg-black/30 backdrop-blur-xs transition-opacity duration-300 ani3 ${
        deleteModal
          ? "opacity-100 visible"
          : "opacity-0 invisible pointer-events-none"
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`sm:w-96 w-[94%] bg-white dark:bg-darkPrimary p-5 rounded-2xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 flex-col center py-8 ${
          deleteModal
            ? "opacity-100 visible scale-100"
            : "opacity-0 invisible scale-95"
        }`}
      >
        <div className="size-[4.8rem] rounded-full bg-[#FFE7E7] dark:bg-[#ad0e0e42] center mb-5">
          <DeleteIcon className="size-9 text-[#FF0000]" />
        </div>

        <h3 className="text-lg font-medium text-center">{title}</h3>

        <p className="sm:px-5 text-[#989898] text-sm text-center mt-2 mb-6">
          {text}
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => setDeleteModal(false)}
            className="px-4 py-2 text-sm rounded-md bg-[#F6F6F6] text-[#1A1A1A] hover:bg-gray-200 font-medium cursor-pointer"
          >
            No, Keep It!
          </button>

          <button
            onClick={() => handleDelete(selectedRow)}
            disabled={isLoading}
            className="px-4 py-2 text-sm rounded-md bg-[#FF0000] text-white hover:bg-red-700 font-medium disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <LoaderIcon />
                Deleting...
              </span>
            ) : (
              "Yes, Delete It!"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
