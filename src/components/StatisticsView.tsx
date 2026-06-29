import React, { useMemo } from 'react';
import { BarChart3, Users, Award, Briefcase, Activity, CheckCircle } from 'lucide-react';
import { FamilyMember } from '../types';

interface StatisticsViewProps {
  members: FamilyMember[];
}

export default function StatisticsView({ members }: StatisticsViewProps) {
  // 1. Core gender stat calculations
  const totalCount = members.length;
  const males = useMemo(() => members.filter((m) => m.gender === 'male'), [members]);
  const females = useMemo(() => members.filter((m) => m.gender === 'female'), [members]);

  // 2. Living vs deceased
  const living = useMemo(() => members.filter((m) => !m.isDeceased), [members]);
  const deceased = useMemo(() => members.filter((m) => m.isDeceased), [members]);

  // 3. Generation distributions
  const generationSpread = useMemo(() => {
    const stats: { [key: number]: number } = {};
    members.forEach((m) => {
      stats[m.generation] = (stats[m.generation] || 0) + 1;
    });
    return Object.entries(stats).map(([gen, count]) => ({
      gen: parseInt(gen),
      count,
    })).sort((a, b) => a.gen - b.gen);
  }, [members]);

  // 4. Branch distributions
  const branchSpread = useMemo(() => {
    const stats: { [key: string]: number } = {};
    members.forEach((m) => {
      const b = m.branch || 'Nhánh chính';
      stats[b] = (stats[b] || 0) + 1;
    });
    return Object.entries(stats).map(([name, count]) => ({ name, count }));
  }, [members]);

  // 5. Occupations
  const occupationSpread = useMemo(() => {
    const stats: { [key: string]: number } = {};
    members.forEach((m) => {
      if (m.occupation) {
        stats[m.occupation] = (stats[m.occupation] || 0) + 1;
      } else {
        stats['Khác / Chưa ghi'] = (stats['Khác / Chưa ghi'] || 0) + 1;
      }
    });
    return Object.entries(stats)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // top 5
  }, [members]);

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 flex flex-col gap-6">
      <div className="bg-white rounded-xl shadow-xs border border-[#eadecb] p-6">
        <h2 className="text-2xl font-bold text-[#6b4724] font-serif mb-2 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-[#b8956b]" />
          Bảng Thống Kê Số Liệu Gia Tộc
        </h2>
        <p className="text-sm text-gray-500 mb-8">
          Phân tích các chỉ số nhân khẩu học, độ sâu thế hệ và phân bố ngành nghề để có cái nhìn bao quát về gia phả cụ Nghiêm Cung.
        </p>

        {/* TOP LEVEL COUNTERS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Males vs Females */}
          <div className="bg-[#fdfbf7] border border-[#eadecb] rounded-xl p-5 flex items-center justify-between shadow-xs">
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase">Cơ Cấu Giới Tính</span>
              <h3 className="text-2xl font-bold text-[#6b4724] font-serif mt-1">
                {males.length} Nam / {females.length} Nữ
              </h3>
              <p className="text-xs text-gray-500 mt-2">
                Nam chiếm {Math.round((males.length/totalCount)*100)}% - Nữ chiếm {Math.round((females.length/totalCount)*100)}%
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100 text-blue-600 font-bold">
              ♂♀
            </div>
          </div>

          {/* Card 2: Living vs Deceased */}
          <div className="bg-[#fdfbf7] border border-[#eadecb] rounded-xl p-5 flex items-center justify-between shadow-xs">
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase">Trạng Thái Sinh Trưởng</span>
              <h3 className="text-2xl font-bold text-[#6b4724] font-serif mt-1">
                {living.length} Tại thế / {deceased.length} Khuất †
              </h3>
              <p className="text-xs text-gray-500 mt-2">
                {living.length} con cháu đang tiếp tục phát huy truyền thống tổ tiên.
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100 text-emerald-600">
              <Activity className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: Branches depth */}
          <div className="bg-[#fdfbf7] border border-[#eadecb] rounded-xl p-5 flex items-center justify-between shadow-xs">
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase">Thành phần quy mô</span>
              <h3 className="text-2xl font-bold text-[#6b4724] font-serif mt-1">
                {branchSpread.length} Chi lớn phụ hệ
              </h3>
              <p className="text-xs text-gray-500 mt-2">
                Dưới sự sáng lập của cụ Nghiêm Cung và cụ tiên tổ Nghiêm Điều.
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100 text-amber-600">
              <Award className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* GRAPH CHARTS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Chart 1: Generations Distribution */}
          <div className="border border-[#eadecb] rounded-xl p-5 bg-[#fdfbf7]/40">
            <h4 className="text-base font-bold text-[#6b4724] font-serif mb-5 flex items-center gap-1.5 uppercase tracking-wide border-b border-[#f4f0e6] pb-2">
              <Users className="w-4 h-4 text-[#b8956b]" />
              Phân Bố Số Lượng Theo Thế Hệ
            </h4>
            
            <div className="space-y-4">
              {generationSpread.map((item) => {
                const percent = (item.count / totalCount) * 100;
                return (
                  <div key={item.gen} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-gray-700">
                      <span>Đời thứ {item.gen}</span>
                      <span>{item.count} thành viên ({Math.round(percent)}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percent}%` }}
                        className="bg-[#b8956b] h-full rounded-full"
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart 2: Branch Spread */}
          <div className="border border-[#eadecb] rounded-xl p-5 bg-[#fdfbf7]/40">
            <h4 className="text-base font-bold text-[#6b4724] font-serif mb-5 flex items-center gap-1.5 uppercase tracking-wide border-b border-[#f4f0e6] pb-2">
              <Award className="w-4 h-4 text-[#b8956b]" />
              Phân Bổ Thành Viên Theo Các Chi
            </h4>

            <div className="space-y-4">
              {branchSpread.map((item) => {
                const percent = (item.count / totalCount) * 100;
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-gray-700">
                      <span>{item.name}</span>
                      <span>{item.count} thành viên ({Math.round(percent)}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percent}%` }}
                        className="bg-indigo-600/70 h-full rounded-full"
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart 3: Top Occupations */}
          <div className="border border-[#eadecb] rounded-xl p-5 bg-[#fdfbf7]/40 lg:col-span-2">
            <h4 className="text-base font-bold text-[#6b4724] font-serif mb-5 flex items-center gap-1.5 uppercase tracking-wide border-b border-[#f4f0e6] pb-2">
              <Briefcase className="w-4 h-4 text-[#b8956b]" />
              Cơ Cấu Ngành Nghề Đóng Góp Xã Hội
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {occupationSpread.map((item, index) => {
                  return (
                    <div key={item.name} className="flex items-center justify-between text-sm border-b border-[#f4f0e6] pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-[#b8956b]/10 rounded-full flex items-center justify-center font-bold text-[#6b4724] text-xs">
                          {index + 1}
                        </span>
                        <span className="font-semibold text-gray-700">{item.name}</span>
                      </div>
                      <span className="text-xs font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                        {item.count} người
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 bg-amber-50/40 rounded-xl border border-amber-100/50 flex flex-col justify-center text-sm text-amber-900 leading-relaxed text-justify">
                <h5 className="font-bold text-[#6b4724] mb-1.5 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-[#b8956b]" />
                  Đúc kết truyền thống
                </h5>
                <p className="text-xs text-gray-600">
                  Gia đình cụ Nghiêm Cung nổi danh hiếu học ở vùng đất cổ Hòa Xá. Ngày nay con cháu phát triển mạnh mẽ về các lĩnh vực như Kỹ sư, Khoa học, Kinh doanh, Giáo dục, mang tấm lòng chính trực, tài năng kiến thức phụng sự cho tổ quốc và gìn giữ rạng danh dòng tộc họ Nghiêm.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
