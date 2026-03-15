import { useState, useCallback, useRef } from "react";

import {
  Sparkles,
  FileText,
  Download,
  Loader2,
  ListChecks,
  Copy,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import UploadZone from "@/components/UploadZone";
import SkeletonRow from "@/components/SkeletonRow";
import AnswerKeyModal from "@/components/AnswerKeyModal";

const MOCK_ORIGINAL = [
  { 
    id: 1, 
    q: "Câu 1: Đạo hàm của hàm số y = sin(x) là gì?", 
    a: "A. cos(x)",
    explanation: "Đạo hàm của hàm lượng giác cơ bản: (sin x)' = cos x."
  },
  { 
    id: 2, 
    q: "Câu 2: Chiến dịch Điện Biên Phủ kết thúc vào năm nào?", 
    a: "B. 1954",
    explanation: "Chiến dịch Điện Biên Phủ kết thúc thắng lợi vào ngày 7/5/1954."
  },
  { 
    id: 3, 
    q: "Câu 3: Nguyên tố hóa học nào có ký hiệu là 'Fe'?", 
    a: "C. Sắt",
    explanation: "'Fe' là ký hiệu của sắt (Ferrum) trong bảng tuần hoàn."
  },
  { 
    id: 4, 
    q: "Câu 4: Tác phẩm 'Truyện Kiều' do ai sáng tác?", 
    a: "A. Nguyễn Du",
    explanation: "Truyện Kiều (Đoạn trường tân thanh) là kiệt tác của Đại thi hào Nguyễn Du."
  },
  { 
    id: 5, 
    q: "Câu 5: Sông nào dài nhất Việt Nam?", 
    a: "D. Sông Mê Kông",
    explanation: "Sông Mê Kông là con sông dài nhất chảy qua lãnh thổ Việt Nam (tính tổng chiều dài)."
  },
];

const MOCK_VARIATION = [
  { 
    id: 1, 
    q: "Câu 1: Tính đạo hàm bậc nhất của hàm số f(x) = sin(x).", 
    a: "A. cos(x)",
    explanation: "Công thức đạo hàm cơ bản cho hàm số lượng giác: f'(x) = d/dx(sin x) = cos x."
  },
  { 
    id: 2, 
    q: "Câu 2: Xác định mốc thời gian kết thúc thắng lợi của chiến dịch Điện Biên Phủ.", 
    a: "C. Năm 1954",
    explanation: "Ngày 7 tháng 5 năm 1954, lá cờ 'Quyết chiến Quyết thắng' của quân đội ta tung bay trên nóc hầm Đờ-cát."
  },
  { 
    id: 3, 
    q: "Câu 3: Ký hiệu 'Fe' trong bảng tuần hoàn đại diện cho nguyên tố nào?", 
    a: "B. Sắt",
    explanation: "Ký hiệu hóa học Fe bắt nguồn từ tiếng Latin 'Ferrum', nghĩa là sắt."
  },
  { 
    id: 4, 
    q: "Câu 4: Ai là tác giả của kiệt tác văn học 'Truyện Kiều'?", 
    a: "D. Nguyễn Du",
    explanation: "Nguyễn Du là tác giả của Truyện Kiều, tập thơ được coi là đỉnh cao của tiếng Việt văn học."
  },
  { 
    id: 5, 
    q: "Câu 5: Xác định con sông có chiều dài lớn nhất chảy qua lãnh thổ Việt Nam.", 
    a: "A. Sông Mê Kông",
    explanation: "Sông Mê Kông có tổng chiều dài hơn 4.300 km, là con sông dài nhất trong danh sách các sông chảy qua VN."
  },
];

type Status = "idle" | "uploaded" | "processing" | "completed";

interface HeaderInfo {
  centerName: string;
  subTitle: string;
  examName: string;
  subjectAndTime: string;
  testVersion: string;
}

const ExamHeader = ({ info }: { info: HeaderInfo }) => (
  <div className="mb-6 border-b pb-4">
    <div className="flex justify-between items-baseline mb-3">
      <span className="text-sm font-medium text-blue-600/80 border-b border-blue-600/30 pb-0.5">
        {info.centerName} – {info.subTitle}
      </span>
    </div>
    <div className="space-y-1">
      <h1 className="font-bold text-lg leading-tight">{info.examName}</h1>
      <p className="font-bold text-sm tracking-wide">{info.subjectAndTime}</p>
      <p className="font-bold text-xl text-orange-500 mt-2">{info.testVersion}</p>
    </div>
  </div>
);

const ExamFooter = ({ info }: { info: HeaderInfo }) => (
  <div className="mt-8 pt-4 border-t border-blue-600/30 flex justify-between items-center text-sm font-medium text-blue-600/80">
    <span>{info.centerName}</span>
    <span>Trang 1</span>
  </div>
);

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [showAnswers, setShowAnswers] = useState(false);
  const [showExplanations, setShowExplanations] = useState(false);
  const [progress, setProgress] = useState(0);
  const [headerInfo, setHeaderInfo] = useState<HeaderInfo>({
    centerName: "Luyện thi Cao Trí",
    subTitle: "Đề vật lý số 03",
    examName: "KÌ THI ĐÁNH GIÁ NĂNG LỰC ĐẦU VÀO ĐẠI HỌC V-SAT",
    subjectAndTime: "MÔN: VẬT LÍ – THỜI GIAN: 60 PHÚT",
    testVersion: "ĐỀ THAM KHẢO SỐ 03"
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleFileSelect = useCallback((f: File) => {
    setFile(f);
    setStatus("uploaded");
  }, []);

  const generateVariation = useCallback(() => {
    if (status === "processing") return;
    setStatus("processing");
    setProgress(0);
    let p = 0;
    intervalRef.current = setInterval(() => {
      p += 4;
      setProgress(Math.min(p, 100));
      if (p >= 100) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setStatus("completed");
      }
    }, 80);
  }, [status]);

  return (
    <div className="min-h-screen bg-surface">
      {/* Navigation */}
      <nav className="h-14 border-b border-border bg-card flex items-center justify-between px-6 sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <span className="font-bold text-lg tracking-tight">Hinta</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            Hướng dẫn
          </Button>
          <div className="w-8 h-8 rounded-full bg-muted border border-border" />
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto p-4 md:p-6 space-y-5">
        {/* Top Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="bg-card p-4 rounded-xl border border-border flex-1 min-w-0">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              Quản lý tệp
            </h3>
            <UploadZone file={file} onFileSelect={handleFileSelect} />
          </div>

          <div className="bg-card p-4 rounded-xl border border-border flex flex-col gap-2 md:w-64 w-full">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
              Công cụ AI
            </h3>
            <Button
              className="w-full"
              onClick={generateVariation}
              disabled={!file || status === "processing"}
            >
              {status === "processing" ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Tạo đề phiên bản mới
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowExplanations(!showExplanations)}
              disabled={status !== "completed"}
            >
              {showExplanations ? "Ẩn hướng dẫn đáp án" : "Tạo hướng dẫn đáp án"}
            </Button>
          </div>

          <div className="bg-card p-4 rounded-xl border border-border flex flex-col gap-3 flex-1">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
              Thông tin tiêu đề đề thi
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground uppercase">Tên trung tâm / Đơn vị</Label>
                <Input 
                  value={headerInfo.centerName} 
                  onChange={(e) => setHeaderInfo({...headerInfo, centerName: e.target.value})}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground uppercase">Phụ đề (Số đề...)</Label>
                <Input 
                  value={headerInfo.subTitle} 
                  onChange={(e) => setHeaderInfo({...headerInfo, subTitle: e.target.value})}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground uppercase">Tên kỳ thi</Label>
                <Input 
                  value={headerInfo.examName} 
                  onChange={(e) => setHeaderInfo({...headerInfo, examName: e.target.value})}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground uppercase">Môn & Thời gian</Label>
                <Input 
                  value={headerInfo.subjectAndTime} 
                  onChange={(e) => setHeaderInfo({...headerInfo, subjectAndTime: e.target.value})}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground uppercase">Phiên bản đề</Label>
                <Input 
                  value={headerInfo.testVersion} 
                  onChange={(e) => setHeaderInfo({...headerInfo, testVersion: e.target.value})}
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {status === "processing" && (
          <div className="bg-card p-4 rounded-xl border border-primary/20">
            <div className="flex justify-between mb-2 text-sm font-medium">
              <span className="text-primary">Đang phân tích và tạo biến thể...</span>
              <span className="tabular-nums text-muted-foreground">{progress}%</span>
            </div>
            <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
              <motion.div
                className="bg-primary h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "linear", duration: 0.08 }}
              />
            </div>
          </div>
        )}

        {/* Dual Pane */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:h-[calc(100vh-280px)]">
            {/* Left: Original */}
            <div className="bg-card rounded-xl border border-border overflow-hidden flex flex-col min-h-[400px]">
              <div className="px-4 py-3 border-b border-border bg-surface flex justify-between items-center">
                <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Đề gốc (PDF)
                </span>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1">
                  <Download className="w-3.5 h-3.5" />
                  Download PDF
                </Button>
              </div>
              <div className="p-5 overflow-y-auto flex-1 space-y-6">
                {file ? (
                  <>
                    <ExamHeader info={headerInfo} />
                    {MOCK_ORIGINAL.map((q) => (
                      <div key={q.id} className="space-y-1.5">
                        <p className="font-medium leading-relaxed">{q.q}</p>
                        <p className="text-sm text-muted-foreground">{q.a}</p>
                        {showExplanations && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xs bg-muted/50 p-2.5 rounded-md border border-border/50 text-muted-foreground italic"
                          >
                            <span className="font-semibold non-italic mr-1 text-[10px] uppercase tracking-wider">Giải thích:</span>
                            {q.explanation}
                          </motion.div>
                        )}
                      </div>
                    ))}
                    <ExamFooter info={headerInfo} />
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground min-h-[200px]">
                    <FileText className="w-12 h-12 mb-3 opacity-20" />
                    <p className="text-sm">Chưa có dữ liệu đầu vào</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Variation */}
            <div className="bg-card rounded-xl border border-border overflow-hidden flex flex-col min-h-[400px]">
              <div className="px-4 py-3 border-b border-border bg-primary/5 flex justify-between items-center">
                <span className="text-[11px] font-bold uppercase tracking-widest text-primary">
                  Phiên bản mới
                </span>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1">
                  <Download className="w-3.5 h-3.5" />
                  Download PDF
                </Button>
              </div>
              <div className="p-5 overflow-y-auto flex-1 space-y-6">
                <AnimatePresence mode="wait">
                  {status === "processing" ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      {[1, 2, 3, 4, 5].map((i) => (
                        <SkeletonRow key={i} />
                      ))}
                    </motion.div>
                  ) : status === "completed" ? (
                    <motion.div
                      key="content"
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ type: "spring", damping: 25, stiffness: 300 }}
                      className="space-y-2"
                    >
                      <ExamHeader info={headerInfo} />
                      {MOCK_VARIATION.map((q) => (
                        <div
                          key={q.id}
                          className="group relative p-4 rounded-lg hover:bg-surface transition-colors border border-transparent hover:border-border space-y-1.5"
                        >
                          <p className="font-medium leading-relaxed pr-8">{q.q}</p>
                          <p className="text-sm text-primary font-medium">{q.a}</p>
                          {showExplanations && (
                            <motion.div
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-xs bg-primary/5 p-2.5 rounded-md border border-primary/10 text-muted-foreground italic"
                            >
                              <span className="font-semibold non-italic mr-1 text-[10px] uppercase tracking-wider text-primary/70">Giải thích:</span>
                              {q.explanation}
                            </motion.div>
                          )}
                          <button className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-card rounded-md border border-border transition-all">
                            <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                          </button>
                        </div>
                      ))}
                      <ExamFooter info={headerInfo} />
                    </motion.div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground min-h-[200px]">
                      <Sparkles className="w-12 h-12 mb-3 opacity-20" />
                      <p className="text-sm">Nhấn "Tạo đề" để bắt đầu</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
      </main>

      {/* Answer Key Modal */}
      <AnimatePresence>
        {showAnswers && (
          <AnswerKeyModal
            questions={MOCK_VARIATION}
            onClose={() => setShowAnswers(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
