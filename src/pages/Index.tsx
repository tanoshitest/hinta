import { useState, useCallback, useRef } from "react";

import {
  Sparkles,
  FileText,
  Download,
  Loader2,
  ListChecks,
  Copy,
  Plus,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import UploadZone from "@/components/UploadZone";
import SkeletonRow from "@/components/SkeletonRow";
import AnswerKeyModal from "@/components/AnswerKeyModal";

const MOCK_ORIGINAL = [
  { id: 1, q: "Câu 1: Đạo hàm của hàm số y = sin(x) là gì?", a: "A. cos(x)", explanation: "Đạo hàm của hàm lượng giác cơ bản: (sin x)' = cos x." },
  { id: 2, q: "Câu 2: Chiến dịch Điện Biên Phủ kết thúc vào năm nào?", a: "B. 1954", explanation: "Chiến dịch Điện Biên Phủ kết thúc thắng lợi vào ngày 7/5/1954." },
  { id: 3, q: "Câu 3: Nguyên tố hóa học nào có ký hiệu là 'Fe'?", a: "C. Sắt", explanation: "'Fe' là ký hiệu của sắt (Ferrum) trong bảng tuần hoàn." },
  { id: 4, q: "Câu 4: Tác phẩm 'Truyện Kiều' do ai sáng tác?", a: "A. Nguyễn Du", explanation: "Truyện Kiều (Đoạn trường tân thanh) là kiệt tác của Đại thi hào Nguyễn Du." },
  { id: 5, q: "Câu 5: Sông nào dài nhất Việt Nam?", a: "D. Sông Mê Kông", explanation: "Sông Mê Kông là con sông dài nhất chảy qua lãnh thổ Việt Nam." },
  { id: 6, q: "Câu 6: Ai là người đầu tiên đặt chân lên Mặt Trăng?", a: "A. Neil Armstrong", explanation: "Neil Armstrong là người đầu tiên đặt chân lên Mặt Trăng vào năm 1969 trong nhiệm vụ Apollo 11." },
  { id: 7, q: "Câu 7: Đơn vị đo cường độ dòng điện là gì?", a: "B. Ampe", explanation: "Ampe (A) là đơn vị đo cường độ dòng điện trong hệ SI." },
  { id: 8, q: "Câu 8: Tỉnh nào có diện tích lớn nhất Việt Nam?", a: "C. Nghệ An", explanation: "Nghệ An là tỉnh có diện tích lớn nhất Việt Nam với hơn 16.000 km2." },
  { id: 9, q: "Câu 9: Cơ quan nào trong cơ thể người lọc máu?", a: "D. Thận", explanation: "Thận là cơ quan chính đóng vai trò lọc máu và bài tiết chất thải qua nước tiểu." },
  { id: 10, q: "Câu 10: Thành phố nào được gọi là 'Thành phố Hoa Phượng Đỏ'?", a: "A. Hải Phòng", explanation: "Hải Phòng nổi tiếng với loài hoa phượng đỏ trồng khắp thành phố." },
  { id: 11, q: "Câu 11: Số nguyên tố chẵn duy nhất là số nào?", a: "B. 2", explanation: "Số 2 là số nguyên tố duy nhất chia hết cho 2." },
  { id: 12, q: "Câu 12: Đại dương nào sâu nhất thế giới?", a: "C. Thái Bình Dương", explanation: "Thái Bình Dương là đại dương lớn nhất và sâu nhất với vực Mariana." },
  { id: 13, q: "Câu 13: Vitamin nào tốt nhất cho mắt?", a: "A. Vitamin A", explanation: "Vitamin A đóng vai trò quan trọng trong việc duy trì thị lực và sức khỏe giác mạc." },
  { id: 14, q: "Câu 14: Tác giả của tập thơ 'Nhật ký trong tù' là ai?", a: "B. Hồ Chí Minh", explanation: "Nhật ký trong tù là tập thơ chữ Hán của Chủ tịch Hồ Chí Minh viết trong lao tù Tưởng Giới Thạch." },
  { id: 15, q: "Câu 15: Đỉnh núi cao nhất Việt Nam là đỉnh nào?", a: "C. Fansipan", explanation: "Fansipan là đỉnh núi cao nhất Việt Nam và Đông Dương (3.143m)." },
  { id: 16, q: "Câu 16: Hành tinh nào gần Mặt Trời nhất?", a: "D. Sao Thủy", explanation: "Sao Thủy là hành tinh nhỏ nhất và nằm gần Mặt Trời nhất." },
  { id: 17, q: "Câu 17: Kim loại nào dẫn điện tốt nhất?", a: "A. Bạc", explanation: "Bạc là kim loại có khả năng dẫn điện và dẫn nhiệt tốt nhất." },
  { id: 18, q: "Câu 18: Tác phẩm 'Số đỏ' là của nhà văn nào?", a: "B. Vũ Trọng Phụng", explanation: "Số đỏ là tiểu thuyết trào phúng nổi tiếng nhất của Vũ Trọng Phụng." },
  { id: 19, q: "Câu 19: Quốc gia nào có dân số đông nhất thế giới?", a: "C. Ấn Độ", explanation: "Hiện nay Ấn Độ đã vượt qua Trung Quốc để trở thành quốc gia đông dân nhất thế giới." },
  { id: 20, q: "Câu 20: Công thức hóa học của muối ăn là gì?", a: "D. NaCl", explanation: "NaCl (Natri Clorua) là thành phần chính của muối ăn." },
  { id: 21, q: "Câu 21: Ai là tác giả của 'Tiến quân ca'?", a: "A. Văn Cao", explanation: "Nhạc sĩ Văn Cao sáng tác Tiến quân ca, sau này trở thành Quốc ca Việt Nam." },
  { id: 22, q: "Câu 22: Thủ đô của Pháp là gì?", a: "B. Paris", explanation: "Paris là thủ đô và thành phố phát triển bậc nhất của nước Pháp." },
  { id: 23, q: "Câu 23: Tế bào nào trong máu giúp đông máu?", a: "C. Tiểu cầu", explanation: "Tiểu cầu có chức năng quan trọng là tham gia vào quá trình đông máu." },
  { id: 24, q: "Câu 24: Một năm nhuận có bao nhiêu ngày?", a: "B. 366 ngày", explanation: "Năm nhuận có thêm ngày 29/2 nên tổng cộng có 366 ngày." },
  { id: 25, q: "Câu 25: Con vật nào là biểu tượng của nước Australia?", a: "D. Kangaroo", explanation: "Kangaroo là loài vật đặc trưng và là biểu tượng quốc gia của Australia." },
  { id: 26, q: "Câu 26: Đơn vị tính lực trong vật lý là gì?", a: "A. Newton", explanation: "Newton (N) là đơn vị đo lực trong hệ SI." },
  { id: 27, q: "Câu 27: Truyện cổ tích 'Tấm Cám' thuộc thể loại nào?", a: "B. Truyện cổ tích thần kỳ", explanation: "Tấm Cám là truyện cổ tích thần kỳ phản ánh mâu thuẫn gia đình và xã hội." },
  { id: 28, q: "Câu 28: Hệ mặt trời có bao nhiêu hành tinh?", a: "C. 8", explanation: "Hệ mặt trời gồm 8 hành tinh chính thức: Thủy, Kim, Trái Đất, Hỏa, Mộc, Thổ, Thiên Vương, Hải Vương." },
  { id: 29, q: "Câu 29: Ai là 'Cha đẻ' của thuyết tương đối?", a: "D. Albert Einstein", explanation: "Albert Einstein nổi tiếng with thuyết tương đối rộng và hẹp." },
  { id: 30, q: "Câu 30: Đèo nào nối Thừa Thiên Huế và Đà Nẵng?", a: "A. Đèo Hải Vân", explanation: "Đèo Hải Vân là ranh giới tự nhiên giữa hai địa phương này." },
];

const MOCK_VARIATION = [
  { id: 1, q: "Câu 1: Tính đạo hàm bậc nhất của hàm số f(x) = sin(x).", a: "A. cos(x)", explanation: "Công thức đạo hàm cơ bản cho hàm số lượng giác: f'(x) = d/dx(sin x) = cos x." },
  { id: 2, q: "Câu 2: Xác định mốc thời gian kết thúc thắng lợi của chiến dịch Điện Biên Phủ.", a: "C. Năm 1954", explanation: "Ngày 7 tháng 5 năm 1954, lá cờ 'Quyết chiến Quyết thắng' của quân đội ta tung bay trên nóc hầm Đờ-cát." },
  { id: 3, q: "Câu 3: Ký hiệu 'Fe' trong bảng tuần hoàn đại diện cho nguyên tố nào?", a: "B. Sắt", explanation: "Ký hiệu hóa học Fe bắt nguồn từ tiếng Latin 'Ferrum', nghĩa là sắt." },
  { id: 4, q: "Câu 4: Ai là tác giả của kiệt tác văn học 'Truyện Kiều'?", a: "D. Nguyễn Du", explanation: "Nguyễn Du là tác giả của Truyện Kiều, đỉnh cao của nghệ thuật thi ca tiếng Việt." },
  { id: 5, q: "Câu 5: Xác định con sông có chiều dài lớn nhất chảy qua lãnh thổ Việt Nam.", a: "A. Sông Mê Kông", explanation: "Sông Mê Kông có tổng chiều dài hơn 4.300 km, chảy qua 6 quốc gia bao gồm cả VN." },
  { id: 6, q: "Câu 6: Ai là người đầu tiên thực hiện chuyến bay lên Mặt Trăng vào năm 1969?", a: "C. Neil Armstrong", explanation: "Neil Armstrong đã thực hiện bước đi lịch sử của nhân loại trên bề mặt Mặt Trăng." },
  { id: 7, q: "Câu 7: Đơn vị nào được dùng để đo cường độ của dòng điện?", a: "B. Ampe", explanation: "Ampe là đơn vị vật lý dùng để đo mức độ mạnh yếu của dòng điện." },
  { id: 8, q: "Câu 8: Tỉnh thành nào có diện tích tự nhiên rộng nhất cả nước?", a: "A. Nghệ An", explanation: "Nghệ An nằm ở vùng Bắc Trung Bộ và có diện tích lớn nhất trong số 63 tỉnh thành." },
  { id: 9, q: "Câu 9: Cơ quan nào trong cơ thể chịu trách nhiệm chính trong việc lọc bỏ tạp chất khỏi máu?", a: "D. Thận", explanation: "Hai quả thận đóng vai trò như một bộ máy lọc tự nhiên cho cơ thể." },
  { id: 10, q: "Câu 10: Biệt danh 'Thành phố Hoa Phượng Đỏ' dùng để chỉ thành phố nào?", a: "B. Hải Phòng", explanation: "Cây hoa phượng đỏ là loài hoa biểu tượng gắn liền with vẻ đẹp của Hải Phòng." },
  { id: 11, q: "Câu 11: Có bao nhiêu số nguyên tố vừa là số chẵn?", a: "C. 1 (Số 2)", explanation: "Số 2 là trường hợp đặc biệt duy nhất vừa là số chẵn vừa là số nguyên tố." },
  { id: 12, q: "Câu 12: Đại dương có độ sâu trung bình và tối đa lớn nhất hành tinh là gì?", a: "A. Thái Bình Dương", explanation: "Thái Bình Dương bao phủ một phần ba diện tích Trái Đất." },
  { id: 13, q: "Câu 13: Việc tiêu thụ loại Vitamin nào sau đây giúp cải thiện thị lực hiệu quả?", a: "B. Vitamin A", explanation: "Thiếu Vitamin A có thể dẫn đến bệnh quáng gà và khô mắt." },
  { id: 14, q: "Câu 14: Tập thơ 'Nhật ký trong tù' được sáng tác bởi ai trong thời gian bị giam giữ?", a: "D. Hồ Chí Minh", explanation: "Đây là một di sản văn hóa quý báu của dân tộc Việt Nam." },
  { id: 15, q: "Câu 15: Đỉnh núi Fansipan có chiều cao bao nhiêu so với mực nước biển?", a: "A. 3.143m", explanation: "Fansipan được mệnh danh là nóc nhà của Đông Dương." },
  { id: 16, q: "Câu 16: Hành tinh nào có khoảng cách gần Mặt Trời nhất trong Hệ Mặt Trời?", a: "C. Sao Thủy", explanation: "Bề mặt của Sao Thủy rất nóng vào ban ngày do nằm sát Mặt Trời." },
  { id: 17, q: "Câu 17: Trong số các kim loại sau, kim loại nào cho khả năng truyền điện tốt nhất?", a: "B. Bạc", explanation: "Mặc dù dẫn điện tốt nhất nhưng bạc hiếm khi làm dây điện vì giá thành cao." },
  { id: 18, q: "Câu 18: Tác phẩm tiểu thuyết 'Số đỏ' thuộc về ngòi bút của ai?", a: "D. Vũ TRọng Phụng", explanation: "Vũ Trọng Phụng được mệnh danh là 'Ông vua phóng sự đất Bắc'." },
  { id: 19, q: "Câu 19: Quốc gia nào hiện giữ vị trí quán quân về quy mô dân số trên toàn cầu?", a: "A. Ấn Độ", explanation: "Dân số Ấn Độ đang tăng trưởng nhanh chóng và đã vượt mốc 1,4 tỷ người." },
  { id: 20, q: "Câu 20: Công thức cấu tạo hóa học của muối ăn thông thường là gì?", a: "C. NaCl", explanation: "NaCl là hợp chất ion giữa Natri và Clo." },
  { id: 21, q: "Câu 21: Nhạc sĩ nào đã phổ nhạc bài 'Tiến quân ca'?", a: "B. Văn Cao", explanation: "Bài hát được sáng tác năm 1944 và được chọn làm quốc ca từ năm 1945." },
  { id: 22, q: "Câu 22: Thành phố Paris được biết đến là thủ đô của quốc gia nào?", a: "A. Pháp", explanation: "Paris là trung tâm kinh tế, văn hóa và thời trang hàng đầu thế giới." },
  { id: 23, q: "Câu 23: Loại tế bào máu nào đóng vai trò tiên quyết trong việc cầm máu tại vết thương?", a: "D. Tiểu cầu", explanation: "Tiểu cầu kết tụ lại tại vết thương để tạo ra nút chặn tiểu cầu." },
  { id: 24, q: "Câu 24: Một năm tính theo lịch Gregory có bao nhiêu ngày nếu là năm nhuận?", a: "C. 366 ngày", explanation: "Chu kỳ 4 năm một lần sẽ có một năm nhuận để bù đắp sai số thời gian." },
  { id: 25, q: "Câu 25: Loài động vật có túi nào được coi là biểu tượng lừng danh của Australia?", a: "B. Kangaroo", explanation: "Kangaroo có mặt trên quốc huy của Australia cùng với chim đà điểu Emu." },
  { id: 26, q: "Câu 26: Tên gọi của đơn vị đo lực trong hệ đo lường quốc tế là gì?", a: "D. Newton", explanation: "Tên đơn vị được đặt theo tên nhà khoa học vĩ đại Isaac Newton." },
  { id: 27, q: "Câu 27: Nội dung truyện 'Tấm Cám' thể hiện cuộc đấu tranh giữa cái gì?", a: "A. Thiện và Ác", explanation: "Đây là chủ đề phổ biến trong các truyện cổ tích thần kỳ Việt Nam." },
  { id: 28, q: "Câu 28: Tổng số hành tinh đang quay quanh Mặt Trời trong hệ của chúng ta là bao nhiêu?", a: "B. 8", explanation: "Sao Diêm Vương hiện được xếp vào nhóm hành tinh lùn." },
  { id: 29, q: "Câu 29: Nhà vật lý học nào đã công bố thuyết tương đối nổi tiếng thế giới?", a: "C. Albert Einstein", explanation: "Albert Einstein nhận giải Nobel vật lý năm 1921." },
  { id: 30, q: "Câu 30: Để đi từ Đà Nẵng ra Huế bằng đường bộ qua đèo, ta phải đi qua đèo nào?", a: "D. Đèo Hải Vân", explanation: "Đèo Hải Vân được mệnh danh là 'Thiên hạ đệ nhất hùng quan'." },
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
    <div className="flex justify-between items-baseline mb-3 border-b border-blue-600/30 pb-0.5">
      <span className="text-sm font-medium text-blue-600/80">
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

const ExamFooter = ({ info, pageNumber }: { info: HeaderInfo; pageNumber: number }) => (
  <div className="mt-8 pt-4 border-t border-blue-600/30 flex justify-between items-center text-sm font-medium text-blue-600/80">
    <span>{info.centerName}</span>
    <span>Trang {pageNumber}</span>
  </div>
);

const chunkArray = <T,>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

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
      {/* Sticky Header Container */}
      <div className="sticky top-0 z-20">
        {/* Navigation */}
        <nav className="h-14 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-6">
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

        {/* Top Toolbar - Sticky & Equal Height */}
        <div className="bg-surface/80 backdrop-blur-md border-b border-border">
          <div className="max-w-[1600px] mx-auto p-4 md:p-6">
            <div className="flex flex-col md:flex-row gap-4 items-stretch">
              <div className="bg-card p-4 rounded-xl border border-border flex-1 min-w-0 flex flex-col">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                  Quản lý tệp
                </h3>
                <div className="flex-1">
                  <UploadZone file={file} onFileSelect={handleFileSelect} />
                </div>
              </div>

              <div className="bg-card p-4 rounded-xl border border-border flex flex-col gap-2 md:w-64 w-full">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                  Công cụ
                </h3>
                <div className="flex flex-col gap-2 h-full justify-center">
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
              </div>

              <div className="bg-card p-4 rounded-xl border border-border flex flex-col gap-3 flex-1">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                  Thông tin tiêu đề đề thi
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 flex-1">
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
          </div>
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto p-4 md:p-6 space-y-5">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Left: Original */}
          <div className="flex flex-col gap-4">
            <div className="px-4 py-2 flex justify-between items-center">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2 h-6 bg-slate-400 rounded-full" />
                Đề gốc (PDF)
              </h2>
              <Button variant="outline" size="sm" className="gap-2 text-xs h-8 border-slate-300 text-slate-600 hover:bg-slate-100 transition-colors">
                <Download className="w-3.5 h-3.5" />
                Tải xuống PDF
              </Button>
            </div>
            
            <div className="space-y-12">
              {status === "completed" || status === "uploaded" ? (
                chunkArray(MOCK_ORIGINAL, 6).map((pageQuestions, pageIdx) => (
                  <div key={pageIdx} className="bg-white p-8 shadow-sm border border-border rounded-sm min-h-[800px] flex flex-col">
                    <ExamHeader info={headerInfo} />
                    <div className="flex-1 space-y-5">
                      {pageQuestions.map((q) => (
                        <div key={q.id} className="space-y-2 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                          <p className="font-semibold text-slate-800">{q.q}</p>
                          <p className="text-slate-600 pl-4">{q.a}</p>
                          {showExplanations && (
                            <div className="mt-3 pl-4 py-2 border-l-2 border-blue-200 bg-blue-50/50 rounded-r-md">
                              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Hướng dẫn đáp án:</p>
                              <p className="text-sm text-slate-600 leading-relaxed italic">
                                {q.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <ExamFooter info={headerInfo} pageNumber={pageIdx + 1} />
                  </div>
                ))
              ) : (
                <div className="bg-card rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>Tải tệp PDF lên để xem đề gốc</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Variation */}
          <div className="flex flex-col gap-4">
            <div className="px-4 py-2 flex justify-between items-center">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2 h-6 bg-blue-600 rounded-full" />
                Phiên bản mới (Dự kiến)
              </h2>
              <Button variant="outline" size="sm" className="gap-2 text-xs h-8 border-blue-200 text-blue-600 hover:bg-blue-50/50 transition-colors">
                <Download className="w-3.5 h-3.5" />
                Tải xuống PDF
              </Button>
            </div>

            <div className="space-y-12">
              <AnimatePresence mode="wait">
                {status === "processing" ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-card p-8 rounded-xl border border-border space-y-4"
                  >
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <SkeletonRow key={i} />
                    ))}
                  </motion.div>
                ) : status === "completed" ? (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-12"
                  >
                    {chunkArray(MOCK_VARIATION, 6).map((pageQuestions, pageIdx) => (
                      <div key={pageIdx} className="bg-white p-8 shadow-sm border border-border rounded-sm min-h-[800px] flex flex-col">
                        <ExamHeader info={headerInfo} />
                        <div className="flex-1 space-y-6">
                          {pageQuestions.map((q) => (
                            <div key={q.id} className="relative group p-4 rounded-xl border border-transparent hover:border-blue-100 hover:bg-blue-50/30 transition-all duration-300">
                              <p className="font-semibold text-slate-800 mb-2">{q.q}</p>
                              <p className="text-slate-600 mb-4 pl-4">{q.a}</p>
                              
                              {showExplanations && (
                                <div className="mb-4 pl-4 py-3 border-l-4 border-emerald-400 bg-emerald-50/50 rounded-r-xl">
                                  <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    Giải thích chi tiết:
                                  </p>
                                  <p className="text-sm text-slate-600 leading-relaxed italic">
                                    {q.explanation}
                                  </p>
                                </div>
                              )}

                              <button className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-card rounded-md border border-border transition-all">
                                <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <ExamFooter info={headerInfo} pageNumber={pageIdx + 1} />
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  <div className="bg-card rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
                    <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>Nhấn "Tạo đề phiên bản mới" để bắt đầu</p>
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
