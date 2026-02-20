import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";

interface DeleteDropzoneProps {
  isDragging: boolean;
  isOverTrash: boolean;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnter: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
}

export const DeleteDropzone: React.FC<DeleteDropzoneProps> = ({
  isDragging,
  isOverTrash,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
}) => {
  return (
    <div
      aria-hidden={!isDragging}
      className={cn(
        "pointer-events-none fixed bottom-6 left-0 right-0 px-6 transition-all duration-200 ease-in-out z-50",
        isDragging ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      )}
    >
      <div
        className={cn(
          "pointer-events-auto mx-auto flex max-w-xl items-center justify-center gap-2 rounded-lg border py-3 px-6 text-sm font-medium transition-all duration-150",
          isOverTrash
            ? "border-destructive bg-destructive text-destructive-foreground shadow-lg shadow-destructive/20"
            : "border-border bg-card text-muted-foreground"
        )}
        onDragOver={onDragOver}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        role="button"
        aria-label="Delete area"
      >
        <Trash2 className="h-4 w-4" />
        {isOverTrash ? "Release to delete" : "Drag here to delete"}
      </div>
    </div>
  );
};
