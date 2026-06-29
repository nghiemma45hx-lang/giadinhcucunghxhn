import React from 'react';
import { BookOpen, Users, Bell, FileText, Printer, ShieldAlert, Award, Calendar } from 'lucide-react';
import { FamilyMember, Announcement } from '../types';

interface HomeViewProps {
  members: FamilyMember[];
  announcements: Announcement[];
  setCurrentTab: (tab: string) => void;
  onPrint: () => void;
  onExportWord: () => void;
  onExportPdf: () => void;
}

export default function HomeView({
  members,
  announcements,
  setCurrentTab,
  onPrint,
  onExportWord,
  onExportPdf,
}: HomeViewProps) {
  const livingCount = members.filter((m) => !m.isDeceased).length;
  const deceasedCount = members.filter((m) => m.isDeceased).length;
  const generations = Array.from(new Set(members.map((m) => m.generation)));
  const uniqueBranches = Array.from(new Set(members.map((m) => m.branch).filter(b => b !== 'Nhánh chính')));

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 flex flex-col lg:flex-row gap-6">
      {/* LEFT SIDEBAR: QUICK NAVIGATION & UTILITIES */}
      <aside className="w-full lg:w-[260px] flex-shrink-0">
        <div className="bg-white rounded-xl shadow-xs border border-[#eadecb] p-4 sticky top-24">
          <h3 className="text-lg font-bold text-[#6b4724] border-b-2 border-[#b8956b] pb-2 mb-4 uppercase font-serif flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#b8956b]" />
            Gia Tộc Thư Viện
          </h3>
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => setCurrentTab('home')}
                className="w-full text-left flex items-center p-2 rounded bg-[#f4f0e6] text-[#6b4724] font-medium border-l-4 border-[#b8956b] transition text-sm"
              >
                Trang chủ tổng quan
              </button>
            </li>
            <li>
              <button
                onClick={() => setCurrentTab('member-list')}
                className="w-full text-left flex items-center p-2 rounded hover:bg-[#f4f0e6] text-[#5a3d1c] transition text-sm"
              >
                Tìm kiếm thành viên
              </button>
            </li>
            <li>
              <button
                onClick={() => setCurrentTab('family-tree')}
                className="w-full text-left flex items-center p-2 rounded hover:bg-[#f4f0e6] text-[#5a3d1c] transition text-sm"
              >
                Sơ đồ phả hệ trực quan
              </button>
            </li>
          </ul>

          <div className="pt-4 mt-4 border-t border-dashed border-[#eadecb]">
            <span className="text-xs uppercase text-[#8b7355] font-bold block mb-2 px-2">In ấn & Xuất bản</span>
            <div className="space-y-1">
              <button
                onClick={onExportWord}
                className="w-full text-left flex items-center p-2 rounded hover:bg-[#f4f0e6] text-[#5a3d1c] transition text-sm gap-2"
              >
                <FileText className="w-4 h-4 text-blue-600" />
                Xuất bản Word (.docx)
              </button>
              <button
                onClick={onExportPdf}
                className="w-full text-left flex items-center p-2 rounded hover:bg-[#f4f0e6] text-[#5a3d1c] transition text-sm gap-2"
              >
                <FileText className="w-4 h-4 text-red-600" />
                Tải văn bản PDF (.pdf)
              </button>
              <button
                onClick={onPrint}
                className="w-full text-left flex items-center p-2 rounded hover:bg-[#f4f0e6] text-[#5a3d1c] transition text-sm gap-2"
              >
                <Printer className="w-4 h-4 text-emerald-600" />
                In bản phả hệ cầm tay
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* CENTER COLUMN: MAIN BRIEFING */}
      <main className="flex-1 min-w-0 flex flex-col gap-6">
        <section className="bg-white rounded-xl shadow-xs border border-[#eadecb] p-6 lg:p-8 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 opacity-5 pointer-events-none text-[#b8956b]">
            <BookOpen className="w-full h-full" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#6b4724] mb-4 font-serif flex items-center gap-3">
            Lời Tựa Gia Tộc
          </h2>
          <div className="text-[#4a331a] leading-relaxed space-y-4 text-justify text-base">
            <p>
              Cây có gốc mới nở cành xanh ngọn, nước có nguồn mới bể rộng sông sâu. Người có tổ tông mới sinh con cháu, hiếu nghĩa vẹn tròn mới rạng rỡ tổ tiên.
            </p>
            <p>
              Gia phả gia đình dòng họ <strong>Cụ Nghiêm Cung</strong> (kế thừa dòng dõi cụ cố <strong>Nghiêm Điều (Chu)</strong> tại vùng đất Hòa Xá cổ kính, giàu truyền thống cách mạng) được lập ra nhằm mục đích kính cáo tổ tông, ghi chép tường tận huyết mạch dòng giống, lưu truyền cho con cháu vạn đời sau không bao giờ quên đi nguồn cội thiêng liêng của mình.
            </p>
            <p>
              Trải qua bao thăng trầm của lịch sử, con cháu họ Nghiêm luôn gìn giữ nếp gia phong nghiêm cẩn, lấy hiếu học làm đầu, lấy đức độ làm trọng, lấy trung thực làm gương và hết lòng đùm bọc, giúp đỡ lẫn nhau vượt qua gian khó, lập thân kiến nghiệp làm rạng danh gia đình.
            </p>
          </div>

          {/* Quick Stats Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 border-t border-dashed border-[#eadecb] pt-6">
            <div className="text-center p-2 bg-[#fdfbf7] rounded-lg border border-[#f4f0e6]">
              <div className="text-3xl font-bold text-[#b8956b] font-serif">{generations.length}</div>
              <div className="text-xs uppercase text-[#8b7355] mt-1 font-bold">Thế Hệ Đã Ghi</div>
            </div>
            <div className="text-center p-2 bg-[#fdfbf7] rounded-lg border border-[#f4f0e6]">
              <div className="text-3xl font-bold text-[#b8956b] font-serif">{members.length}</div>
              <div className="text-xs uppercase text-[#8b7355] mt-1 font-bold">Tổng Thành Viên</div>
            </div>
            <div className="text-center p-2 bg-[#fdfbf7] rounded-lg border border-[#f4f0e6]">
              <div className="text-3xl font-bold text-[#b8956b] font-serif">{livingCount}</div>
              <div className="text-xs uppercase text-[#8b7355] mt-1 font-bold">Đang Tại Thế ({members.length > 0 ? Math.round((livingCount/members.length)*100) : 0}%)</div>
            </div>
            <div className="text-center p-2 bg-[#fdfbf7] rounded-lg border border-[#f4f0e6]">
              <div className="text-3xl font-bold text-[#b8956b] font-serif">{deceasedCount}</div>
              <div className="text-xs uppercase text-[#8b7355] mt-1 font-bold">Khuất Bóng</div>
            </div>
          </div>
        </section>

        {/* Traditional family rules */}
        <section className="bg-white rounded-xl shadow-xs border border-[#eadecb] p-6">
          <h3 className="text-xl font-bold text-[#6b4724] mb-4 font-serif flex items-center gap-2">
            <Award className="w-5 h-5 text-[#b8956b]" />
            Gia Huấn Họ Nghiêm (Nếp Sống Trọng Đức)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[#5a3d1c]">
            <div className="p-3 bg-[#fdfbf7] rounded-lg border-l-4 border-[#b8956b]">
              <h4 className="font-bold text-[#6b4724] mb-1">1. Hiếu Kính Với Cha Mẹ</h4>
              <p>Phận làm con luôn đặt đạo hiếu làm đầu, kính dưỡng song thân, ghi nhớ công đức sinh thành dưỡng dục.</p>
            </div>
            <div className="p-3 bg-[#fdfbf7] rounded-lg border-l-4 border-[#b8956b]">
              <h4 className="font-bold text-[#6b4724] mb-1">2. Hòa Thuận Anh Chị Em</h4>
              <p>Anh em như thể tay chân, đùm bọc nhường nhịn, lúc hoạn nạn có nhau, chia ngọt sẻ bùi.</p>
            </div>
            <div className="p-3 bg-[#fdfbf7] rounded-lg border-l-4 border-[#b8956b]">
              <h4 className="font-bold text-[#6b4724] mb-1">3. Chăm Lo Sự Học Hành</h4>
              <p>Học vấn là nguồn cội vinh hoa. Khuyến khích con cháu gắng công đèn sách, đem tài đức giúp đời hưng nước.</p>
            </div>
            <div className="p-3 bg-[#fdfbf7] rounded-lg border-l-4 border-[#b8956b]">
              <h4 className="font-bold text-[#6b4724] mb-1">4. Giữ Gìn Lòng Liêm Khiết</h4>
              <p>Làm việc chính trực, hành xử bao dung khoan hòa, không tham lợi phi pháp, làm rạng danh dòng tộc.</p>
            </div>
          </div>
        </section>
      </main>

      {/* RIGHT SIDEBAR: ANNOUNCEMENTS & NEWS */}
      <aside className="w-full lg:w-[280px] flex-shrink-0 flex flex-col gap-6">
        <div className="bg-white rounded-xl shadow-xs border border-[#eadecb] overflow-hidden sticky top-24">
          <div className="bg-[#b8956b] text-white p-4 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            <h3 className="font-bold uppercase tracking-wide text-sm font-serif">Thông Báo Gia Tộc</h3>
          </div>
          <div className="p-4 space-y-4 divide-y divide-[#f4f0e6]">
            {announcements.map((ann, i) => (
              <div key={ann.id} className={`${i > 0 ? 'pt-4' : ''}`}>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                    ann.type === 'urgent'
                      ? 'bg-red-100 text-red-700'
                      : ann.type === 'event'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {ann.type === 'urgent' ? 'KHẨN CẤP' : ann.type === 'event' ? 'LỄ GIỖ' : 'CẬP NHẬT'}
                  </span>
                  <span className="text-[10px] text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {ann.date}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-[#6b4724] hover:text-[#b8956b] transition duration-200">
                  {ann.title}
                </h4>
                <p className="text-xs text-gray-500 mt-1 line-clamp-3 leading-relaxed">
                  {ann.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
