import React, { useState } from 'react';
import { Settings, PlusCircle, Trash2, Edit2, Users, Bell, Activity, Save, X, Plus, Image, Key, Shield } from 'lucide-react';
import { FamilyMember, Announcement, SystemLog, SystemUser } from '../types';

interface AdminViewProps {
  members: FamilyMember[];
  announcements: Announcement[];
  logs: SystemLog[];
  onAddMember: (member: FamilyMember) => void;
  onEditMember: (member: FamilyMember) => void;
  onDeleteMember: (id: string) => void;
  onAddAnnouncement: (announcement: Announcement) => void;
  onDeleteAnnouncement: (id: string) => void;
  // Banner & Gia tộc settings
  settings: Record<string, string>;
  onSaveSetting: (key: string, value: string) => Promise<void>;
  // User Accounts
  users: SystemUser[];
  onAddUser: (user: SystemUser) => Promise<void>;
  onDeleteUser: (username: string) => Promise<void>;
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
  settings,
  onSaveSetting,
  users,
  onAddUser,
  onDeleteUser,
}: AdminViewProps) {
  // Views switching inside Admin panel
  const [adminTab, setAdminTab] = useState<'members' | 'announcements' | 'logs' | 'settings' | 'users'>('members');

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
  const [motherId, setMotherId] = useState('');
  const [spouseId, setSpouseId] = useState('');
  const [spouseIds, setSpouseIds] = useState<string[]>([]);
  const [branch, setBranch] = useState('Chi Cụ Bà Hai');
  const [story, setStory] = useState('');
  const [occupation, setOccupation] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  const [originalParentId, setOriginalParentId] = useState('');
  const [originalMotherId, setOriginalMotherId] = useState('');
  const [originalSpouseId, setOriginalSpouseId] = useState('');
  const [originalSpouseIds, setOriginalSpouseIds] = useState<string[]>([]);
  const [isMarried, setIsMarried] = useState(false);
  const [relationNotes, setRelationNotes] = useState('');
  const [spouseSearch, setSpouseSearch] = useState('');

  // Announcement Form Fields
  const [isAnnModalOpen, setIsAnnModalOpen] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annType, setAnnType] = useState<'urgent' | 'update' | 'event'>('update');

  // Local states for custom settings inputs
  const [settingsHeroTitle, setSettingsHeroTitle] = useState(settings.heroTitle || 'Gia Phả Gia Đình');
  const [settingsHeroSubtitle, setSettingsHeroSubtitle] = useState(settings.heroSubtitle || 'Cụ Nghiêm Cung');
  const [settingsHeroImage, setSettingsHeroImage] = useState(settings.heroImage || 'https://images.unsplash.com/photo-1605369572399-05d8d64a0f6e?q=80&w=2000&auto=format&fit=crop');
  const [settingsIntroText1, setSettingsIntroText1] = useState(settings.introText1 || 'Cây có gốc mới nở cành xanh ngọn, nước có nguồn mới bể rộng sông sâu. Người có tổ tông mới sinh con cháu, hiếu nghĩa vẹn tròn mới rạng rỡ tổ tiên.');
  const [settingsIntroText2, setSettingsIntroText2] = useState(settings.introText2 || 'Gia phả gia đình dòng họ Cụ Nghiêm Cung (kế thừa dòng dõi cụ cố Nghiêm Điều (Chu) tại vùng đất Hòa Xá cổ kính, giàu truyền thống cách mạng) được lập ra nhằm mục đích kính cáo tổ tông, ghi chép tường tận huyết mạch dòng giống, lưu truyền cho con cháu vạn đời sau không bao giờ quên đi nguồn cội thiêng liêng của mình.');
  const [settingsIntroText3, setSettingsIntroText3] = useState(settings.introText3 || 'Trải qua bao thăng trầm của lịch sử, con cháu họ Nghiêm luôn gìn giữ nếp gia phong nghiêm cẩn, lấy hiếu học làm đầu, lấy đức độ làm trọng, lấy trung thực làm gương và hết lòng đùm bọc, giúp đỡ lẫn nhau vượt qua gian khó, lập thân kiến nghiệp làm rạng danh gia đình.');

  // Local states for custom user provisioning
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'user'>('admin');

  // Synchronize dynamic settings once loaded
  React.useEffect(() => {
    if (settings.heroTitle) setSettingsHeroTitle(settings.heroTitle);
    if (settings.heroSubtitle) setSettingsHeroSubtitle(settings.heroSubtitle);
    if (settings.heroImage) setSettingsHeroImage(settings.heroImage);
    if (settings.introText1) setSettingsIntroText1(settings.introText1);
    if (settings.introText2) setSettingsIntroText2(settings.introText2);
    if (settings.introText3) setSettingsIntroText3(settings.introText3);
  }, [settings]);

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
    setMotherId('');
    setSpouseId('');
    setSpouseIds([]);
    setBranch('Chi Cụ Bà Hai');
    setStory('');
    setOccupation('');
    setAddress('');
    setPhone('');
    setOriginalParentId('');
    setOriginalMotherId('');
    setOriginalSpouseId('');
    setOriginalSpouseIds([]);
    setIsMarried(false);
    setRelationNotes('');
    setSpouseSearch('');
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
    setMotherId(member.motherId || '');
    setSpouseId(member.spouseId || '');
    const initialSpouseIds = member.spouseIds || (member.spouseId ? [member.spouseId] : []);
    setSpouseIds(initialSpouseIds);
    setBranch(member.branch);
    
    // Parse story for relationNotes
    const parts = (member.story || '').split(' ||| ');
    const mainStory = parts[0] || '';
    const relNotes = parts[1] || '';
    setStory(mainStory);
    setRelationNotes(relNotes);
    
    setOccupation(member.occupation || '');
    setAddress(member.address || '');
    setPhone(member.phone || '');
    setOriginalParentId(member.parentId || '');
    setOriginalMotherId(member.motherId || '');
    setOriginalSpouseId(member.spouseId || '');
    setOriginalSpouseIds(initialSpouseIds);
    setIsMarried(member.isMarried || !!member.spouseId || initialSpouseIds.length > 0 || false);
    setSpouseSearch('');
    setIsMemberModalOpen(true);
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
    setMotherId(targetMember.motherId || '');
    setSpouseId(targetMember.spouseId || '');
    const initialSpouseIds = targetMember.spouseIds || (targetMember.spouseId ? [targetMember.spouseId] : []);
    setSpouseIds(initialSpouseIds);
    setBranch(targetMember.branch);
    
    // Parse story for relationNotes
    const parts = (targetMember.story || '').split(' ||| ');
    const mainStory = parts[0] || '';
    const relNotes = parts[1] || '';
    setStory(mainStory);
    setRelationNotes(relNotes);

    setOccupation(targetMember.occupation || '');
    setAddress(targetMember.address || '');
    setPhone(targetMember.phone || '');
    setOriginalParentId(targetMember.parentId || '');
    setOriginalMotherId(targetMember.motherId || '');
    setOriginalSpouseId(targetMember.spouseId || '');
    setOriginalSpouseIds(initialSpouseIds);
    setIsMarried(targetMember.isMarried || !!targetMember.spouseId || initialSpouseIds.length > 0 || false);
    setSpouseSearch('');
  };

  // Bầu đoàn nhà cụ/ông/bác/anh calculations
  const fatherInfo = React.useMemo(() => {
    return parentId ? members.find(m => m.id === parentId) : null;
  }, [parentId, members]);

  const fatherSiblings = React.useMemo(() => {
    if (!fatherInfo) return [];
    const gParentId = fatherInfo.parentId;
    if (!gParentId) return [];
    return members.filter(m => m.parentId === gParentId && m.id !== fatherInfo.id);
  }, [fatherInfo, members]);

  const familySiblings = React.useMemo(() => {
    if (!parentId) return [];
    return members.filter(m => m.parentId === parentId && m.id !== (editingMember?.id || ''));
  }, [parentId, editingMember, members]);

  // Handle member submit
  const handleMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Name and Role are no longer mandatory as requested: (*) không bắt buộc ghi tên; ghi vai vế

    const finalName = name.trim() || 'Khuyết danh';
    const finalRole = role.trim() || 'Chưa rõ vai vế';

    const payload: FamilyMember = {
      id: editingMember ? editingMember.id : `mem-${Date.now()}`,
      name: finalName,
      gender,
      generation: Number(generation),
      role: finalRole,
      birthYear: birthYear.trim() || undefined,
      deathYear: isDeceased ? (deathYear.trim() || undefined) : undefined,
      isDeceased,
      parentId: parentId || undefined,
      motherId: motherId || undefined,
      spouseId: isMarried ? ((spouseIds && spouseIds.length > 0) ? spouseIds[0] : (spouseId || undefined)) : undefined,
      spouseIds: isMarried && spouseIds && spouseIds.length > 0 ? spouseIds : undefined,
      isMarried: isMarried || undefined,
      branch,
      story: relationNotes.trim() ? `${story.trim()} ||| ${relationNotes.trim()}` : story.trim() || undefined,
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

  const parseYearStr = (str: string): number => {
    if (!str) return NaN;
    const cleaned = str.trim();
    const match = cleaned.match(/\b\d{4}\b/);
    if (match) return parseInt(match[0], 10);
    return parseInt(cleaned, 10);
  };

  const getCanChi = (yearStr: string): string => {
    const year = parseYearStr(yearStr);
    if (!year || isNaN(year)) return '';
    const cans = ['Canh', 'Tân', 'Nhâm', 'Quý', 'Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ'];
    const chis = ['Thân', 'Dậu', 'Tuất', 'Hợi', 'Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi'];
    const canIndex = year % 10;
    const chiIndex = year % 12;
    return `${cans[canIndex]} ${chis[chiIndex]}`;
  };

  const getAgeAndLifespanText = () => {
    const bYear = parseYearStr(birthYear);
    if (!bYear || isNaN(bYear)) return null;

    const birthLunar = getCanChi(birthYear);
    const currentYear = 2026;

    if (isDeceased) {
      const dYear = parseYearStr(deathYear);
      if (!dYear || isNaN(dYear)) {
        return {
          birthLunar,
          deathLunar: '',
          ageText: `Sinh năm ${birthYear} (${birthLunar}). Trạng thái: Đã tạ thế.`
        };
      }
      const deathLunar = getCanChi(deathYear);
      const ageDiff = dYear - bYear;
      return {
        birthLunar,
        deathLunar,
        ageText: `Sinh: ${birthYear} (${birthLunar}) — Mất: ${deathYear} (${deathLunar}). Tuổi mất: ${ageDiff} tuổi`
      };
    } else {
      const ageDiff = currentYear - bYear;
      return {
        birthLunar,
        deathLunar: '',
        ageText: `Sinh: ${birthYear} (${birthLunar}). Tuổi hiện tại: ${ageDiff} tuổi`
      };
    }
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

  const handleSaveBannerSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSaveSetting('heroTitle', settingsHeroTitle);
      await onSaveSetting('heroSubtitle', settingsHeroSubtitle);
      await onSaveSetting('heroImage', settingsHeroImage);
      await onSaveSetting('introText1', settingsIntroText1);
      await onSaveSetting('introText2', settingsIntroText2);
      await onSaveSetting('introText3', settingsIntroText3);
      alert('Đã cập nhật cấu hình Banner và thông tin giới thiệu Gia tộc thành công!');
    } catch (err) {
      alert('Đã xảy ra lỗi khi lưu cấu hình.');
    }
  };

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim() || !newFullName.trim()) {
      alert('Vui lòng điền đầy đủ tài khoản, mật khẩu và tên hiển thị.');
      return;
    }
    const payload: SystemUser = {
      username: newUsername.trim().toLowerCase(),
      password: newPassword.trim(),
      fullName: newFullName.trim(),
      role: newUserRole
    };
    try {
      await onAddUser(payload);
      setNewUsername('');
      setNewPassword('');
      setNewFullName('');
      alert(`Đã cấp tài khoản quản trị thành công cho: ${payload.username}`);
    } catch (err) {
      alert('Không thể tạo tài khoản lúc này.');
    }
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
          <button
            onClick={() => setAdminTab('settings')}
            className={`px-4 py-2.5 font-bold text-xs uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition ${
              adminTab === 'settings'
                ? 'border-[#b8956b] text-[#6b4724]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <Image className="w-4 h-4" />
            Cấu hình Banner & Gia Tộc
          </button>
          <button
            onClick={() => setAdminTab('users')}
            className={`px-4 py-2.5 font-bold text-xs uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition ${
              adminTab === 'users'
                ? 'border-[#b8956b] text-[#6b4724]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <Key className="w-4 h-4" />
            Cấp Tài Khoản ({users.length + 1})
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

        {/* 4. HERO BANNER & GIA TỘC CONFIGURATION */}
        {adminTab === 'settings' && (
          <form onSubmit={handleSaveBannerSettings} className="space-y-5 text-xs text-[#4a331a]">
            <div className="bg-[#fdfbf7] p-4 rounded-xl border border-[#eadecb] space-y-4">
              <h3 className="text-sm font-bold text-[#6b4724] font-serif uppercase tracking-wider flex items-center gap-1.5 border-b border-[#eadecb] pb-2">
                <Image className="w-4 h-4 text-[#b8956b]" />
                Cấu hình Hero Banner & Tiêu đề trang chủ
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#6b4724] mb-1">Tiêu đề Banner chính (Chữ lớn):</label>
                  <input
                    type="text"
                    required
                    value={settingsHeroTitle}
                    onChange={(e) => setSettingsHeroTitle(e.target.value)}
                    className="w-full p-2.5 border border-[#d6b583] rounded bg-white font-medium focus:ring-1 focus:ring-[#b8956b] focus:outline-none"
                    placeholder="Ví dụ: Gia Phả Gia Đình"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#6b4724] mb-1">Tiêu đề phụ Banner (Chữ vàng):</label>
                  <input
                    type="text"
                    required
                    value={settingsHeroSubtitle}
                    onChange={(e) => setSettingsHeroSubtitle(e.target.value)}
                    className="w-full p-2.5 border border-[#d6b583] rounded bg-white font-medium focus:ring-1 focus:ring-[#b8956b] focus:outline-none"
                    placeholder="Ví dụ: Cụ Nghiêm Cung"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold text-[#6b4724] mb-1">Đường dẫn ảnh nền Banner (URL Ảnh):</label>
                  <input
                    type="text"
                    required
                    value={settingsHeroImage}
                    onChange={(e) => setSettingsHeroImage(e.target.value)}
                    className="w-full p-2.5 border border-[#d6b583] rounded bg-white font-mono focus:ring-1 focus:ring-[#b8956b] focus:outline-none"
                    placeholder="Nhập link hình ảnh Unsplash hoặc CDN bất kỳ..."
                  />
                  <div className="mt-2 text-[10px] text-gray-400">
                    Mẹo: Bạn có thể nhập bất kỳ địa chỉ ảnh trực tuyến nào để thay đổi diện mạo trang trọng cho Header dòng tộc.
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#fdfbf7] p-4 rounded-xl border border-[#eadecb] space-y-4">
              <h3 className="text-sm font-bold text-[#6b4724] font-serif uppercase tracking-wider flex items-center gap-1.5 border-b border-[#eadecb] pb-2">
                <Settings className="w-4 h-4 text-[#b8956b]" />
                Cấu hình Lời tựa giới thiệu Gia tộc
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-[#6b4724] mb-1">Đoạn giới thiệu 1 (Mở đầu văn hoa):</label>
                  <textarea
                    rows={2}
                    value={settingsIntroText1}
                    onChange={(e) => setSettingsIntroText1(e.target.value)}
                    className="w-full p-2.5 border border-[#d6b583] rounded bg-white font-medium focus:ring-1 focus:ring-[#b8956b] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#6b4724] mb-1">Đoạn giới thiệu 2 (Chi tiết chi nhánh, quê hương):</label>
                  <textarea
                    rows={3}
                    value={settingsIntroText2}
                    onChange={(e) => setSettingsIntroText2(e.target.value)}
                    className="w-full p-2.5 border border-[#d6b583] rounded bg-white font-medium focus:ring-1 focus:ring-[#b8956b] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#6b4724] mb-1">Đoạn giới thiệu 3 (Tuyên ngôn truyền thống):</label>
                  <textarea
                    rows={3}
                    value={settingsIntroText3}
                    onChange={(e) => setSettingsIntroText3(e.target.value)}
                    className="w-full p-2.5 border border-[#d6b583] rounded bg-white font-medium focus:ring-1 focus:ring-[#b8956b] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#6b4724] text-white hover:bg-[#4a3219] font-bold rounded-lg transition shadow flex items-center gap-1"
              >
                <Save className="w-4 h-4" />
                Lưu Thay Đổi Cấu Hình
              </button>
            </div>
          </form>
        )}

        {/* 5. USER ACCOUNTS PROVISIONING */}
        {adminTab === 'users' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs text-[#4a331a]">
            
            {/* Create new account form */}
            <form onSubmit={handleCreateUserSubmit} className="lg:col-span-1 bg-[#fdfbf7] p-5 rounded-xl border border-[#eadecb] space-y-4 h-fit">
              <h3 className="text-sm font-bold text-[#6b4724] font-serif uppercase tracking-wider flex items-center gap-1.5 border-b border-[#eadecb] pb-2">
                <Key className="w-4 h-4 text-[#b8956b]" />
                Cấp Tài Khoản Mới
              </h3>

              <div>
                <label className="block font-bold text-[#6b4724] mb-1">Tên tài khoản đăng nhập (*):</label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full p-2 border border-[#d6b583] rounded bg-white focus:outline-none"
                  placeholder="Ví dụ: nghiemtuan"
                />
              </div>

              <div>
                <label className="block font-bold text-[#6b4724] mb-1">Mật khẩu truy cập (*):</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2 border border-[#d6b583] rounded bg-white focus:outline-none"
                  placeholder="Nhập mật khẩu an toàn..."
                />
              </div>

              <div>
                <label className="block font-bold text-[#6b4724] mb-1">Tên hiển thị đầy đủ (*):</label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full p-2 border border-[#d6b583] rounded bg-white focus:outline-none"
                  placeholder="Ví dụ: Nghiêm Văn Tuấn"
                />
              </div>

              <div>
                <label className="block font-bold text-[#6b4724] mb-1">Vai trò hệ thống:</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as 'admin' | 'user')}
                  className="w-full p-2 border border-[#d6b583] rounded bg-white focus:outline-none"
                >
                  <option value="admin">Quản trị viên (Toàn quyền)</option>
                  <option value="user">Thành viên dòng họ (Chỉ xem và khấn nguyện)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-[#b8956b] hover:bg-[#8b7355] text-white font-bold rounded transition flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Cấp Tài Khoản
              </button>
            </form>

            {/* Existing system users table */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-[#fdfbf7] p-3 rounded-lg border border-[#f4f0e6] font-semibold text-gray-500">
                Danh sách các tài khoản quản lý hệ thống đã cấp phát:
              </div>

              <div className="overflow-x-auto border border-[#eadecb] rounded-xl bg-white">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f4f0e6] text-[#6b4724] font-bold border-b border-[#eadecb]">
                      <th className="p-3">Tài khoản</th>
                      <th className="p-3">Họ và Tên hiển thị</th>
                      <th className="p-3">Mật khẩu bảo mật</th>
                      <th className="p-3">Quyền hạn</th>
                      <th className="p-3 text-right">Tùy chọn</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f4f0e6] text-gray-700">
                    {/* Default admin is hardcoded and protected */}
                    <tr>
                      <td className="p-3 font-bold text-[#6b4724]">admin</td>
                      <td className="p-3 font-medium text-gray-600">Quản Trị Viên Chi Trưởng</td>
                      <td className="p-3 font-mono text-gray-400">•••••••• (Mặc định)</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-red-50 text-red-600 font-bold border border-red-200 rounded text-[9px] uppercase">
                          Hệ Thống
                        </span>
                      </td>
                      <td className="p-3 text-right text-gray-400 font-semibold italic text-[10px]">Không thể xóa</td>
                    </tr>

                    {users.map((u) => (
                      <tr key={u.username} className="hover:bg-gray-50 transition">
                        <td className="p-3 font-bold text-[#6b4724]">{u.username}</td>
                        <td className="p-3 font-medium text-gray-600">{u.fullName}</td>
                        <td className="p-3 font-mono text-gray-500">{u.password || '••••••••'}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded font-bold border text-[9px] uppercase ${
                            u.role === 'admin'
                              ? 'bg-rose-50 text-rose-600 border-rose-200'
                              : 'bg-indigo-50 text-indigo-600 border-indigo-200'
                          }`}>
                            {u.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              if (confirm(`Bạn có chắc chắn muốn thu hồi tài khoản quản trị "${u.username}"?`)) {
                                onDeleteUser(u.username);
                              }
                            }}
                            className="p-1 px-2 bg-red-50 text-red-600 rounded border border-red-200 hover:bg-red-100 transition text-[10px] font-bold"
                          >
                            Thu hồi
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
                  <label className="block font-bold text-[#6b4724] mb-1">Họ và Tên (Không bắt buộc):</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 border border-[#d6b583] rounded bg-[#fdfbf7] focus:outline-none focus:ring-2 focus:ring-[#b8956b]"
                    placeholder="Ví dụ: Nghiêm Xuân Tuấn"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block font-bold text-[#6b4724] mb-1">Vai trò trong dòng họ (Không bắt buộc):</label>
                  <input
                    type="text"
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

                {/* Dynamic Lunar & Age Info */}
                {getAgeAndLifespanText() && (
                  <div className="col-span-1 md:col-span-2 p-3 bg-amber-50/60 border border-amber-200 rounded-xl flex items-start gap-2.5 shadow-2xs">
                    <span className="text-sm mt-0.5">📅</span>
                    <div>
                      <p className="font-bold text-amber-950 leading-snug">
                        Tính toán Âm lịch & Tuổi thọ (Tự sinh):
                      </p>
                      <p className="font-semibold text-amber-900 mt-0.5">
                        {getAgeAndLifespanText()?.ageText}
                      </p>
                    </div>
                  </div>
                )}

                {/* Parent Link */}
                <div className="space-y-3.5">
                  {/* Father Link */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="font-bold text-[#6b4724]">Liên kết phụ thân (Cha):</label>
                      <div className="flex gap-1.5 items-center">
                        {parentId && (
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                const target = members.find(m => m.id === parentId);
                                if (target) handleSwitchToMember(target);
                              }}
                              className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded hover:bg-amber-200 font-bold cursor-pointer"
                            >
                              Sửa Cha
                            </button>
                            <button
                              type="button"
                              onClick={() => setParentId('')}
                              className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded hover:bg-rose-200 font-bold cursor-pointer"
                            >
                              Xóa liên kết
                            </button>
                          </div>
                        )}
                        {parentId !== originalParentId && (
                          <button
                            type="button"
                            onClick={() => setParentId(originalParentId)}
                            className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded hover:bg-blue-200 font-bold cursor-pointer"
                            title="Khôi phục liên kết gốc"
                          >
                            Undo (Hoàn tác)
                          </button>
                        )}
                      </div>
                    </div>
                    <select
                      value={parentId}
                      onChange={(e) => setParentId(e.target.value)}
                      className="w-full p-2 border border-[#d6b583] rounded bg-white cursor-pointer"
                    >
                      <option value="">-- Không có hoặc là Cụ tổ --</option>
                      {members
                        .filter(m => m.gender === 'male' && m.id !== (editingMember?.id || ''))
                        .map(m => (
                          <option key={m.id} value={m.id}>{m.name} (Đời {m.generation})</option>
                        ))}
                    </select>
                  </div>

                  {/* Mother Link (Thêm tính năng liên mẫu thân (Mẹ) vào ô đỏ dài dưới ô Liên kết thân phụ) */}
                  <div className="pt-2 border-t border-dashed border-amber-200">
                    <div className="flex justify-between items-center mb-1">
                      <label className="font-bold text-[#6b4724]">Liên kết mẫu thân (Mẹ):</label>
                      <div className="flex gap-1.5 items-center">
                        {motherId && (
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                const target = members.find(m => m.id === motherId);
                                if (target) handleSwitchToMember(target);
                              }}
                              className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded hover:bg-amber-200 font-bold cursor-pointer"
                            >
                              Sửa Mẹ
                            </button>
                            <button
                              type="button"
                              onClick={() => setMotherId('')}
                              className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded hover:bg-rose-200 font-bold cursor-pointer"
                            >
                              Xóa liên kết
                            </button>
                          </div>
                        )}
                        {motherId !== originalMotherId && (
                          <button
                            type="button"
                            onClick={() => setMotherId(originalMotherId)}
                            className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded hover:bg-blue-200 font-bold cursor-pointer"
                            title="Khôi phục liên kết gốc"
                          >
                            Undo (Hoàn tác)
                          </button>
                        )}
                      </div>
                    </div>
                    <select
                      value={motherId}
                      onChange={(e) => setMotherId(e.target.value)}
                      className="w-full p-2 border border-rose-200 rounded bg-white cursor-pointer text-rose-950 font-medium"
                    >
                      <option value="">-- Không có hoặc Chưa rõ mẫu thân --</option>
                      {members
                        .filter(m => m.gender === 'female' && m.id !== (editingMember?.id || ''))
                        .map(m => (
                          <option key={m.id} value={m.id}>{m.name} (Đời {m.generation})</option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* Spouse Link */}
                <div className="flex flex-col justify-between h-full space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="font-bold text-[#6b4724] flex items-center gap-1.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isMarried}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setIsMarried(checked);
                            if (!checked) {
                              setSpouseId('');
                              setSpouseIds([]);
                            }
                          }}
                          className="rounded text-rose-600 border-[#d6b583] focus:ring-rose-400 w-4.5 h-4.5 cursor-pointer accent-rose-600"
                        />
                        <span>Liên kết hôn phối (Vợ / Chồng):</span>
                      </label>
                      <div className="flex gap-1.5 items-center">
                        {spouseIds.length > 0 && (
                          <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full">
                            Đã chọn: {spouseIds.length}
                          </span>
                        )}
                        {spouseIds.toString() !== originalSpouseIds.toString() && (
                          <button
                            type="button"
                            onClick={() => {
                              setSpouseIds(originalSpouseIds);
                              setSpouseId(originalSpouseIds.length > 0 ? originalSpouseIds[0] : '');
                            }}
                            className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded hover:bg-blue-200 font-bold cursor-pointer"
                            title="Khôi phục liên kết hôn phối gốc"
                          >
                            Undo
                          </button>
                        )}
                      </div>
                    </div>

                    {isMarried ? (
                      <div className="space-y-2 border border-rose-200 rounded-lg bg-rose-50/20 p-2">
                        {/* Currently selected spouses list with buttons */}
                        {spouseIds.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pb-1.5 border-b border-rose-100">
                            {spouseIds.map(sid => {
                              const spouse = members.find(m => m.id === sid);
                              if (!spouse) return null;
                              return (
                                <div key={sid} className="flex items-center gap-1 bg-white border border-rose-200 rounded-full pl-2 pr-1 py-0.5 text-[10px] font-semibold text-rose-950">
                                  <span>{spouse.name} ({spouse.gender === 'female' ? 'Bà' : 'Ông'} - Đời {spouse.generation})</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleSwitchToMember(spouse);
                                    }}
                                    className="text-amber-800 hover:underline font-bold text-[9px] px-1"
                                    title="Sửa thành viên này"
                                  >
                                    Sửa
                                  </button>
                                  <span className="text-rose-200 text-[9px]">|</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = spouseIds.filter(x => x !== sid);
                                      setSpouseIds(updated);
                                      setSpouseId(updated.length > 0 ? updated[0] : '');
                                    }}
                                    className="text-rose-600 hover:text-rose-800 font-bold text-[9px] px-1"
                                    title="Xóa liên kết"
                                  >
                                    ✕
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Search input for spouses */}
                        <div className="relative">
                          <input
                            type="text"
                            value={spouseSearch}
                            onChange={(e) => setSpouseSearch(e.target.value)}
                            placeholder="🔍 Tìm nhanh Vợ/Chồng theo tên..."
                            className="w-full p-1.5 text-xs border border-[#d6b583] rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-rose-400 placeholder-gray-400"
                          />
                        </div>

                        {/* Checklist of potential spouses */}
                        <div className="max-h-36 overflow-y-auto border border-rose-100 rounded bg-white p-1.5 space-y-1">
                          {(() => {
                            // Filter and sort spouses
                            const currentMemberId = editingMember?.id || '';
                            const searchLower = spouseSearch.trim().toLowerCase();
                            
                            const filtered = members
                              .filter(m => m.id !== currentMemberId)
                              .filter(m => {
                                if (!searchLower) return true;
                                return m.name.toLowerCase().includes(searchLower) || m.generation.toString() === searchLower;
                              });

                            // Sort: selected spouses first, then opposite gender first, then by generation/name
                            const sorted = [...filtered].sort((a, b) => {
                              const aSelected = spouseIds.includes(a.id) ? 1 : 0;
                              const bSelected = spouseIds.includes(b.id) ? 1 : 0;
                              if (aSelected !== bSelected) return bSelected - aSelected;

                              const isOppositeA = editingMember && a.gender !== editingMember.gender ? 1 : 0;
                              const isOppositeB = editingMember && b.gender !== editingMember.gender ? 1 : 0;
                              if (isOppositeA !== isOppositeB) return isOppositeB - isOppositeA;

                              return a.generation - b.generation || a.name.localeCompare(b.name);
                            });

                            if (sorted.length === 0) {
                              return <div className="text-[10px] text-gray-400 text-center py-2">Không tìm thấy thành viên nào</div>;
                            }

                            return sorted.map(m => {
                              const isChecked = spouseIds.includes(m.id);
                              return (
                                <label
                                  key={m.id}
                                  className={`flex items-center gap-2 p-1 rounded hover:bg-rose-50/50 cursor-pointer text-xs select-none ${isChecked ? 'bg-rose-50/30' : ''}`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {
                                      const updated = isChecked
                                        ? spouseIds.filter(x => x !== m.id)
                                        : [...spouseIds, m.id];
                                      setSpouseIds(updated);
                                      setSpouseId(updated.length > 0 ? updated[0] : '');
                                    }}
                                    className="rounded text-rose-600 border-gray-300 focus:ring-rose-400 w-3.5 h-3.5 cursor-pointer accent-rose-600"
                                  />
                                  <span className="flex items-center justify-between w-full">
                                    <span className="font-medium text-gray-800">
                                      {m.name} {m.gender === 'female' ? '👩 (Nữ)' : '👨 (Nam)'}
                                    </span>
                                    <span className="text-[9px] text-gray-400">
                                      Đời {m.generation}
                                    </span>
                                  </span>
                                </label>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 text-center border border-dashed border-[#d6b583] rounded-lg bg-gray-50 text-[11px] text-gray-400">
                        Chưa chọn kết hôn. Tích chọn ô vuông phía trên để bật tính năng liên kết nhiều hôn phối.
                      </div>
                    )}
                  </div>
                  {/* Visual marriage decoration helper */}
                  <div className="hidden md:block text-[11px] text-rose-800 italic mt-auto bg-rose-50/50 border border-rose-100 p-2 rounded-lg">
                    {isMarried ? "❤️ Đã chọn trạng thái Có kết hôn. Hãy tích chọn danh sách Vợ/Chồng hoặc ghi thông tin Dâu ở phần Ghi chú." : "🕊️ Trạng thái Độc thân hoặc Chưa liên kết hôn phối."}
                  </div>
                </div>

                {/* Bầu đoàn dòng tộc card */}
                <div className="col-span-1 md:col-span-2 p-3.5 bg-[#fdfbf7] rounded-xl border border-[#eadecb] space-y-3">
                  <div className="flex justify-between items-center border-b border-[#eadecb] pb-2 flex-wrap gap-2">
                    <span className="font-bold text-[#6b4724] text-xs flex items-center gap-1.5">
                      👥 Bầu đoàn nhà cụ/ông/bác/anh (Thân tộc liên quan)
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {fatherInfo && (
                        <span className="text-[10px] bg-[#6b4724] text-white font-bold px-2 py-0.5 rounded-full shrink-0">
                          Nhà đời {fatherInfo.generation}
                        </span>
                      )}
                      
                      {/* Khung điều khiển liên kết Sửa / Xóa / Hoàn tác (Undo) góc phải trên */}
                      <div className="flex items-center gap-1.5 border border-rose-400 bg-rose-50/70 p-1 rounded-lg shadow-2xs shrink-0">
                        <span className="text-[9px] font-bold text-rose-800 px-1">Thao tác nhanh:</span>
                        
                        {/* Sửa / Xóa Cha */}
                        {parentId ? (
                          <div className="flex items-center gap-1 bg-white border border-rose-200 rounded px-1.5 py-0.5 text-[9px] font-semibold">
                            <span className="text-amber-900">Cha:</span>
                            <button
                              type="button"
                              onClick={() => {
                                const target = members.find(m => m.id === parentId);
                                if (target) handleSwitchToMember(target);
                              }}
                              className="text-amber-800 hover:underline font-bold cursor-pointer"
                              title="Sửa Cha"
                            >
                              Sửa
                            </button>
                            <span className="text-rose-200">|</span>
                            <button
                              type="button"
                              onClick={() => setParentId('')}
                              className="text-rose-600 hover:underline font-bold cursor-pointer"
                              title="Xóa liên kết Cha"
                            >
                              Xóa
                            </button>
                          </div>
                        ) : null}
                        {parentId !== originalParentId && (
                          <button
                            type="button"
                            onClick={() => setParentId(originalParentId)}
                            className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded hover:bg-blue-200 font-bold cursor-pointer shrink-0"
                            title="Hoàn tác thay đổi liên kết Cha"
                          >
                            Hoàn Cha
                          </button>
                        )}

                        {/* Sửa / Xóa Vợ/Chồng */}
                        {spouseId ? (
                          <div className="flex items-center gap-1 bg-white border border-rose-200 rounded px-1.5 py-0.5 text-[9px] font-semibold">
                            <span className="text-amber-900">Phối:</span>
                            <button
                              type="button"
                              onClick={() => {
                                const target = members.find(m => m.id === spouseId);
                                if (target) handleSwitchToMember(target);
                              }}
                              className="text-amber-800 hover:underline font-bold cursor-pointer"
                              title="Sửa Vợ/Chồng"
                            >
                              Sửa
                            </button>
                            <span className="text-rose-200">|</span>
                            <button
                              type="button"
                              onClick={() => setSpouseId('')}
                              className="text-rose-600 hover:underline font-bold cursor-pointer"
                              title="Xóa liên kết Vợ/Chồng"
                            >
                              Xóa
                            </button>
                          </div>
                        ) : null}
                        {spouseId !== originalSpouseId && (
                          <button
                            type="button"
                            onClick={() => setSpouseId(originalSpouseId)}
                            className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded hover:bg-blue-200 font-bold cursor-pointer shrink-0"
                            title="Hoàn tác thay đổi liên kết Vợ/Chồng"
                          >
                            Hoàn Phối
                          </button>
                        )}

                        {!parentId && !spouseId && (
                          <span className="text-[9px] text-rose-700 italic px-1">Chưa có liên kết</span>
                        )}
                      </div>
                    </div>
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

                  {/* Textarea inside the Bầu đoàn card */}
                  <div className="mt-3.5 pt-3 border-t border-[#eadecb]">
                    <label className="block font-bold text-[#6b4724] mb-1 flex items-center justify-between flex-wrap gap-1">
                      <span>🌸 Bổ sung thông tin Dâu của gia đình / thông tin liên quan khác:</span>
                      <span className="text-[9px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-sm">Khu vực bổ sung thông tin Dâu & Thân tộc</span>
                    </label>
                    <textarea
                      rows={3}
                      value={relationNotes}
                      onChange={(e) => setRelationNotes(e.target.value)}
                      className="w-full p-2.5 border border-rose-300 rounded-lg bg-white text-[11px] text-[#5c4021] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-rose-400 focus:border-rose-400 resize-none animate-in fade-in duration-200"
                      placeholder="Hãy nhập thêm thông tin chi tiết về các nàng Dâu trong gia đình (Họ tên dâu, quê quán, dòng dõi, thứ bậc của chồng, đóng góp đóng họ...), hoặc thông tin con cháu khác tại đây..."
                    />
                  </div>
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
