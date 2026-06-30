import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Settings, PlusCircle, Trash2, Edit2, Users, Bell, Activity, Save, X, Plus, Image, Key, Shield, Eye, EyeOff, Database } from 'lucide-react';
// @ts-ignore
import { LunarDate } from 'vietnamese-lunar-calendar';
import { FamilyMember, Announcement, SystemLog, SystemUser } from '../types';
import { ImageUploader } from './ImageUploader';
import { SearchableSelect } from './SearchableSelect';

interface AdminViewProps {
  members: FamilyMember[];
  announcements: Announcement[];
  logs: SystemLog[];
  onAddMember: (member: FamilyMember) => void;
  onEditMember: (member: FamilyMember) => void;
  onDeleteMember: (id: string) => void;
  onAddAnnouncement: (announcement: Announcement) => void;
  onEditAnnouncement?: (announcement: Announcement) => void;
  onDeleteAnnouncement: (id: string) => void;
  // Banner & Gia tộc settings
  settings: Record<string, string>;
  onSaveSetting: (key: string, value: string) => Promise<void>;
  // User Accounts
  users: SystemUser[];
  onAddUser: (user: SystemUser) => Promise<void>;
  onDeleteUser: (username: string) => Promise<void>;
}

// Helper to construct dynamic API Backend URL
const getApiUrl = (path: string): string => {
  const storedUrl = localStorage.getItem('gia_pha_api_backend_url');
  if (storedUrl && storedUrl.trim()) {
    const base = storedUrl.trim().endsWith('/') ? storedUrl.trim().slice(0, -1) : storedUrl.trim();
    return `${base}${path}`;
  }
  return path;
};

export default function AdminView({
  members,
  announcements,
  logs,
  onAddMember,
  onEditMember,
  onDeleteMember,
  onAddAnnouncement,
  onEditAnnouncement,
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
  const [deathDateSolar, setDeathDateSolar] = useState('');
  const [deathTime, setDeathTime] = useState('');
  const [deathDateLunar, setDeathDateLunar] = useState('');
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
  const [avatar, setAvatar] = useState('');
  const [isStepChild, setIsStepChild] = useState(false);

  const [originalParentId, setOriginalParentId] = useState('');
  const [originalMotherId, setOriginalMotherId] = useState('');
  const [originalSpouseId, setOriginalSpouseId] = useState('');
  const [originalSpouseIds, setOriginalSpouseIds] = useState<string[]>([]);
  const [isMarried, setIsMarried] = useState(false);
  const [relationNotes, setRelationNotes] = useState('');
  const [spouseSearch, setSpouseSearch] = useState('');

  // Announcement Form Fields
  const [isAnnModalOpen, setIsAnnModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annType, setAnnType] = useState<'urgent' | 'update' | 'event'>('update');

  // Local states for custom settings inputs
  const [settingsHeroTitle, setSettingsHeroTitle] = useState(settings.heroTitle || 'Gia Phả Gia Đình');
  const [settingsHeroSubtitle, setSettingsHeroSubtitle] = useState(settings.heroSubtitle || 'Cụ Nghiêm Cung');
  const [settingsHeroImage, setSettingsHeroImage] = useState(settings.heroImage || 'https://images.unsplash.com/photo-1605369572399-05d8d64a0f6e?q=80&w=2000&auto=format&fit=crop');
  const [settingsHeroFrameImage, setSettingsHeroFrameImage] = useState(settings.heroFrameImage || '');
  const [settingsHeroFrameText, setSettingsHeroFrameText] = useState(settings.heroFrameText || 'Mộc bản thụ nguyên, thuỷ lưu tuyền bản');
  const [settingsIntroText1, setSettingsIntroText1] = useState(settings.introText1 || 'Cây có gốc mới nở cành xanh ngọn, nước có nguồn mới bể rộng sông sâu. Người có tổ tông mới sinh con cháu, hiếu nghĩa vẹn tròn mới rạng rỡ tổ tiên.');
  const [settingsIntroText2, setSettingsIntroText2] = useState(settings.introText2 || 'Gia phả gia đình dòng họ Cụ Nghiêm Cung (kế thừa dòng dõi cụ cố Nghiêm Điều (Chu) tại vùng đất Hòa Xá cổ kính, giàu truyền thống cách mạng) được lập ra nhằm mục đích kính cáo tổ tông, ghi chép tường tận huyết mạch dòng giống, lưu truyền cho con cháu vạn đời sau không bao giờ quên đi nguồn cội thiêng liêng của mình.');
  const [settingsIntroText3, setSettingsIntroText3] = useState(settings.introText3 || 'Trải qua bao thăng trầm của lịch sử, con cháu họ Nghiêm luôn gìn giữ nếp gia phong nghiêm cẩn, lấy hiếu học làm đầu, lấy đức độ làm trọng, lấy trung thực làm gương và hết lòng đùm bọc, giúp đỡ lẫn nhau vượt qua gian khó, lập thân kiến nghiệp làm rạng danh gia đình.');
  const [apiBackendUrl, setApiBackendUrl] = useState(localStorage.getItem('gia_pha_api_backend_url') || '');

  // Local states for Supabase Custom Configuration (Asian region support)
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [supabaseServiceRoleKey, setSupabaseServiceRoleKey] = useState('');
  const [supabaseRegion, setSupabaseRegion] = useState('sydney');
  const [dbStatus, setDbStatus] = useState<{ success: boolean; timestamp?: string; error?: any; workingKeyTruncated?: string } | null>(null);
  const [isTestingDb, setIsTestingDb] = useState(false);

  // Local helper to fetch current Supabase config
  const fetchSupabaseConfig = async () => {
    try {
      const res = await fetch(getApiUrl('/api/config/supabase'));
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setSupabaseUrl(data.config.url || '');
          setSupabaseAnonKey(data.config.anonKey || '');
          setSupabaseServiceRoleKey(data.config.serviceRoleKey || '');
          setSupabaseRegion(data.config.region || 'sydney');
        }
        if (data.status) {
          setDbStatus(data.status);
        }
      }
    } catch (err) {
      console.error("Failed to fetch supabase config", err);
    }
  };

  // Load configuration on mount
  React.useEffect(() => {
    fetchSupabaseConfig();
  }, []);

  // Save and test Supabase configuration
  const handleSaveAndTestSupabase = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTestingDb(true);
    try {
      const res = await fetch(getApiUrl('/api/config/supabase'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: supabaseUrl,
          anonKey: supabaseAnonKey,
          serviceRoleKey: supabaseServiceRoleKey,
          region: supabaseRegion
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status) {
          setDbStatus(data.status);
          if (data.status.success) {
            alert('Đồng bộ & Kết nối cơ sở dữ liệu Supabase thành công!');
          } else {
            alert(`Lỗi kết nối cơ sở dữ liệu: ${data.status.error?.message || 'Vui lòng kiểm tra lại URL và API key.'}`);
          }
        }
      } else {
        alert('Lưu cấu hình thất bại. Vui lòng kiểm tra máy chủ API.');
      }
    } catch (err: any) {
      alert(`Đã xảy ra lỗi: ${err.message}`);
    } finally {
      setIsTestingDb(false);
    }
  };

  // Local states for custom user provisioning
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'user'>('admin');
  const [showCreatePassword, setShowCreatePassword] = useState(false);

  // States for bulk user creation
  const [bulkUsers, setBulkUsers] = useState<SystemUser[]>([]);
  const [isBulkUploading, setIsBulkUploading] = useState(false);

  // Synchronize dynamic settings once loaded
  React.useEffect(() => {
    if (settings.heroTitle) setSettingsHeroTitle(settings.heroTitle);
    if (settings.heroSubtitle) setSettingsHeroSubtitle(settings.heroSubtitle);
    if (settings.heroImage) setSettingsHeroImage(settings.heroImage);
    if (settings.heroFrameImage !== undefined) setSettingsHeroFrameImage(settings.heroFrameImage);
    if (settings.heroFrameText !== undefined) setSettingsHeroFrameText(settings.heroFrameText);
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
    setDeathDateSolar('');
    setDeathTime('');
    setDeathDateLunar('');
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
    setAvatar('');
    setIsStepChild(false);
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
    setDeathDateSolar(member.deathDateSolar || '');
    setDeathTime(member.deathTime || '');
    setDeathDateLunar(member.deathDateLunar || '');
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
    setAvatar(member.avatar || '');
    setIsStepChild(member.isStepChild || false);
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
    setDeathDateSolar(targetMember.deathDateSolar || '');
    setDeathTime(targetMember.deathTime || '');
    setDeathDateLunar(targetMember.deathDateLunar || '');
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
    setAvatar(targetMember.avatar || '');
    setIsStepChild(targetMember.isStepChild || false);
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

    let calculatedDeathYear = deathYear.trim();
    if (isDeceased && deathDateSolar) {
      const match = deathDateSolar.trim().match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/) || deathDateSolar.trim().match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
      if (match) {
        const yr = match[3] && match[3].length === 4 ? match[3] : match[1];
        if (yr && yr.length === 4 && !isNaN(Number(yr))) {
          calculatedDeathYear = yr;
        }
      }
    }

    const payload: FamilyMember = {
      id: editingMember ? editingMember.id : `mem-${Date.now()}`,
      name: finalName,
      gender,
      generation: Number(generation),
      role: finalRole,
      birthYear: birthYear.trim() || undefined,
      deathYear: isDeceased ? (calculatedDeathYear || undefined) : undefined,
      deathDateSolar: isDeceased ? (deathDateSolar.trim() || undefined) : undefined,
      deathTime: isDeceased ? (deathTime.trim() || undefined) : undefined,
      deathDateLunar: isDeceased ? (deathDateLunar.trim() || undefined) : undefined,
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
      avatar: avatar.trim() || undefined,
      isStepChild: isStepChild || undefined,
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

  const convertSolarToLunarStr = (dateStr: string): string | null => {
    if (!dateStr) return null;
    const cleaned = dateStr.trim();
    let d = 0, m = 0, y = 0;
    
    // Check YYYY-MM-DD
    const matchYMD = cleaned.match(/^(\d{4})[\-\/](\d{1,2})[\-\/](\d{1,2})$/);
    if (matchYMD) {
      y = parseInt(matchYMD[1], 10);
      m = parseInt(matchYMD[2], 10);
      d = parseInt(matchYMD[3], 10);
    } else {
      // Check DD/MM/YYYY
      const matchDMY = cleaned.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
      if (!matchDMY) return null;
      d = parseInt(matchDMY[1], 10);
      m = parseInt(matchDMY[2], 10);
      y = parseInt(matchDMY[3], 10);
    }
    
    if (isNaN(d) || isNaN(m) || isNaN(y)) return null;
    try {
      // @ts-ignore
      const res = new LunarDate(y, m, d);
      if (res && res.date && res.month && res.year) {
        const canChiYear = getCanChi(String(res.year));
        return `ngày ${res.date} tháng ${res.month}${res.isLeap ? ' (nhuận)' : ''} năm ${canChiYear}`;
      }
    } catch (e) {
      console.error(e);
    }
    return null;
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
        ageText: `Sinh: ${birthYear} (${birthLunar}). Tuổi: ${ageDiff} tuổi`
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

    if (editingAnnouncement) {
      const updatedAnn: Announcement = {
        ...editingAnnouncement,
        title: annTitle.trim(),
        content: annContent.trim(),
        type: annType,
      };
      if (onEditAnnouncement) {
        onEditAnnouncement(updatedAnn);
      }
      setIsAnnModalOpen(false);
      setEditingAnnouncement(null);
      setAnnTitle('');
      setAnnContent('');
      alert('Cập nhật thông báo dòng họ thành công!');
    } else {
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
    }
  };

  const handleSaveBannerSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('gia_pha_api_backend_url', apiBackendUrl.trim());
      await onSaveSetting('heroTitle', settingsHeroTitle);
      await onSaveSetting('heroSubtitle', settingsHeroSubtitle);
      await onSaveSetting('heroImage', settingsHeroImage);
      await onSaveSetting('heroFrameImage', settingsHeroFrameImage);
      await onSaveSetting('heroFrameText', settingsHeroFrameText);
      await onSaveSetting('introText1', settingsIntroText1);
      await onSaveSetting('introText2', settingsIntroText2);
      await onSaveSetting('introText3', settingsIntroText3);
      alert('Đã cập nhật cấu hình Banner, Khung hình, liên kết máy chủ trực tuyến và thông tin giới thiệu Gia tộc thành công!');
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
      role: newUserRole,
      isFirstLogin: true
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

  // Download account import template (supports XLSX, XLS, and CSV)
  const handleDownloadTemplate = (format: 'xlsx' | 'xls' | 'csv') => {
    const headers = [
      ['Tên đăng nhập (username)', 'Mật khẩu (password)', 'Tên hiển thị (fullName)', 'Vai trò (admin hoặc user)'],
      ['nghiemtuan', 'Matkhau123!', 'Nghiêm Văn Tuấn', 'user'],
      ['nghiemhoa', 'Matkhau456!', 'Nghiêm Thị Hoa', 'admin']
    ];

    if (format === 'csv') {
      // Create CSV format with UTF-8 BOM so Excel opens it with correct Vietnamese encoding
      const csvContent = '\uFEFF' + headers.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'bieu_mau_cap_tai_khoan_dong_loat.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Generate real Excel sheet (.xlsx or .xls) using SheetJS
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(headers);
      XLSX.utils.book_append_sheet(wb, ws, 'Bieu Mau Tai Khoan');
      XLSX.writeFile(wb, `bieu_mau_cap_tai_khoan_dong_loat.${format}`);
    }
  };

  // Handle CSV/Excel template parsing for bulk creation
  const handleBulkUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        const data = new Uint8Array(arrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert worksheet to JSON (2D array format)
        const rows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
        
        if (rows.length <= 1) {
          alert("Không tìm thấy dòng tài khoản nào trong tệp tin để nhập.");
          return;
        }

        const parsed: SystemUser[] = [];
        let errors = [];

        // Skip the header (rows[0])
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length === 0) continue;

          // Convert cells to string safely
          const usernameVal = row[0] !== undefined && row[0] !== null ? String(row[0]).trim() : '';
          const passwordVal = row[1] !== undefined && row[1] !== null ? String(row[1]).trim() : '';
          const fullNameVal = row[2] !== undefined && row[2] !== null ? String(row[2]).trim() : '';
          const roleVal = row[3] !== undefined && row[3] !== null ? String(row[3]).trim().toLowerCase() : 'user';

          // Skip empty row
          if (!usernameVal && !passwordVal && !fullNameVal) continue;

          if (!usernameVal) {
            errors.push(`Dòng ${i + 1}: Tên đăng nhập trống.`);
            continue;
          }
          if (!passwordVal) {
            errors.push(`Dòng ${i + 1}: Mật khẩu trống.`);
            continue;
          }
          if (!fullNameVal) {
            errors.push(`Dòng ${i + 1}: Tên hiển thị trống.`);
            continue;
          }

          const username = usernameVal.toLowerCase();
          const password = passwordVal;
          const fullName = fullNameVal;
          const role: 'admin' | 'user' = (roleVal === 'admin') ? 'admin' : 'user';

          // Check duplicate within parsed array or existing users
          if (parsed.some(u => u.username === username) || users.some(u => u.username === username) || username === 'admin') {
            errors.push(`Dòng ${i + 1}: Tên đăng nhập "${username}" đã tồn tại trên hệ thống hoặc bị trùng lặp.`);
            continue;
          }

          parsed.push({ username, password, fullName, role, isFirstLogin: true });
        }

        if (errors.length > 0) {
          alert("Có một số dòng lỗi phát hiện trong biểu mẫu:\n" + errors.slice(0, 5).join('\n') + (errors.length > 5 ? `\n... và ${errors.length - 5} lỗi khác.` : ''));
        }

        if (parsed.length > 0) {
          setBulkUsers(parsed);
          alert(`Đã đọc thành công ${parsed.length} tài khoản từ biểu mẫu! Vui lòng kiểm tra danh sách xem trước phía dưới và nhấn "Xác nhận cấp đồng loạt" để tạo.`);
        } else {
          alert("Không tìm thấy dòng tài khoản hợp lệ nào trong tệp tin để nhập.");
        }
      } catch (err: any) {
        console.error("Error parsing file:", err);
        alert(`Lỗi khi đọc hoặc phân tích tệp tin: ${err.message || 'Định dạng tệp không được hỗ trợ.'}`);
      }
    };
    fileReader.readAsArrayBuffer(file);
    // Reset file input value
    e.target.value = '';
  };

  // Submit parsed users bulk addition
  const handleBulkSubmitConfirm = async () => {
    if (bulkUsers.length === 0) return;
    setIsBulkUploading(true);
    let successCount = 0;
    let failCount = 0;

    for (const u of bulkUsers) {
      try {
        await onAddUser(u);
        successCount++;
      } catch (err) {
        console.error(`Cấp tài khoản thất bại cho: ${u.username}`, err);
        failCount++;
      }
    }

    setIsBulkUploading(false);
    alert(`Hoàn thành cấp tài khoản đồng loạt:\n- Thành công: ${successCount} tài khoản\n- Thất bại: ${failCount} tài khoản`);
    setBulkUsers([]);
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
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-bold rounded-full">Còn sống</span>
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
                onClick={() => {
                  setEditingAnnouncement(null);
                  setAnnTitle('');
                  setAnnContent('');
                  setAnnType('update');
                  setIsAnnModalOpen(true);
                }}
                className="px-4 py-2 bg-[#b8956b] text-white text-xs font-bold rounded-lg hover:bg-[#8b7355] transition flex items-center gap-1"
              >
                <PlusCircle className="w-4 h-4" />
                Đăng thông báo mới
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {announcements.map((ann) => (
                <div key={ann.id} className="border border-[#eadecb] rounded-xl p-5 bg-white flex justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        ann.type === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {ann.type === 'urgent' ? 'Khẩn cấp' : 'Bản tin'}
                      </span>
                      <span className="text-xs text-gray-400">{ann.date}</span>
                    </div>
                    <h4 className="font-bold text-sm text-[#6b4724]">{ann.title}</h4>
                    <p className="text-xs text-gray-500 line-clamp-3 whitespace-pre-line">{ann.content}</p>
                  </div>
                  <div className="flex flex-col gap-1.5 self-start">
                    <button
                      onClick={() => {
                        setEditingAnnouncement(ann);
                        setAnnTitle(ann.title);
                        setAnnContent(ann.content);
                        setAnnType(ann.type);
                        setIsAnnModalOpen(true);
                      }}
                      className="p-1.5 bg-amber-50 text-amber-700 rounded border border-amber-200 hover:bg-amber-100 transition"
                      title="Sửa thông báo"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Bạn có chắc muốn gỡ bỏ thông báo "${ann.title}"?`)) {
                          onDeleteAnnouncement(ann.id);
                        }
                      }}
                      className="p-1.5 bg-red-50 text-red-600 rounded border border-red-200 hover:bg-red-100 transition"
                      title="Gỡ bỏ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
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
                  <ImageUploader
                    value={settingsHeroImage}
                    onChange={setSettingsHeroImage}
                    label="Đường dẫn ảnh nền Banner (URL Ảnh):"
                    placeholder="Nhập link hình ảnh Unsplash, CDN hoặc tải từ máy / Google Drive..."
                  />
                  <div className="mt-2 text-[10px] text-gray-400">
                    Mẹo: Bạn có thể tải ảnh trực tiếp từ máy tính, dán liên kết Google Drive (hệ thống tự chuyển đổi) hoặc CDN bất kỳ.
                  </div>
                </div>

                <div className="md:col-span-2 border-t border-dashed border-[#eadecb] pt-4 mt-2 space-y-4">
                  <h4 className="font-bold text-xs text-[#b8956b] font-serif uppercase tracking-widest">
                    Cấu hình Khung hình / Chữ góc phải Hero Banner
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-[#6b4724] mb-1">Chữ hiển thị trong Khung:</label>
                      <input
                        type="text"
                        value={settingsHeroFrameText}
                        onChange={(e) => setSettingsHeroFrameText(e.target.value)}
                        className="w-full p-2.5 border border-[#d6b583] rounded bg-white font-medium focus:ring-1 focus:ring-[#b8956b] focus:outline-none"
                        placeholder="Ví dụ: Mộc bản thụ nguyên, thuỷ lưu tuyền bản..."
                      />
                    </div>

                    <div>
                      <ImageUploader
                        value={settingsHeroFrameImage}
                        onChange={setSettingsHeroFrameImage}
                        label="Hình ảnh hiển thị trong Khung:"
                        placeholder="Tải ảnh lên hoặc dán URL ảnh muốn lồng vào khung..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#fdfbf7] p-4 rounded-xl border border-[#eadecb] space-y-4">
              <h3 className="text-sm font-bold text-[#6b4724] font-serif uppercase tracking-wider flex items-center gap-1.5 border-b border-[#eadecb] pb-2">
                <Shield className="w-4 h-4 text-[#b8956b]" />
                Cấu hình kết nối Máy chủ Trực tuyến (Chế độ Động)
              </h3>
              <p className="text-[11px] text-[#6b4724] leading-relaxed">
                Khi triển khai ứng dụng lên các nền tảng tĩnh (như Vercel, Netlify, GitHub Pages), trình duyệt cần biết địa chỉ máy chủ Node.js/Cloud Run của bạn để lưu và cập nhật dữ liệu trực tuyến (Supabase).
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-[#6b4724] mb-1">Địa chỉ Máy chủ API (Backend URL):</label>
                  <input
                    type="url"
                    value={apiBackendUrl}
                    onChange={(e) => setApiBackendUrl(e.target.value)}
                    className="w-full p-2.5 border border-[#d6b583] rounded bg-white font-medium focus:ring-1 focus:ring-[#b8956b] focus:outline-none"
                    placeholder="Ví dụ: https://ais-pre-zfw6q4xcvwloawlouuzxzj-66410271426.asia-southeast1.run.app"
                  />
                  <div className="mt-1.5 flex flex-wrap gap-2 items-center">
                    <span className="text-[10px] text-gray-500">Mẹo: Nếu đang truy cập ở máy chủ gốc, bạn có thể nhấn sao chép địa chỉ hiện tại bên dưới và dán vào ô trên:</span>
                    <button
                      type="button"
                      onClick={() => {
                        const origin = window.location.origin;
                        setApiBackendUrl(origin);
                        alert(`Đã sao chép địa chỉ hiện tại: ${origin}`);
                      }}
                      className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-[#7c562e] rounded text-[10px] font-bold border border-amber-300 transition"
                    >
                      Sử dụng địa chỉ hiện tại ({window.location.origin})
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div id="supabase-config-section" className="bg-[#fdfbf7] p-4 rounded-xl border border-[#eadecb] space-y-4">
              <h3 className="text-sm font-bold text-[#6b4724] font-serif uppercase tracking-wider flex items-center gap-1.5 border-b border-[#eadecb] pb-2">
                <Database className="w-4 h-4 text-[#b8956b]" />
                Cấu hình Vùng Cơ sở dữ liệu Supabase (Chuyển vùng Châu Á)
              </h3>
              <p className="text-[11px] text-[#6b4724] leading-relaxed">
                Thiết lập vị trí lưu trữ dữ liệu phả hệ của dòng họ. Theo mặc định hệ thống chạy trên máy chủ Châu Đại Dương (Sydney, Úc). Quý khách có thể tự tạo một dự án Supabase mới đặt tại vùng <strong>Châu Á (Singapore)</strong> để tối ưu tốc độ và điền thông tin kết nối dưới đây:
              </p>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-[#6b4724] mb-1">Chọn Vùng Hoạt Động:</label>
                  <select
                    value={supabaseRegion}
                    onChange={(e) => setSupabaseRegion(e.target.value)}
                    className="w-full p-2.5 border border-[#d6b583] rounded bg-white font-medium focus:ring-1 focus:ring-[#b8956b] focus:outline-none text-xs text-[#4a331a]"
                  >
                    <option value="sydney">Châu Đại Dương (Sydney, Úc - Mặc định)</option>
                    <option value="singapore">Châu Á (Singapore - Tối ưu nhất)</option>
                    <option value="tokyo">Châu Á (Tokyo, Nhật Bản)</option>
                    <option value="custom">Vùng tùy chọn khác</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#6b4724] mb-1">Supabase URL:</label>
                  <input
                    type="url"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    className="w-full p-2.5 border border-[#d6b583] rounded bg-white font-medium focus:ring-1 focus:ring-[#b8956b] focus:outline-none text-xs text-[#4a331a]"
                    placeholder="Ví dụ: https://xxxxxxxxx.supabase.co"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#6b4724] mb-1">Supabase Anon Key:</label>
                    <input
                      type="password"
                      value={supabaseAnonKey}
                      onChange={(e) => setSupabaseAnonKey(e.target.value)}
                      className="w-full p-2.5 border border-[#d6b583] rounded bg-white font-medium focus:ring-1 focus:ring-[#b8956b] focus:outline-none text-xs text-[#4a331a]"
                      placeholder="Dán public anon key..."
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#6b4724] mb-1">Supabase Service Role Key:</label>
                    <input
                      type="password"
                      value={supabaseServiceRoleKey}
                      onChange={(e) => setSupabaseServiceRoleKey(e.target.value)}
                      className="w-full p-2.5 border border-[#d6b583] rounded bg-white font-medium focus:ring-1 focus:ring-[#b8956b] focus:outline-none text-xs text-[#4a331a]"
                      placeholder={supabaseServiceRoleKey ? "••••••••••••••••••••••••" : "Dán service_role key..."}
                    />
                  </div>
                </div>

                {dbStatus && (
                  <div className={`p-3 rounded border text-[11px] ${dbStatus.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                    <div className="font-bold flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${dbStatus.success ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      Trạng thái kết nối: {dbStatus.success ? 'Kết nối thành công!' : 'Lỗi kết nối / Chưa được cấu hình đúng'}
                    </div>
                    {dbStatus.workingKeyTruncated && (
                      <div className="mt-1 font-mono text-[10px] opacity-80">
                        Khóa đang sử dụng: {dbStatus.workingKeyTruncated}
                      </div>
                    )}
                    {dbStatus.error && (
                      <div className="mt-1 font-mono text-[10px] bg-white/50 p-1.5 rounded border border-rose-100 max-h-16 overflow-y-auto">
                        {dbStatus.error.message || JSON.stringify(dbStatus.error)}
                      </div>
                    )}
                    {dbStatus.timestamp && (
                      <div className="mt-1 text-[10px] opacity-60">
                        Kiểm tra lúc: {new Date(dbStatus.timestamp).toLocaleString('vi-VN')}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      if (window.confirm("Bạn có chắc chắn muốn khôi phục về Cơ sở dữ liệu mặc định hệ thống?")) {
                        setSupabaseUrl('');
                        setSupabaseAnonKey('');
                        setSupabaseServiceRoleKey('');
                        setSupabaseRegion('sydney');
                        
                        setIsTestingDb(true);
                        try {
                          const res = await fetch(getApiUrl('/api/config/supabase'), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ url: '', serviceRoleKey: '', anonKey: '', region: 'sydney' })
                          });
                          if (res.ok) {
                            const data = await res.json();
                            setDbStatus(data.status);
                            alert('Đã khôi phục về cơ sở dữ liệu mặc định (Úc)!');
                          }
                        } catch (err: any) {
                          alert(`Lỗi: ${err.message}`);
                        } finally {
                          setIsTestingDb(false);
                        }
                      }
                    }}
                    className="px-3 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded font-bold transition text-xs"
                  >
                    Khôi phục mặc định
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAndTestSupabase}
                    disabled={isTestingDb}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold transition flex items-center gap-1.5 text-xs disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {isTestingDb ? 'Đang kiểm tra...' : 'Kiểm tra & Kết nối Supabase'}
                  </button>
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
            
            <div className="lg:col-span-1 space-y-6">
              {/* Create new account form */}
              <form onSubmit={handleCreateUserSubmit} className="bg-[#fdfbf7] p-5 rounded-xl border border-[#eadecb] space-y-4">
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
                  <div className="relative">
                    <input
                      type={showCreatePassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full p-2 pr-10 border border-[#d6b583] rounded bg-white focus:outline-none text-sm"
                      placeholder="Nhập mật khẩu an toàn..."
                    />
                    <button
                      type="button"
                      onClick={() => setShowCreatePassword(!showCreatePassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-[#6b4724] transition focus:outline-none"
                      title={showCreatePassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                    >
                      {showCreatePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
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

              {/* Bulk Create accounts */}
              <div className="bg-[#fdfbf7] p-5 rounded-xl border border-[#eadecb] space-y-4">
                <h3 className="text-sm font-bold text-[#6b4724] font-serif uppercase tracking-wider flex items-center gap-1.5 border-b border-[#eadecb] pb-2">
                  <Users className="w-4 h-4 text-[#b8956b]" />
                  Cấp Tài Khoản Đồng Loạt
                </h3>
                <p className="text-gray-500 leading-relaxed text-[11px]">
                  Tải biểu mẫu nhập liệu theo định dạng ưa thích (Excel .xlsx, .xls hoặc .csv), nhập danh sách tài khoản rồi tải lên lại hệ thống để kích hoạt đồng loạt.
                </p>

                <div className="flex flex-col gap-3">
                  <div className="space-y-1.5">
                    <span className="block text-[11px] font-bold text-[#6b4724]">1. Chọn tải mẫu đăng ký tài khoản:</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleDownloadTemplate('xlsx')}
                        className="py-2 px-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold rounded text-[10px] transition text-center flex flex-col items-center justify-center gap-0.5"
                        title="Tải mẫu Excel 2007+ (.xlsx)"
                      >
                        <span className="text-xs">📊</span>
                        <span>Excel (.xlsx)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadTemplate('xls')}
                        className="py-2 px-1 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 font-bold rounded text-[10px] transition text-center flex flex-col items-center justify-center gap-0.5"
                        title="Tải mẫu Excel 97-2003 (.xls)"
                      >
                        <span className="text-xs">📉</span>
                        <span>Excel (.xls)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadTemplate('csv')}
                        className="py-2 px-1 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 font-bold rounded text-[10px] transition text-center flex flex-col items-center justify-center gap-0.5"
                        title="Tải mẫu dạng văn bản ngăn cách (.csv)"
                      >
                        <span className="text-xs">📄</span>
                        <span>CSV (.csv)</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <span className="block text-[11px] font-bold text-[#6b4724]">2. Tải lên tệp đã điền:</span>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleBulkUploadChange}
                        className="hidden"
                        id="bulk-user-file-upload"
                      />
                      <label
                        htmlFor="bulk-user-file-upload"
                        className="w-full py-2 bg-[#6b4724] hover:bg-[#54371b] text-white font-bold rounded transition flex items-center justify-center gap-1.5 cursor-pointer text-center"
                      >
                        📤 Tải lên tệp biểu mẫu (.xlsx, .xls, .csv)
                      </label>
                    </div>
                  </div>
                </div>

                {bulkUsers.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[#eadecb] space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#6b4724]">Xem trước ({bulkUsers.length}):</span>
                      <button
                        type="button"
                        onClick={() => setBulkUsers([])}
                        className="text-red-600 hover:underline font-bold font-semibold"
                      >
                        Xóa danh sách
                      </button>
                    </div>

                    <div className="max-h-48 overflow-y-auto border border-[#eadecb] rounded bg-white divide-y divide-gray-100">
                      {bulkUsers.map((bu, idx) => (
                        <div key={idx} className="p-2 flex flex-col gap-0.5 text-[11px]">
                          <div className="flex justify-between font-semibold text-gray-700">
                            <span>{bu.username}</span>
                            <span className="text-[10px] uppercase px-1 bg-gray-100 rounded text-gray-600 font-bold">{bu.role}</span>
                          </div>
                          <div className="text-gray-500 flex justify-between">
                            <span>Họ tên: {bu.fullName}</span>
                            <span>Mật khẩu: {bu.password}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      disabled={isBulkUploading}
                      onClick={handleBulkSubmitConfirm}
                      className="w-full py-2.5 bg-[#b8956b] hover:bg-[#8b7355] text-white font-bold rounded transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {isBulkUploading ? (
                        <span>Đang xử lý cấp tài khoản...</span>
                      ) : (
                        <>
                          <span>⚡</span> Xác nhận cấp đồng loạt
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

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

                {/* Step Child Toggle */}
                <div>
                  <label className="block font-bold text-[#6b4724] mb-1">Mối quan hệ con riêng:</label>
                  <label className="flex items-center gap-1.5 font-semibold text-[#8b5a2b] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isStepChild}
                      onChange={(e) => setIsStepChild(e.target.checked)}
                      className="w-4 h-4 text-[#8b5a2b] border-[#d6b583] rounded focus:ring-[#b8956b] accent-[#8b5a2b]"
                    />
                    Con riêng của Chồng/Vợ
                  </label>
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

                {/* Birth Year */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block font-bold text-[#6b4724]">Năm sinh:</label>
                    {birthYear && getCanChi(birthYear) && (
                      <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-bold">
                        Âm lịch: {getCanChi(birthYear)}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={birthYear}
                      onChange={(e) => setBirthYear(e.target.value)}
                      className="w-full p-2 border border-[#d6b583] rounded bg-[#fdfbf7] pr-20"
                      placeholder="Ví dụ: 1949"
                    />
                    {!isDeceased && birthYear && !isNaN(parseYearStr(birthYear)) && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                        {2026 - parseYearStr(birthYear)} tuổi (2026)
                      </span>
                    )}
                  </div>
                </div>

                {/* Deceased Toggle */}
                <div>
                  <label className="block font-bold text-[#6b4724] mb-1">Trạng thái sống:</label>
                  <label className="flex items-center gap-1.5 font-semibold">
                    <input
                      type="checkbox"
                      checked={isDeceased}
                      onChange={(e) => setIsDeceased(e.target.checked)}
                      className="w-4 h-4"
                    />
                    Đã khuất (Tạ thế) †
                  </label>
                </div>

                {/* Death Year & Detailed Info */}
                {isDeceased && (
                  <div className="col-span-1 md:col-span-2 p-4 bg-rose-50/20 border border-rose-100 rounded-xl space-y-4 shadow-2xs">
                    <h4 className="font-serif font-bold text-rose-800 text-sm border-b border-rose-100 pb-2 flex items-center gap-2">
                      <span>🕯️</span> Thông tin tạ thế chi tiết
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Solar Date of Death */}
                      <div>
                        <label className="block text-xs font-bold text-rose-700 mb-1">Ngày, tháng, năm mất (Dương lịch):</label>
                        <input
                          type="date"
                          value={deathDateSolar ? (deathDateSolar.includes('/') ? deathDateSolar.split('/').reverse().join('-') : deathDateSolar) : ''}
                          onChange={(e) => {
                            const val = e.target.value; // YYYY-MM-DD
                            if (val) {
                              const parts = val.split('-');
                              const formatted = `${parts[2]}/${parts[1]}/${parts[0]}`; // DD/MM/YYYY
                              setDeathDateSolar(formatted);
                              setDeathYear(parts[0]);
                              const lunar = convertSolarToLunarStr(formatted);
                              if (lunar) {
                                setDeathDateLunar(lunar);
                              }
                            } else {
                              setDeathDateSolar('');
                              setDeathDateLunar('');
                            }
                          }}
                          className="w-full p-2 text-sm border border-rose-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                        />
                        <span className="text-[10px] text-gray-500 mt-1 block">Hoặc nhập tay định dạng Ngày/Tháng/Năm bên dưới:</span>
                        <input
                          type="text"
                          value={deathDateSolar}
                          onChange={(e) => {
                            const val = e.target.value;
                            setDeathDateSolar(val);
                            const lunar = convertSolarToLunarStr(val);
                            if (lunar) {
                              setDeathDateLunar(lunar);
                            }
                          }}
                          placeholder="Ví dụ: 29/06/2012"
                          className="w-full mt-1 p-2 text-sm border border-rose-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                        />
                      </div>

                      {/* Hour/Minute of Death */}
                      <div>
                        <label className="block text-xs font-bold text-rose-700 mb-1">Giờ, phút mất (nếu có):</label>
                        <div className="flex gap-2">
                          <input
                            type="time"
                            value={deathTime && deathTime.match(/^\d{2}:\d{2}$/) ? deathTime : ''}
                            onChange={(e) => setDeathTime(e.target.value)}
                            className="p-2 text-sm border border-rose-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 shrink-0"
                          />
                          <input
                            type="text"
                            value={deathTime}
                            onChange={(e) => setDeathTime(e.target.value)}
                            placeholder="Ví dụ: 09:30 hoặc Giờ Ngọ"
                            className="w-full p-2 text-sm border border-rose-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                          />
                        </div>
                        <span className="text-[10px] text-gray-500 mt-1 block">Có thể chọn giờ số hoặc gõ giờ truyền thống (Giờ Tý, Ngọ...)</span>
                      </div>

                      {/* Death Year (Calculated / Editable) */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-xs font-bold text-rose-700">Năm tạ thế (Dương lịch):</label>
                          {deathYear && getCanChi(deathYear) && (
                            <span className="text-[10px] text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded font-bold">
                              Năm Can Chi: {getCanChi(deathYear)}
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            value={deathYear}
                            onChange={(e) => setDeathYear(e.target.value)}
                            className="w-full p-2 text-sm border border-rose-200 rounded-lg bg-white pr-20 focus:outline-none focus:ring-2 focus:ring-rose-400"
                            placeholder="Ví dụ: 2012"
                          />
                          {birthYear && deathYear && !isNaN(parseYearStr(birthYear)) && !isNaN(parseYearStr(deathYear)) && (
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                              Hưởng thọ: {parseYearStr(deathYear) - parseYearStr(birthYear)} tuổi
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Automatically Translated Lunar Date */}
                      <div>
                        <label className="block text-xs font-bold text-rose-700 mb-1">Ngày mất Âm lịch (Tự dịch):</label>
                        <input
                          type="text"
                          value={deathDateLunar}
                          onChange={(e) => setDeathDateLunar(e.target.value)}
                          placeholder="Tự động dịch khi nhập ngày Dương lịch"
                          className="w-full p-2 text-sm border border-rose-200 rounded-lg bg-rose-50 font-semibold text-rose-700 placeholder-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-400"
                        />
                        <span className="text-[10px] text-gray-500 mt-1 block">Chỉnh sửa lại tự do nếu muốn bổ sung thông tin chi tiết.</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Dynamic Lunar & Age Info */}
                {(() => {
                  const info = getAgeAndLifespanText();
                  if (!info) return null;
                  const bLunarStr = convertSolarToLunarStr(birthYear);
                  const dLunarStr = convertSolarToLunarStr(deathYear);
                  return (
                    <div className="col-span-1 md:col-span-2 p-3 bg-amber-50/60 border border-amber-200 rounded-xl flex items-start gap-2.5 shadow-2xs">
                      <span className="text-sm mt-0.5">📅</span>
                      <div>
                        <p className="font-bold text-amber-950 leading-snug">
                          Tính toán Âm lịch & Tuổi thọ (Tự sinh):
                        </p>
                        <p className="font-semibold text-amber-900 mt-0.5">
                          {info.ageText}
                        </p>
                        {bLunarStr && (
                          <p className="text-amber-800 font-semibold mt-1">
                            Sinh (Âm lịch): {bLunarStr}
                          </p>
                        )}
                        {dLunarStr && (
                          <p className="text-rose-700 font-semibold mt-1">
                            Mất (Âm lịch): {dLunarStr}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })()}

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
                    <SearchableSelect
                      options={members
                        .filter(m => m.gender === 'male' && m.id !== (editingMember?.id || ''))
                        .map(m => ({
                          value: m.id,
                          label: m.name,
                          sublabel: `Đời ${m.generation}${m.birthYear ? ` • Sinh năm ${m.birthYear}` : ''}${m.isDeceased ? ' • Đã khuất †' : ''}`
                        }))}
                      value={parentId}
                      onChange={setParentId}
                      placeholder="Tìm cha theo tên, đời hoặc năm sinh..."
                      noneOptionLabel="-- Không có hoặc là Cụ tổ --"
                      emptyLabel="Không tìm thấy cha phù hợp"
                    />
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
                    <SearchableSelect
                      options={members
                        .filter(m => m.gender === 'female' && m.id !== (editingMember?.id || ''))
                        .map(m => ({
                          value: m.id,
                          label: m.name,
                          sublabel: `Đời ${m.generation}${m.birthYear ? ` • Sinh năm ${m.birthYear}` : ''}${m.isDeceased ? ' • Đã khuất †' : ''}`
                        }))}
                      value={motherId}
                      onChange={setMotherId}
                      placeholder="Tìm mẹ theo tên, đời hoặc năm sinh..."
                      noneOptionLabel="-- Không có hoặc Chưa rõ mẫu thân --"
                      emptyLabel="Không tìm thấy mẹ phù hợp"
                    />
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

                {/* Member Avatar / Image */}
                <div className="col-span-1 md:col-span-2 p-4 bg-amber-50/20 border border-[#eadecb] rounded-xl space-y-2 shadow-2xs">
                  <h4 className="font-serif font-bold text-[#6b4724] text-sm border-b border-[#eadecb] pb-1.5 flex items-center gap-2">
                    <span>🖼️</span> Ảnh chân dung / Tư liệu thành viên
                  </h4>
                  <ImageUploader
                    value={avatar}
                    onChange={setAvatar}
                    label="Hình ảnh chân dung (URL hoặc Tải lên):"
                    placeholder="Dán liên kết ảnh, Google Drive chia sẻ hoặc chọn ảnh tải từ máy..."
                  />
                  <p className="text-[10px] text-gray-500 mt-1 block">
                    Khuyên dùng ảnh chân dung, ảnh thờ hoặc các tư liệu lịch sử liên quan đến thành viên này.
                  </p>
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
                {editingAnnouncement ? 'Chỉnh Sửa Thông Báo Dòng Họ' : 'Đăng Thông Báo Dòng Họ Mới'}
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
                  {editingAnnouncement ? 'Lưu cập nhật' : 'Đăng ngay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
