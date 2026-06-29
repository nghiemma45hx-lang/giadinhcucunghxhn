import React, { useState, useMemo } from 'react';
import { Table, Calendar, MapPin, Phone, User, Award, Search, ArrowUpDown, Shield, PlusCircle, Edit2, Trash2, X, Plus } from 'lucide-react';
import { FamilyMember } from '../types';

interface MemberTableViewProps {
  members: FamilyMember[];
  onAddMember?: (member: FamilyMember) => void;
  onEditMember?: (member: FamilyMember) => void;
  onDeleteMember?: (id: string) => void;
  currentUser?: { username: string; fullName: string; role: string } | null;
  onOpenLogin?: () => void;
}

export default function MemberTableView({
  members,
  onAddMember,
  onEditMember,
  onDeleteMember,
  currentUser,
  onOpenLogin,
}: MemberTableViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [generationFilter, setGenerationFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof FamilyMember>('generation');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Form & Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [generation, setGeneration] = useState(18);
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

  // Filter members
  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (m.role && m.role.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (m.branch && m.branch.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesGen = generationFilter === 'all' ? true : m.generation.toString() === generationFilter;
      return matchesSearch && matchesGen;
    });
  }, [members, searchTerm, generationFilter]);

  // Unique generations list for dropdown
  const uniqueGenerations = useMemo(() => {
    const gens = members.map(m => m.generation);
    return Array.from(new Set(gens)).sort((a, b) => a - b);
  }, [members]);

  // Sort logic
  const sortedMembers = useMemo(() => {
    const sorted = [...filteredMembers];
    sorted.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (aVal === undefined) return sortAsc ? 1 : -1;
      if (bVal === undefined) return sortAsc ? -1 : 1;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortAsc ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
    return sorted;
  }, [filteredMembers, sortField, sortAsc]);

  const toggleSort = (field: keyof FamilyMember) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Open modal to add a member
  const handleOpenAddModal = () => {
    if (!currentUser) {
      if (onOpenLogin) {
        onOpenLogin();
      } else {
        alert('Vui lòng đăng nhập bằng tài khoản quản trị để thực hiện tính năng này!');
      }
      return;
    }
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
    setIsModalOpen(true);
  };

  // Open modal to edit a member
  const handleOpenEditModal = (member: FamilyMember) => {
    if (!currentUser) {
      if (onOpenLogin) {
        onOpenLogin();
      } else {
        alert('Vui lòng đăng nhập bằng tài khoản quản trị để thực hiện tính năng này!');
      }
      return;
    }
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
    setIsModalOpen(true);
  };

  // Switch form context to another member (Edit/Navigate)
  const handleSwitchToMember = (targetMember: FamilyMember) => {
    setEditingMember(targetMember);
    setName(targetMember.name);
    setGender(targetMember.gender);
    setGeneration(targetMember.generation);
    setRole(targetMember.role);
    setBirthYear(targetMember.birthYear || '');
    setDeathYear(targetMember.deathYear || '');
    setIsDeceased(targetMember.isDeceased);
    setParentId(targetMember.parentId || '');
    setSpouseId(targetMember.spouseId || '');
    setBranch(targetMember.branch);
    setStory(targetMember.story || '');
    setOccupation(targetMember.occupation || '');
    setAddress(targetMember.address || '');
    setPhone(targetMember.phone || '');
  };

  // Bầu đoàn nhà cụ/ông/bác/anh calculations
  const fatherInfo = useMemo(() => {
    return parentId ? members.find(m => m.id === parentId) : null;
  }, [parentId, members]);

  const fatherSiblings = useMemo(() => {
    if (!fatherInfo) return [];
    const gParentId = fatherInfo.parentId;
    if (!gParentId) return [];
    return members.filter(m => m.parentId === gParentId && m.id !== fatherInfo.id);
  }, [fatherInfo, members]);

  const familySiblings = useMemo(() => {
    if (!parentId) return [];
    return members.filter(m => m.parentId === parentId && m.id !== (editingMember?.id || ''));
  }, [parentId, editingMember, members]);

  // Handle member form submit
  const handleSubmit = (e: React.FormEvent) => {
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
      if (onEditMember) {
        onEditMember(payload);
        alert(`Đã cập nhật thông tin cụ/thành viên: ${name}`);
      }
    } else {
      if (onAddMember) {
        onAddMember(payload);
        alert(`Đã thêm thành công thành viên: ${name} vào gia hệ.`);
      }
    }

    setIsModalOpen(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 flex flex-col gap-6">
      <div className="bg-white rounded-xl shadow-sm border border-[#eadecb] p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#6b4724] font-serif mb-2 flex items-center gap-2">
              <Table className="w-6 h-6 text-[#b8956b]" />
              Danh Sách Phả Hệ Chi Tiết
            </h2>
            <p className="text-sm text-gray-500">
              Bảng tra cứu trực quan tất cả các cụ, thành viên thế hệ dòng họ Nghiêm Cung.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
            {/* Search Box */}
            <div className="relative flex-1 md:w-64">
              <input
                type="text"
                placeholder="Tìm tên, vai trò..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 pl-8 border border-[#d6b583] rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#b8956b]"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-3" />
            </div>

            {/* Gen select */}
            <select
              value={generationFilter}
              onChange={(e) => setGenerationFilter(e.target.value)}
              className="p-2 border border-[#d6b583] rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#b8956b]"
            >
              <option value="all">Tất cả đời</option>
              {uniqueGenerations.map(gen => (
                <option key={gen} value={gen}>Đời thứ {gen}</option>
              ))}
            </select>

            {/* Add Member Button */}
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-[#b8956b] hover:bg-[#8b7355] text-[#fdfbf7] text-xs font-bold rounded-lg transition flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer border border-[#8b7355]/20"
            >
              <PlusCircle className="w-4 h-4" />
              Thêm Thành Viên
            </button>
          </div>
        </div>

        {/* Members Table */}
        <div className="overflow-x-auto rounded-xl border border-[#eadecb]">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-[#fdfbf7] text-[#6b4724] border-b border-[#eadecb] font-bold">
                <th className="p-3.5 cursor-pointer hover:bg-[#f4f0e6] transition" onClick={() => toggleSort('generation')}>
                  Đời <ArrowUpDown className="w-3 h-3 inline ml-1 text-gray-400" />
                </th>
                <th className="p-3.5 cursor-pointer hover:bg-[#f4f0e6] transition" onClick={() => toggleSort('name')}>
                  Họ & Tên <ArrowUpDown className="w-3 h-3 inline ml-1 text-gray-400" />
                </th>
                <th className="p-3.5 cursor-pointer hover:bg-[#f4f0e6] transition" onClick={() => toggleSort('gender')}>
                  Giới tính <ArrowUpDown className="w-3 h-3 inline ml-1 text-gray-400" />
                </th>
                <th className="p-3.5 cursor-pointer hover:bg-[#f4f0e6] transition" onClick={() => toggleSort('role')}>
                  Vai Trò <ArrowUpDown className="w-3 h-3 inline ml-1 text-gray-400" />
                </th>
                <th className="p-3.5 cursor-pointer hover:bg-[#f4f0e6] transition" onClick={() => toggleSort('branch')}>
                  Chi Nhánh <ArrowUpDown className="w-3 h-3 inline ml-1 text-gray-400" />
                </th>
                <th className="p-3.5">Trạng Thái</th>
                <th className="p-3.5">Năm Sinh/Mất</th>
                <th className="p-3.5">Địa Chỉ</th>
                <th className="p-3.5">Điện Thoại</th>
                {currentUser && <th className="p-3.5 text-right">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f4f0e6] text-gray-700">
              {sortedMembers.length > 0 ? (
                sortedMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-[#fdfbf7]/60 transition">
                    <td className="p-3.5 font-bold text-[#b8956b]">Đời {m.generation}</td>
                    <td className="p-3.5 font-semibold text-[#6b4724]">{m.name}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        m.gender === 'male' 
                          ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                          : 'bg-rose-50 text-rose-700 border border-rose-100'
                      }`}>
                        {m.gender === 'male' ? 'Nam' : 'Nữ'}
                      </span>
                    </td>
                    <td className="p-3.5 font-medium text-gray-500 uppercase text-[10px]">{m.role}</td>
                    <td className="p-3.5 text-gray-600 font-medium">{m.branch}</td>
                    <td className="p-3.5">
                      {m.isDeceased ? (
                        <span className="text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded text-[10px] font-bold">
                          Đã tạ thế †
                        </span>
                      ) : (
                        <span className="text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded text-[10px] font-bold">
                          Tại thế
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-gray-500">
                      {m.birthYear ? m.birthYear : 'Chưa rõ'} {m.isDeceased && m.deathYear ? `- ${m.deathYear}` : ''}
                    </td>
                    <td className="p-3.5 max-w-[150px] truncate text-gray-500" title={m.address}>
                      {m.address || 'Hòa Xá'}
                    </td>
                    <td className="p-3.5 text-gray-500">{m.phone || '—'}</td>
                    {currentUser && (
                      <td className="p-3.5 text-right flex justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(m)}
                          className="p-1.5 bg-[#fdfbf7] text-[#6b4724] hover:bg-[#eadecb] rounded border border-[#eadecb] transition cursor-pointer"
                          title="Chỉnh sửa thông tin"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Bạn có chắc chắn muốn xóa thành viên ${m.name} khỏi gia phả? Hành động này sẽ được đồng bộ lên hệ thống.`)) {
                              onDeleteMember?.(m.id);
                            }
                          }}
                          className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded border border-rose-200 transition cursor-pointer"
                          title="Xóa thành viên"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={currentUser ? 10 : 9} className="p-8 text-center text-gray-400 font-medium">
                    Không tìm thấy thành viên nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MEMBER EDIT / ADD FORM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden border border-[#b8956b] shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-[#6b4724] to-[#8b7355] text-white flex justify-between items-center">
              <h3 className="text-lg font-bold font-serif uppercase tracking-wider">
                {editingMember ? `Cập nhật thông tin: ${editingMember.name}` : 'Thêm thành viên phả hệ mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white text-2xl font-bold leading-none bg-white/10 hover:bg-white/20 px-2 rounded-full cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-[#4a331a]">
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
                    <label className="flex items-center gap-1.5 font-semibold cursor-pointer">
                      <input
                        type="radio"
                        checked={gender === 'male'}
                        onChange={() => setGender('male')}
                        name="gender"
                        className="cursor-pointer"
                      />
                      Nam
                    </label>
                    <label className="flex items-center gap-1.5 font-semibold cursor-pointer">
                      <input
                        type="radio"
                        checked={gender === 'female'}
                        onChange={() => setGender('female')}
                        name="gender"
                        className="cursor-pointer"
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
                    className="w-full p-2 border border-[#d6b583] rounded bg-white focus:outline-none focus:ring-2 focus:ring-[#b8956b] cursor-pointer"
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
                    className="w-full p-2 border border-[#d6b583] rounded bg-white focus:outline-none focus:ring-2 focus:ring-[#b8956b] cursor-pointer"
                  >
                    <option value="Nhánh chính">Nhánh chính</option>
                    <option value="Chi Cụ Bà Cả">Chi Cụ Bà Cả</option>
                    <option value="Chi Cụ Bà Hai">Chi Cụ Bà Hai</option>
                  </select>
                </div>

                {/* Deceased Toggle */}
                <div>
                  <label className="block font-bold text-[#6b4724] mb-1">Trạng thái sống:</label>
                  <label className="flex items-center gap-1.5 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isDeceased}
                      onChange={(e) => setIsDeceased(e.target.checked)}
                      className="cursor-pointer"
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
                    className="w-full p-2 border border-[#d6b583] rounded bg-[#fdfbf7] focus:outline-none focus:ring-2 focus:ring-[#b8956b]"
                    placeholder="Ví dụ: 1949"
                  />
                </div>

                {/* Death Year */}
                {isDeceased && (
                  <div>
                    <label className="block font-bold text-rose-600 mb-1">Năm tạ thế †:</label>
                    <input
                      type="text"
                      value={deathYear}
                      onChange={(e) => setDeathYear(e.target.value)}
                      className="w-full p-2 border border-rose-300 rounded bg-rose-50/50 focus:outline-none focus:ring-2 focus:ring-rose-400"
                      placeholder="Ví dụ: 2012"
                    />
                  </div>
                )}

                {/* Parent Link */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-[#6b4724]">Liên kết phụ thân (Cha):</label>
                    {parentId && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const target = members.find(m => m.id === parentId);
                            if (target) handleSwitchToMember(target);
                          }}
                          className="text-[10px] text-amber-800 hover:underline font-bold cursor-pointer"
                        >
                          Sửa Cha
                        </button>
                        <button
                          type="button"
                          onClick={() => setParentId('')}
                          className="text-[10px] text-rose-600 hover:underline font-bold cursor-pointer"
                        >
                          Hủy liên kết
                        </button>
                      </div>
                    )}
                  </div>
                  <select
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    className="w-full p-2 border border-[#d6b583] rounded bg-white focus:outline-none focus:ring-2 focus:ring-[#b8956b] cursor-pointer"
                  >
                    <option value="">-- Không có hoặc là Cụ tổ --</option>
                    {members
                      .filter(m => m.gender === 'male' && m.id !== (editingMember?.id || ''))
                      .map(m => (
                        <option key={m.id} value={m.id}>{m.name} (Đời {m.generation})</option>
                      ))}
                  </select>
                </div>

                {/* Spouse Link */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-[#6b4724]">Liên kết hôn phối (Vợ / Chồng):</label>
                    {spouseId && (
                      <div className="flex gap-2 border border-amber-300 rounded bg-amber-50 px-1.5 py-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            const target = members.find(m => m.id === spouseId);
                            if (target) handleSwitchToMember(target);
                          }}
                          className="text-[10px] text-amber-900 hover:underline font-bold cursor-pointer"
                        >
                          Sửa Vợ/Chồng
                        </button>
                        <button
                          type="button"
                          onClick={() => setSpouseId('')}
                          className="text-[10px] text-rose-700 hover:underline font-bold cursor-pointer"
                        >
                          Hủy liên kết
                        </button>
                      </div>
                    )}
                  </div>
                  <select
                    value={spouseId}
                    onChange={(e) => setSpouseId(e.target.value)}
                    className="w-full p-2 border border-[#d6b583] rounded bg-white focus:outline-none focus:ring-2 focus:ring-[#b8956b] cursor-pointer"
                  >
                    <option value="">-- Chưa kết hôn / độc thân --</option>
                    {members
                      .filter(m => m.id !== (editingMember?.id || ''))
                      .map(m => (
                        <option key={m.id} value={m.id}>{m.name} (Đời {m.generation})</option>
                      ))}
                  </select>
                </div>

                {/* Bầu đoàn dòng tộc card */}
                <div className="col-span-1 md:col-span-2 p-3.5 bg-[#fdfbf7] rounded-xl border border-[#eadecb] space-y-3">
                  <div className="flex justify-between items-center border-b border-[#eadecb] pb-2">
                    <span className="font-bold text-[#6b4724] text-xs flex items-center gap-1.5">
                      👥 Bầu đoàn nhà cụ/ông/bác/anh (Thân tộc liên quan)
                    </span>
                    {fatherInfo && (
                      <span className="text-[10px] bg-[#6b4724] text-white font-bold px-2 py-0.5 rounded-full">
                        Nhà đời {fatherInfo.generation}
                      </span>
                    )}
                  </div>

                  {fatherInfo ? (
                    <div className="space-y-3 text-[11px] text-[#5c4021]">
                      {/* Generation above (Father & Uncles) */}
                      <div>
                        <div className="font-bold text-[#8b7355] mb-1.5 flex items-center gap-1">
                          🔸 Hàng Cụ/Ông/Bác/Chú (Thế hệ của phụ thân):
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {/* Selected Father */}
                          <div className="px-2.5 py-1 bg-[#6b4724] text-[#fdfbf7] rounded-lg font-bold flex items-center gap-1.5 shadow-sm">
                            <span>👨 {fatherInfo.name} (Phụ thân)</span>
                            <button
                              type="button"
                              onClick={() => handleSwitchToMember(fatherInfo)}
                              className="hover:scale-110 text-white/80 hover:text-white ml-1 text-xs cursor-pointer"
                              title="Sửa thông tin phụ thân"
                            >
                              ✏️
                            </button>
                          </div>
                          {/* Uncles */}
                          {fatherSiblings.length > 0 ? (
                            fatherSiblings.map(sib => (
                              <div
                                key={sib.id}
                                onClick={() => handleSwitchToMember(sib)}
                                className="px-2.5 py-1 bg-white hover:bg-[#eadecb]/40 border border-[#d6b583] text-[#6b4724] rounded-lg font-semibold cursor-pointer transition flex items-center gap-1.5 shadow-2xs"
                                title="Bấm để chuyển qua chỉnh sửa"
                              >
                                <span>
                                  {sib.gender === 'male' ? '👨' : '👩'} {sib.name} ({sib.role})
                                </span>
                              </div>
                            ))
                          ) : (
                            <span className="text-gray-400 italic font-medium px-2 py-1">Chưa ghi nhận thông tin anh em ruột khác của cha</span>
                          )}
                        </div>
                      </div>

                      {/* This generation (Siblings / Brothers / Sisters) */}
                      <div>
                        <div className="font-bold text-[#8b7355] mb-1.5 flex items-center gap-1">
                          🔸 Hàng Anh/Chị/Em ruột (Các con khác của phụ thân):
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {/* Current being edited */}
                          {editingMember && (
                            <div className="px-2.5 py-1 bg-[#b8956b] text-[#fdfbf7] rounded-lg font-bold shadow-sm">
                              ✨ {editingMember.name} (Đang sửa)
                            </div>
                          )}
                          {/* Other siblings */}
                          {familySiblings.length > 0 ? (
                            familySiblings.map(sib => (
                              <div
                                key={sib.id}
                                onClick={() => handleSwitchToMember(sib)}
                                className="px-2.5 py-1 bg-white hover:bg-[#eadecb]/40 border border-[#d6b583] text-[#6b4724] rounded-lg font-semibold cursor-pointer transition flex items-center gap-1.5 shadow-2xs"
                                title="Bấm để chuyển qua chỉnh sửa"
                              >
                                <span>
                                  {sib.gender === 'male' ? '👦' : '👧'} {sib.name} ({sib.role})
                                </span>
                              </div>
                            ))
                          ) : (
                            <span className="text-gray-400 italic font-medium px-2 py-1">Chưa ghi nhận anh em ruột khác</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-400 italic font-medium">
                      Hãy chọn Liên kết phụ thân (Cha) ở phía trên để tự động hiển thị bầu đoàn nhà cụ/ông/bác/anh...
                    </div>
                  )}
                </div>

                {/* Occupation */}
                <div>
                  <label className="block font-bold text-[#6b4724] mb-1">Nghề nghiệp / Học vị:</label>
                  <input
                    type="text"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="w-full p-2 border border-[#d6b583] rounded bg-[#fdfbf7] focus:outline-none focus:ring-2 focus:ring-[#b8956b]"
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
                    className="w-full p-2 border border-[#d6b583] rounded bg-[#fdfbf7] focus:outline-none focus:ring-2 focus:ring-[#b8956b]"
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
                    className="w-full p-2 border border-[#d6b583] rounded bg-[#fdfbf7] focus:outline-none focus:ring-2 focus:ring-[#b8956b]"
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
                    className="w-full p-2 border border-[#d6b583] rounded bg-[#fdfbf7] resize-none focus:outline-none focus:ring-2 focus:ring-[#b8956b]"
                    placeholder="Ví dụ: Là người đôn hậu hiền đức, cống hiến hết lòng cho quê hương..."
                  />
                </div>

              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[#f4f0e6]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition font-bold cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-[#6b4724] to-[#8b7355] text-white rounded-lg hover:opacity-90 shadow-md font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  {editingMember ? 'Cập Nhật' : 'Lưu Thành Viên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

