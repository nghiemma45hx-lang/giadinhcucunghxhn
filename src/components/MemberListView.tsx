import React, { useState, useMemo } from 'react';
import { Search, MapPin, Phone, Briefcase, Award, Eye, User, Calendar, RefreshCw } from 'lucide-react';
import { FamilyMember } from '../types';

interface MemberListViewProps {
  members: FamilyMember[];
}

export default function MemberListView({ members }: MemberListViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [genFilter, setGenFilter] = useState<string>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

  // Available unique generations & branches for filtering dynamically
  const generations = useMemo(() => {
    return Array.from(new Set(members.map((m) => m.generation))).sort((a, b) => a - b);
  }, [members]);

  const branches = useMemo(() => {
    return Array.from(new Set(members.map((m) => m.branch))).filter(b => b);
  }, [members]);

  // Handle resets
  const handleResetFilters = () => {
    setSearchTerm('');
    setGenFilter('all');
    setBranchFilter('all');
    setStatusFilter('all');
  };

  // Filter logic
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (m.occupation && m.occupation.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (m.role && m.role.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchGen = genFilter === 'all' ? true : m.generation.toString() === genFilter;
      const matchBranch = branchFilter === 'all' ? true : m.branch === branchFilter;
      const matchStatus = statusFilter === 'all' 
        ? true 
        : statusFilter === 'living' 
        ? !m.isDeceased 
        : m.isDeceased;

      return matchSearch && matchGen && matchBranch && matchStatus;
    });
  }, [members, searchTerm, genFilter, branchFilter, statusFilter]);

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 flex flex-col gap-6">
      <div className="bg-white rounded-xl shadow-xs border border-[#eadecb] p-6">
        <h2 className="text-2xl font-bold text-[#6b4724] font-serif mb-2 flex items-center gap-2">
          <Search className="w-6 h-6 text-[#b8956b]" />
          Tra Cứu Thông Tin Gia Quyến
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Tìm kiếm thông tin điện thoại, địa chỉ, nghề nghiệp hoặc vị trí trong phả hệ dòng tộc cụ Nghiêm Cung.
        </p>

        {/* SEARCH AND FILTER TOOLS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-[#fdfbf7] p-4 rounded-xl border border-[#f4f0e6] mb-6">
          {/* Text Search */}
          <div className="relative">
            <label className="text-xs font-bold text-[#6b4724] block mb-1 uppercase tracking-wider">Họ & Tên / Vai trò:</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Nhập tên cần tìm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2.5 pl-9 border border-[#d6b583] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#b8956b]"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
            </div>
          </div>

          {/* Gen filter */}
          <div>
            <label className="text-xs font-bold text-[#6b4724] block mb-1 uppercase tracking-wider">Đời thứ / Thế hệ:</label>
            <select
              value={genFilter}
              onChange={(e) => setGenFilter(e.target.value)}
              className="w-full p-2.5 border border-[#d6b583] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#b8956b]"
            >
              <option value="all">Tất cả các đời</option>
              {generations.map((g) => (
                <option key={g} value={g}>Đời thứ {g}</option>
              ))}
            </select>
          </div>

          {/* Branch filter */}
          <div>
            <label className="text-xs font-bold text-[#6b4724] block mb-1 uppercase tracking-wider">Chi / Ngành gia hệ:</label>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="w-full p-2.5 border border-[#d6b583] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#b8956b]"
            >
              <option value="all">Tất cả các chi</option>
              {branches.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div>
            <label className="text-xs font-bold text-[#6b4724] block mb-1 uppercase tracking-wider">Trạng thái:</label>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 p-2.5 border border-[#d6b583] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#b8956b]"
              >
                <option value="all">Tất cả</option>
                <option value="living">Tại thế</option>
                <option value="deceased">Đã khuất</option>
              </select>
              <button
                onClick={handleResetFilters}
                className="px-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg border border-gray-300 transition flex items-center justify-center"
                title="Đặt lại bộ lọc"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* METRICS INFO */}
        <div className="text-xs text-gray-500 font-semibold mb-4">
          Tìm thấy <span className="text-[#b8956b] font-bold text-sm">{filteredMembers.length}</span> thành viên phù hợp với bộ lọc hiện tại.
        </div>

        {/* MEMBERS GRID */}
        {filteredMembers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((m) => (
              <div
                key={m.id}
                className="bg-white border border-[#eadecb] hover:border-[#b8956b] rounded-xl overflow-hidden p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition duration-300 relative group"
              >
                {/* Gen tag top right */}
                <div className="absolute top-4 right-4 flex flex-col items-end gap-1">
                  <span className="text-[10px] font-bold text-[#b8956b] bg-[#fdfbf7] border border-[#eadecb] px-2 py-0.5 rounded-full">
                    Đời {m.generation}
                  </span>
                  {m.isDeceased ? (
                    <span className="text-[9px] font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200">
                      Đã tạ thế †
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded border border-emerald-200">
                      Tại thế
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {/* Name & Gender Icon */}
                  <div className="flex items-center gap-2">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                      m.gender === 'male'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#6b4724] text-base group-hover:text-[#b8956b] transition leading-tight">
                        {m.name}
                      </h3>
                      <p className="text-xs text-gray-400 font-semibold uppercase mt-0.5">
                        {m.role}
                      </p>
                    </div>
                  </div>

                  {/* Profile info lines */}
                  <div className="space-y-1.5 text-xs text-gray-600 border-t border-dashed border-[#f4f0e6] pt-3">
                    <div className="flex items-center gap-2">
                      <Award className="w-3.5 h-3.5 text-[#b8956b] flex-shrink-0" />
                      <span className="font-medium">Nhánh: <strong className="text-[#6b4724]">{m.branch}</strong></span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span>Thời gian: {m.birthYear ? `Năm sinh: ${m.birthYear}` : 'Chưa rõ năm sinh'}{m.isDeceased && m.deathYear ? ` - Năm mất: ${m.deathYear}` : ''}</span>
                    </div>

                    {m.occupation && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span>Nghề nghiệp: {m.occupation}</span>
                      </div>
                    )}

                    {m.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span>SĐT: {m.phone}</span>
                      </div>
                    )}

                    {m.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-1">Địa chỉ: {m.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* View Details Button */}
                <div className="mt-4 pt-3 border-t border-[#f4f0e6] flex justify-end">
                  <button
                    onClick={() => setSelectedMember(m)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#b8956b] hover:text-white bg-[#fdfbf7] hover:bg-[#b8956b] rounded-lg border border-[#eadecb] transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#fdfbf7] rounded-xl p-12 text-center border-2 border-dashed border-[#eadecb]">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Không tìm thấy thành viên nào khớp với bộ lọc tìm kiếm của bạn.</p>
            <button
              onClick={handleResetFilters}
              className="mt-3 px-4 py-2 bg-[#b8956b] text-white text-xs font-bold rounded-lg hover:bg-[#8b7355] transition"
            >
              Đặt lại tất cả bộ lọc
            </button>
          </div>
        )}
      </div>

      {/* DETAILED MODAL */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden border border-[#b8956b] shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Header banner */}
            <div className={`p-6 text-white flex justify-between items-start ${
              selectedMember.generation === 15 || selectedMember.generation === 16
                ? 'bg-gradient-to-r from-[#6b4724] to-[#8b7355]'
                : selectedMember.gender === 'male'
                ? 'bg-gradient-to-r from-blue-700 to-blue-500'
                : 'bg-gradient-to-r from-rose-700 to-rose-500'
            }`}>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full inline-block mb-1">
                  Đời thứ {selectedMember.generation} • {selectedMember.branch}
                </span>
                <h3 className="text-2xl font-bold font-serif flex items-center gap-2">
                  {selectedMember.name}
                  {selectedMember.isDeceased && <span className="text-sm font-normal text-amber-200 font-sans italic">(Khuất bóng †)</span>}
                </h3>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="text-white/80 hover:text-white text-2xl font-bold bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-full leading-none"
              >
                &times;
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-[#4a331a]">
              <div className="grid grid-cols-2 gap-4 text-sm bg-[#fdfbf7] p-4 rounded-xl border border-[#f4f0e6]">
                <div>
                  <span className="text-xs text-gray-400 font-bold block uppercase">Vai trò gia hệ:</span>
                  <span className="font-bold text-[#6b4724]">{selectedMember.role}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-bold block uppercase">Sinh / Mất:</span>
                  <span className="font-bold">
                    Năm {selectedMember.birthYear || '---'} {selectedMember.isDeceased ? ` - Năm ${selectedMember.deathYear || 'Khuất'}` : ' (Tại thế)'}
                  </span>
                </div>
                {selectedMember.occupation && (
                  <div>
                    <span className="text-xs text-gray-400 font-bold block uppercase">Nghề nghiệp:</span>
                    <span className="font-bold text-gray-700">{selectedMember.occupation}</span>
                  </div>
                )}
                {selectedMember.phone && (
                  <div>
                    <span className="text-xs text-gray-400 font-bold block uppercase">Số điện thoại:</span>
                    <span className="font-bold text-gray-700">{selectedMember.phone}</span>
                  </div>
                )}
                {selectedMember.address && (
                  <div className="col-span-2">
                    <span className="text-xs text-gray-400 font-bold block uppercase">Nơi sinh sống/An táng:</span>
                    <span className="font-bold text-gray-700">{selectedMember.address}</span>
                  </div>
                )}
              </div>

              {/* Biography Story */}
              <div>
                <h4 className="text-sm font-bold text-[#6b4724] uppercase tracking-wider mb-1.5 border-b border-[#f4f0e6] pb-1">
                  Tiểu Sử & Ghi Chú Gia Hệ
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed text-justify italic">
                  {selectedMember.story || 'Chưa cập nhật chi tiết tiểu sử cho thành viên này. Vui lòng liên hệ ban quản lý gia phả để bổ sung.'}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-[#fdfbf7] p-4 border-t border-[#f4f0e6] flex justify-end">
              <button
                onClick={() => setSelectedMember(null)}
                className="px-4 py-2 bg-[#b8956b] text-white text-xs font-bold rounded-lg hover:bg-[#8b7355] transition"
              >
                Đóng thông tin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
