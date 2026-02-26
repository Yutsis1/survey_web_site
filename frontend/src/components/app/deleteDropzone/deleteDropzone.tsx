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
  // Outer container is fixed and pointer-events-none so it never blocks the page when hidden.
  // The inner card has pointer-events-auto and handles drag events only when visible.
  return (
    <div
      aria-hidden={!isDragging}
      className={
        "delete-dropzone-outer pointer-events-none fixed left-0 right-0 bottom-6 px-6 transition-transform duration-200 ease-in-out " +
        (isDragging ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0")
      }
    >
    <div
      className={
        "delete-dropzone-card pointer-events-auto mx-auto max-w-xl rounded-2xl shadow-lg border flex items-center justify-center py-4 backdrop-blur-md"
      }
      style={{
        backgroundColor: isOverTrash ? "rgba(239, 68, 68, 0.22)" : "rgba(17, 17, 17, 0.85)",
        color: isOverTrash ? "#fee2e2" : "#a1a1aa",
        borderColor: isOverTrash ? "rgba(239, 68, 68, 0.9)" : "rgba(38, 38, 38, 1)",
        boxShadow: isOverTrash ? "0 0 30px rgba(239,68,68,0.35)" : "0 0 0 1px rgba(38,38,38,0.8)",
      }}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      role="button"
      aria-label="Delete area"
    >
      {isOverTrash ? "Release to delete" : "Drag here to delete"}
    </div>
    </div>
  );
};
