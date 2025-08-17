import "./deleteDropzone.css";

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
      className={
        "pointer-events-none sticky bottom-0 w-full px-6 pb-6 transition-opacity duration-200 " +
        (isDragging ? "opacity-100" : "opacity-0")
      }
    >
      <div
        className={
          "pointer-events-none sticky bottom-0 w-full px-6 pb-6 transition-opacity duration-200 " +
          (isDragging ? "opacity-100" : "opacity-0")
        }
      >
        <div
          className={
            "pointer-events-auto mx-auto max-w-xl rounded-2xl shadow-lg border flex items-center justify-center py-3 " +
            (isOverTrash
              ? "bg-red-600 text-white border-red-700"
              : "bg-white text-gray-800 border-gray-200")
          }
          style={{
            opacity: isDragging ? 1 : 0.5,
            transition: "opacity 0.2s ease",
          }}
        >
          <div
            className={
              "pointer-events-auto mx-auto max-w-xl rounded-2xl shadow-lg border flex items-center justify-center py-3 " +
              (isOverTrash
                ? "bg-red-600 text-white border-red-700"
                : "bg-white text-gray-800 border-gray-200")
            }
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
      </div>
    </div>
  );
};
