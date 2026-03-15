import { UploadCloud, FileText } from "lucide-react";
import { useCallback, useState } from "react";

interface UploadZoneProps {
  file: File | null;
  onFileSelect: (file: File) => void;
}

const UploadZone = ({ file, onFileSelect }: UploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile?.type === "application/pdf") {
        onFileSelect(droppedFile);
      }
    },
    [onFileSelect]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) onFileSelect(selected);
  };

  if (file) {
    return (
      <div className="flex items-center gap-3 p-3 bg-surface rounded-lg border border-border">
        <FileText className="text-primary w-5 h-5 shrink-0" />
        <div className="overflow-hidden">
          <p className="text-sm font-medium truncate">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {(file.size / 1024).toFixed(1)} KB
          </p>
        </div>
      </div>
    );
  }

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all group ${
        isDragging
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50 hover:bg-primary/5"
      }`}
    >
      <UploadCloud
        className={`w-8 h-8 mb-2 transition-colors ${
          isDragging ? "text-primary" : "text-muted-foreground group-hover:text-primary"
        }`}
      />
      <span className="text-sm font-medium text-muted-foreground">
        Kéo thả hoặc nhấn để tải PDF
      </span>
      <input
        type="file"
        className="hidden"
        onChange={handleChange}
        accept=".pdf"
      />
    </label>
  );
};

export default UploadZone;
