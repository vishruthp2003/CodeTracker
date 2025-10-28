import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  label?: string;
  placeholder?: string;
  rows?: number;
  className?: string;
}

const CodeEditor = ({
  value,
  onChange,
  language,
  label,
  placeholder,
  rows = 12,
  className,
}: CodeEditorProps) => {
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || `Write your ${language} solution here...`}
          rows={rows}
          className={cn(
            "font-mono text-sm bg-muted/50 border-border resize-none",
            "focus-visible:ring-primary focus-visible:border-primary",
            "placeholder:text-muted-foreground/50",
            className
          )}
        />
        <div className="absolute top-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
          {language}
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
