import React, { useState } from 'react';
import { Settings, PlusCircle, Trash2, Edit2, Users, Bell, Activity, Save, X, Plus } from 'lucide-react';
import { FamilyMember, Announcement, SystemLog } from '../types';

interface AdminViewProps {
  members: FamilyMember[];
  announcements: Announcement[];
  logs: SystemLog[];
  onAddMember: (member: FamilyMember) => void;
  onEditMember: (member: FamilyMember) => void;
  onDeleteMember: (id: string) => void;
  onAddAnnouncement: (announcement: Announcement) => void;
  onDeleteAnnouncement: (id: string) => void;
}

export default function AdminView({
  members,
  announcements,
  logs,
  onAddMember,
  onEditMember,
  onDeleteMember,
  onAddAnnouncement,
  onDeleteAnnouncement,
}: AdminViewProps) {
  // Views switching inside Admin panel
  const [adminTab, setAdminTab] = useState<'members' | 'announcements' | 'logs'>('members');

  // Modal and form states for Member
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);

  // Member Form Fields
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [generation, setGeneration] = useState(17);
  const [role, setRole] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [deathYear, setDeathYear] = useState('');
  const [isDeceased, setIsDeceased] = useState(false);
  const [parentId, setParentId] = useState('');
  const [spouseId, setSpouseId] = useState('');
  const [branch, setBranch] = useState('Chi Cụ Bà Hai');
  const [story, setStory] = useState('');
  const [occupation, setOccupation] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  // Announcement Form Fields
  const [isAnnModalOpen, setIsAnnModalOpen] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annType, setAnnType] = useState<'urgent' | 'update' | 'event'>('update');

  // Open modal to add a new member
  const handleOpenAddMember = () => {
    setEditingMember(null);
    setName('');
    setGender('male');
    setGeneration(18);
    setRole('');
    setBirthYear('');
    setDeathYear('');
    setIsDeceased(false);
    setParentId('');
    setSpouseId('');
    setBranch('Chi Cụ Bà Hai');
    setStory('');
    setOccupation('');
    setAddress('');
    setPhone('');
    setIsMemberModalOpen(true);
  };

  // Open modal to edit an existing member
  const handleOpenEditMember = (member: FamilyMember) => {
    setEditingMember(member);
    setName(member.name);
    setGender(member.gender);
    setGeneration(member.generation);
    setRole(member.role);
    setBirthYear(member.birthYear || '');
    setDeathYear(member.deathYear || '');
    setIsDeceased(member.isDeceased);
    setParentId(member.parentId || '');
    setSpouseId(member.spouseId || '');
    setBranch(member.branch);
    setStory(member.story || '');
    setOccupation(member.occupation || '');
    setAddress(member.address || '');
    setPhone(member.phone || '');
    setIsMemberModalOpen(true);
  };

  // Handle member submit
  const handleMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) {
      alert('Vui lòng điền tên thành viên và vai trò trong gia quyến.');
      return;
    }

    const payload: FamilyMember = {
      id: editingMember ? editingMember.id : `mem-${Date.now()}`,
      name: name.trim(),
      gender,
      generation: Number(generation),
      role: role.trim(),
      birthYear: birthYear.trim() || undefined,
      deathYear: isDeceased ? (deathYear.trim() || undefined) : undefined,
      isDeceased,
      parentId: parentId || undefined,
      spouseId: spouseId || undefined,
      branch,
      story: story.trim() || undefined,
      occupation: occupation.trim() || undefined,
      address: address.trim() || undefined,
      phone: phone.trim() || undefined,
    };

    if (editingMember) {
      onEditMember(payload);
      alert(`Đã cập nhật thông tin cụ/thành viên: ${name}`);
    } else {
      onAddMember(payload);
      alert(`Đã thêm thành công thành viên: ${name} vào gia hệ.`);
    }

    setIsMemberModalOpen(false);
  };

  // Handle announcement submit
  const handleAnnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) {
      alert('Vui lòng điền tiêu đề và nội dung thông báo gia tộc.');
      return;
    }

    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      title: annTitle.trim(),
      content: annContent.trim(),
      type: annType,
      date: new Date().toISOString().split('T')[0],
    };

    onAddAnnouncement(newAnn);
    setIsAnnModalOpen(false);
    setAnnTitle('');
    setAnnContent('');
    alert('Đăng thông báo dòng họ thành công!');
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 flex flex-col gap-6">
      <div className="bg-white rounded-xl shadow-xs border border-[#eadecb] p-6">
        <h2 className="text-2xl font-bold text-[#6b4724] font-serif mb-6 flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#b8956b]" />
          Bàn Quản Trị Hệ Thống Gia Phả
        </h2>

        {/* ADMIN TAB SELECTORS */}
        <div className="flex border-b border-[#eadecb] mb-6">
          <button
            onClick={() => setAdminTab('members')}
            className={`px-4 py-2.5 font-bold text-xs uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition ${
              adminTab === 'members'
                ? 'border-[#b8956b] text-[#6b4724]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <Users className="w-4 h-4" />
            Thành viên Gia hệ ({members.length})
          </button>
          <button
            onClick={() => setAdminTab('announcements')}
            className={`px-4 py-2.5 font-bold text-xs uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition ${
              adminTab === 'announcements'
                ? 'border-[#b8956b] text-[#6b4724]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <Bell className="w-4 h-4" />
            Thông báo dòng họ ({announcements.length})
          </button>
          <button
            onClick={() => setAdminTab('logs')}
            className={`px-4 py-2.5 font-bold text-xs uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition ${
              adminTab === 'logs'
                ? 'border-[#b8956b] text-[#6b4724]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <Activity className="w-4 h-4" />
            Nhật ký sửa đổi ({logs.length})
          </button>
        </div>

        {/* 1. MEMBERS LISTING & CRUD */}
        {adminTab === 'members' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-[#fdfbf7] p-3 rounded-lg border border-[#f4f0e6]">
              <span className="text-xs text-gray-500 font-semibold">Thêm, sửa thông tin chi tiết hoặc tạ thế cho con cháu.</span>
              <button
                onClick={handleOpenAddMember}
                className="px-4 py-2 bg-[#b8956b] text-white text-xs font-bold rounded-lg hover:bg-[#8b7355] transition flex items-center gap-1"
              >
                <PlusCircle className="w-4 h-4" />
                Thêm thành viên mới
              </button>
            </div>

            <div className="overflow-x-auto border border-[#eadecb] rounded-xl">
              <table className="w-full text-left text-sm divide-y divide-[#eadecb]">
                <thead className="bg-[#f4f0e6] text-[#6b4724]">
                  <tr>
                    <th className="p-3 font-bold text-xs uppercase">Họ & Tên</th>
                    <th className="p-3 font-bold text-xs uppercase">Đời thứ</th>
                    <th className="p-3 font-bold text-xs uppercase">Vai trò phả hệ</th>
                    <th className="p-3 font-bold text-xs uppercase">Chi / Ngành</th>
                    <th className="p-3 font-bold text-xs uppercase">Trạng thái</th>
                    <th className="p-3 font-bold text-xs uppercase text-right">Tùy chọn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white text-gray-700">
                  {members.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="p-3 font-bold text-[#6b4724]">{m.name}</td>
                      <td className="p-3">Đời {m.generation}</td>
                      <td className="p-3 text-xs font-semibold text-gray-500">{m.role}</td>
                      <td className="p-3 text-xs">{m.branch}</td>
                      <td className="p-3">
                        {m.isDeceased ? (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 border border-gray-200 text-[10px] font-bold rounded-full">Đã khuất †</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-bold rounded-full">Tại thế</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => handleOpenEditMember(m)}
                            className="p-1.5 bg-blue-50 text-blue-600 rounded border border-blue-200 hover:bg-blue-100 transition"
                            title="Sửa"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {/* Protect critical root elements from simple delete */}
                          {m.id !== 'nghiem-dieu' && m.id !== 'nghiem-cung' ? (
                            <button
                              onClick={() => {
                                if (confirm(`Bạn có chắc chắn muốn xóa thành viên ${m.name} ra khỏi gia hệ dòng họ?`)) {
                                  onDeleteMember(m.id);
                                }
                              }}
                              className="p-1.5 bg-red-50 text-red-600 rounded border border-red-200 hover:bg-red-100 transition"
                              title="Xóa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className="p-1.5 bg-gray-50 text-gray-300 rounded border border-gray-100 cursor-not-allowed">
                              <Trash2 className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. ANNOUNCEMENTS LISTING & CRUD */}
        {adminTab === 'announcements' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-[#fdfbf7] p-3 rounded-lg border border-[#f4f0e6]">
              <span className="text-xs text-gray-500 font-semibold">Đăng thông báo giỗ tạ, quyên góp trùng tu nhà họ.</span>
              <button
                onClick={() => setIsAnnModalOpen(true)}
                className="px-4 py-2 bg-[#b8956b] text-white text-xs font-bold rounded-lg hover:bg-[#8b7355] transition flex items-center gap-1"
              >
                <PlusCircle className="w-4 h-4" />
                Đăng thông báo mới
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {announcements.map((ann) => (
                <div key={ann.id} className="border border-[#eadecb] rounded-xl p-5 bg-white flex justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        ann.type === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {ann.type === 'urgent' ? 'Khẩn cấp' : 'Bản tin'}
                      </span>
                      <span className="text-xs text-gray-400">{ann.date}</span>
                    </div>
                    <h4 className="font-bold text-sm text-[#6b4724]">{ann.title}</h4>
                    <p className="text-xs text-gray-500 line-clamp-3">{ann.content}</p>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Bạn có chắc muốn gỡ bỏ thông báo "${ann.title}"?`)) {
                        onDeleteAnnouncement(ann.id);
                      }
                    }}
                    className="p-1.5 bg-red-50 text-red-600 rounded border border-red-200 hover:bg-red-100 h-fit self-start transition"
                    title="Gỡ bỏ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. SYSTEM LOGS */}
        {adminTab === 'logs' && (
          <div className="space-y-4">
            <div className="bg-[#fdfbf7] p-3 rounded-lg border border-[#f4f0e6] text-xs text-gray-500 font-semibold">
              Nhật ký lưu lại tất cả hành vi sửa đổi dữ liệu dòng họ để đảm bảo tính an ninh, toàn vẹn của gia phả.
            </div>

            <div className="border border-[#eadecb] rounded-xl overflow-hidden bg-white max-h-[400px] overflow-y-auto divide-y divide-gray-100 text-xs">
              {logs.map((log) => (
                <div key={log.id} className="p-3 hover:bg-gray-50 flex justify-between items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#b8956b] rounded-full"></span>
                    <span className="text-gray-600">
                      Tài khoản <strong>{log.user}</strong> {log.action}
                    </span>
                  </div>
                  <span className="text-gray-400 flex-shrink-0 font-medium">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MEMBER EDIT / ADD FORM MODAL */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden border border-[#b8956b] shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-[#6b4724] to-[#8b7355] text-white flex justify-between items-center">
              <h3 className="text-lg font-bold font-serif uppercase tracking-wider">
                {editingMember ? `Cập nhật thông tin: ${editingMember.name}` : 'Thêm thành viên phả hệ mới'}
              </h3>
              <button
                onClick={() => setIsMemberModalOpen(false)}
                className="text-white/80 hover:text-white text-2xl font-bold leading-none bg-white/10 hover:bg-white/20 px-2 rounded-full"
              >
                &times;
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleMemberSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-[#4a331a]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Name */}
                <div>
                  <label className="block font-bold text-[#6b4724] mb-1">Họ và Tên (*):</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 border border-[#d6b583] rounded bg-[#fdfbf7] focus:outline-none focus:ring-2 focus:ring-[#b8956b]"
                    placeholder="Ví dụ: Nghiêm Xuân Tuấn"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block font-bold text-[#6b4724] mb-1">Vai trò trong dòng họ (*):</label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full p-2 border border-[#d6b583] rounded bg-[#fdfbf7] focus:outline-none focus:ring-2 focus:ring-[#b8956b]"
                    placeholder="Ví dụ: Trưởng nam, Con gái cả, Cô út..."
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block font-bold text-[#6b4724] mb-1">Giới tính:</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1.5 font-semibold">
                      <input
                        type="radio"
                        checked={gender === 'male'}
                        onChange={() => setGender('male')}
                        name="gender"
                      />
                      Nam
                    </label>
                    <label className="flex items-center gap-1.5 font-semibold">
                      <input
                        type="radio"
                        checked={gender === 'female'}
                        onChange={() => setGender('female')}
                        name="gender"
                      />
                      Nữ
                    </label>
                  </div>
                </div>

                {/* Generation */}
                <div>
                  <label className="block font-bold text-[#6b4724] mb-1">Thế hệ đời thứ:</label>
                  <select
                    value={generation}
                    onChange={(e) => setGeneration(Number(e.target.value))}
                    className="w-full p-2 border border-[#d6b583] rounded bg-white focus:outline-none focus:ring-2 focus:ring-[#b8956b]"
                  >
                    <option value={15}>Đời thứ 15 (Cụ tổ)</option>
                    <option value={16}>Đời thứ 16</option>
                    <option value={17}>Đời thứ 17</option>
                    <option value={18}>Đời thứ 18</option>
                    <option value={19}>Đời thứ 19 (Cháu cố)</option>
                    <option value={20}>Đời thứ 20</option>
                  </select>
                </div>

                {/* Branch */}
                <div>
                  <label className="block font-bold text-[#6b4724] mb-1">Thuộc Chi / Ngành nào:</label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full p-2 border border-[#d6b583] rounded bg-white focus:outline-none focus:ring-2 focus:ring-[#b8956b]"
                  >
                    <option value="Nhánh chính">Nhánh chính</option>
                    <option value="Chi Cụ Bà Cả">Chi Cụ Bà Cả</option>
                    <option value="Chi Cụ Bà Hai">Chi Cụ Bà Hai</option>
                  </select>
                </div>

                {/* Deceased Toggle */}
                <div>
                  <label className="block font-bold text-[#6b4724] mb-1">Trạng thái sống:</label>
                  <label className="flex items-center gap-1.5 font-semibold">
                    <input
                      type="checkbox"
                      checked={isDeceased}
                      onChange={(e) => setIsDeceased(e.target.checked)}
                    />
                    Đã khuất (Tạ thế) †
                  </label>
                </div>

                {/* Birth Year */}
                <div>
                  <label className="block font-bold text-[#6b4724] mb-1">Năm sinh:</label>
                  <input
                    type="text"
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value)}
                    className="w-full p-2 border border-[#d6b583] rounded bg-[#fdfbf7]"
                    placeholder="Ví dụ: 1949"
                  />
                </div>

                {/* Death Year */}
                {isDeceased && (
                  <div>
                    <label className="block font-bold text-red-600 mb-1">Năm tạ thế †:</label>
                    <input
                      type="text"
                      value={deathYear}
                      onChange={(e) => setDeathYear(e.target.value)}
                      className="w-full p-2 border border-red-300 rounded bg-red-50/50"
                      placeholder="Ví dụ: 2012"
                    />
                  </div>
                )}

                {/* Parent Link */}
                <div>
                  <label className="block font-bold text-[#6b4724] mb-1">Liên kết phụ thân (Cha):</label>
                  <select
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    className="w-full p-2 border border-[#d6b583] rounded bg-white"
                  >
                    <option value="">-- Không có hoặc là Cụ tổ --</option>
                    {members.filter(m => m.gender === 'male').map(m => (
                      <option key={m.id} value={m.id}>{m.name} (Đời {m.generation})</option>
                    ))}
                  </select>
                </div>

                {/* Spouse Link */}
                <div>
                  <label className="block font-bold text-[#6b4724] mb-1">Liên kết hôn phối (Vợ / Chồng):</label>
                  <select
                    value={spouseId}
                    onChange={(e) => setSpouseId(e.target.value)}
                    className="w-full p-2 border border-[#d6b583] rounded bg-white"
                  >
                    <option value="">-- Chưa kết hôn / độc thân --</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.name} (Đời {m.generation})</option>
                    ))}
                  </select>
                </div>

                {/* Occupation */}
                <div>
                  <label className="block font-bold text-[#6b4724] mb-1">Nghề nghiệp / Học vị:</label>
                  <input
                    type="text"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="w-full p-2 border border-[#d6b583] rounded bg-[#fdfbf7]"
                    placeholder="Ví dụ: Kỹ sư xây dựng, Giáo viên..."
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block font-bold text-[#6b4724] mb-1">Số điện thoại liên hệ:</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2 border border-[#d6b583] rounded bg-[#fdfbf7]"
                    placeholder="Ví dụ: 0912345678"
                  />
                </div>

                {/* Address */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block font-bold text-[#6b4724] mb-1">Địa chỉ sinh sống / Nơi an táng:</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-2 border border-[#d6b583] rounded bg-[#fdfbf7]"
                    placeholder="Ví dụ: Hòa Xá, Ứng Hòa, Hà Nội"
                  />
                </div>

                {/* Story Biography */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block font-bold text-[#6b4724] mb-1">Tiểu sử vắn tắt / Đóng góp dòng họ:</label>
                  <textarea
                    rows={3}
                    value={story}
                    onChange={(e) => setStory(e.target.value)}
                    className="w-full p-2 border border-[#d6b583] rounded bg-[#fdfbf7] resize-none"
                    placeholder="Ví dụ: Là người đôn hậu hiền đức, cống hiến hết lòng..."
                  />
                </div>

              </div>

              {/* Submit panel */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[#f4f0e6]">
                <button
                  type="button"
                  onClick={() => setIsMemberModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 font-semibold"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#b8956b] hover:bg-[#8b7355] text-white font-bold rounded-lg flex items-center gap-1"
                >
                  <Save className="w-4 h-4" />
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ANNOUNCEMENT ADD MODAL */}
      {isAnnModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden border border-[#b8956b] shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-[#6b4724] to-[#8b7355] text-white flex justify-between items-center">
              <h3 className="text-lg font-bold font-serif uppercase tracking-wider">
                Đăng Thông Báo Dòng Họ Mới
              </h3>
              <button
                onClick={() => setIsAnnModalOpen(false)}
                className="text-white/80 hover:text-white text-2xl font-bold leading-none bg-white/10 hover:bg-white/20 px-2 rounded-full"
              >
                &times;
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAnnSubmit} className="p-6 space-y-4 text-xs text-[#4a331a]">
              {/* Title */}
              <div>
                <label className="block font-bold text-[#6b4724] mb-1">Tiêu đề thông báo (*):</label>
                <input
                  type="text"
                  required
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  className="w-full p-2.5 border border-[#d6b583] rounded bg-[#fdfbf7] font-semibold"
                  placeholder="Ví dụ: Lễ hội giỗ tổ gia đình sắp diễn ra..."
                />
              </div>

              {/* Type */}
              <div>
                <label className="block font-bold text-[#6b4724] mb-1">Nhóm thông báo:</label>
                <select
                  value={annType}
                  onChange={(e) => setAnnType(e.target.value as any)}
                  className="w-full p-2.5 border border-[#d6b583] rounded bg-white"
                >
                  <option value="update">Bản tin thường niên</option>
                  <option value="urgent">Tin Khẩn Cấp / Quyên Góp</option>
                  <option value="event">Sự Kiện Lễ Giỗ</option>
                </select>
              </div>

              {/* Content */}
              <div>
                <label className="block font-bold text-[#6b4724] mb-1">Nội dung chi tiết (*):</label>
                <textarea
                  rows={5}
                  required
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  className="w-full p-2.5 border border-[#d6b583] rounded bg-[#fdfbf7] resize-none"
                  placeholder="Điền đầy đủ nội dung thông tin dòng họ muốn phổ biến..."
                />
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[#f4f0e6]">
                <button
                  type="button"
                  onClick={() => setIsAnnModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 font-semibold"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#b8956b] hover:bg-[#8b7355] text-white font-bold rounded-lg flex items-center gap-1"
                >
                  <Save className="w-4 h-4" />
                  Đăng ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
