import { motion } from "framer-motion";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Question {
  id: number;
  q: string;
  a: string;
}

interface AnswerKeyModalProps {
  questions: Question[];
  onClose: () => void;
}

const AnswerKeyModal = ({ questions, onClose }: AnswerKeyModalProps) => (
  <>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-40"
    />
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card rounded-2xl shadow-2xl z-50 overflow-hidden border border-border"
    >
      <div className="p-5 border-b border-border flex justify-between items-center bg-surface">
        <h2 className="font-bold text-lg">Bảng đáp án chi tiết</h2>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {questions.map((q, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 bg-surface rounded-lg border border-border tabular-nums"
            >
              <span className="font-semibold text-muted-foreground text-sm">
                Câu {i + 1}
              </span>
              <span className="font-bold text-primary">
                {q.a.split(".")[0]}
              </span>
            </div>
          ))}
        </div>
        <Button className="w-full mt-2 gap-2">
          <Download className="w-4 h-4" />
          Tải bảng đáp án (.csv)
        </Button>
      </div>
    </motion.div>
  </>
);

export default AnswerKeyModal;
