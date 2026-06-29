import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TreeDeciduous, LogIn, LogOut, Shield, Heart, Users, BookOpen, BarChart3, HelpCircle, Star } from 'lucide-react';
import { FamilyMember, Announcement, AltarPrayer, SystemLog, SystemUser } from './types';
import { initialMembers, initialAnnouncements } from './data/familyData';

// Import sub-views
import HomeView from './components/HomeView';
import TreeView from './components/TreeView';
import MemberListView from './components/MemberListView';
import MemberTableView from './components/MemberTableView';
import MemorialView from './components/MemorialView';
import StatisticsView from './components/StatisticsView';
import AdminView from './components/AdminView';

export default function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [tablesNeedInitialization, setTablesNeedInitialization] = useState(false);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);

  // Core Application Database States
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [prayers, setPrayers] = useState<AltarPrayer[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);

  // System Settings State
  const [settings, setSettings] = useState<Record<string, string>>({
    heroTitle: localStorage.getItem('heroTitle') || "Gia Phả Gia Đình",
    heroSubtitle: localStorage.getItem('heroSubtitle') || "Cụ Nghiêm Cung",
    heroImage: localStorage.getItem('heroImage') || "https://images.unsplash.com/photo-1605369572399-05d8d64a0f6e?q=80&w=2000&auto=format&fit=crop",
    introText1: localStorage.getItem('introText1') || "Cây có gốc mới nở cành xanh ngọn, nước có nguồn mới bể rộng sông sâu. Người có tổ tông mới sinh con cháu, hiếu nghĩa vẹn tròn mới rạng rỡ tổ tiên.",
    introText2: localStorage.getItem('introText2') || "Gia phả gia đình dòng họ Cụ Nghiêm Cung (kế thừa dòng dõi cụ cố Nghiêm Điều (Chu) tại vùng đất Hòa Xá cổ kính, giàu truyền thống cách mạng) được lập ra nhằm mục đích kính cáo tổ tông, ghi chép tường tận huyết mạch dòng giống, lưu truyền cho con cháu vạn đời sau không bao giờ quên đi nguồn cội thiêng liêng của mình.",
    introText3: localStorage.getItem('introText3') || "Trải qua bao thăng trầm của lịch sử, con cháu họ Nghiêm luôn gìn giữ nếp gia phong nghiêm cẩn, lấy hiếu học làm đầu, lấy đức độ làm trọng, lấy trung thực làm gương và hết lòng đùm bọc, giúp đỡ lẫn nhau vượt qua gian khó, lập thân kiến nghiệp làm rạng danh gia đình."
  });

  // Custom User Accounts
  const [users, setUsers] = useState<SystemUser[]>([]);

  // Auth States
  const [currentUser, setCurrentUser] = useState<{ username: string; fullName: string; role: string } | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Initialize and load from Supabase with localStorage fallbacks
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resMembers = await fetch('/api/members');
        if (resMembers.ok) {
          const json = await resMembers.json();
          if (json.tablesNeedInitialization) {
            setTablesNeedInitialization(true);
          }
          if (json.data) {
            setMembers(json.data);
            localStorage.setItem('gia_pha_members', JSON.stringify(json.data));
          }
        } else {
          throw new Error("HTTP members error");
        }

        const resAnn = await fetch('/api/announcements');
        if (resAnn.ok) {
          const json = await resAnn.json();
          if (json.tablesNeedInitialization) {
            setTablesNeedInitialization(true);
          }
          if (json.data) {
            setAnnouncements(json.data);
            localStorage.setItem('gia_pha_announcements', JSON.stringify(json.data));
          }
        }

        const resPrayers = await fetch('/api/prayers');
        if (resPrayers.ok) {
          const json = await resPrayers.json();
          if (json.tablesNeedInitialization) {
            setTablesNeedInitialization(true);
          }
          if (json.data) {
            setPrayers(json.data);
            localStorage.setItem('gia_pha_prayers', JSON.stringify(json.data));
          }
        }

        const resLogs = await fetch('/api/logs');
        if (resLogs.ok) {
          const json = await resLogs.json();
          if (json.tablesNeedInitialization) {
            setTablesNeedInitialization(true);
          }
          if (json.data) {
            setLogs(json.data);
            localStorage.setItem('gia_pha_logs', JSON.stringify(json.data));
          }
        }

        // Fetch settings from database
        try {
          const resSettings = await fetch('/api/settings');
          if (resSettings.ok) {
            const json = await resSettings.json();
            if (json.data && json.data.length > 0) {
              const loaded: Record<string, string> = {};
              json.data.forEach((s: any) => {
                loaded[s.key] = s.value;
              });
              setSettings(prev => ({ ...prev, ...loaded }));
            }
          }
        } catch (err) {
          console.warn("Database query failed for settings, falling back.");
        }

        // Fetch custom users from database
        try {
          const resUsers = await fetch('/api/users');
          if (resUsers.ok) {
            const json = await resUsers.json();
            if (json.data) {
              setUsers(json.data);
              localStorage.setItem('gia_pha_users', JSON.stringify(json.data));
            }
          }
        } catch (err) {
          console.warn("Database query failed for users, falling back.");
        }
      } catch (e) {
        console.warn("Backend API not reachable or error. Falling back to local storage.", e);
        
        // Fallbacks
        const storedMembers = localStorage.getItem('gia_pha_members');
        const storedAnnouncements = localStorage.getItem('gia_pha_announcements');
        const storedPrayers = localStorage.getItem('gia_pha_prayers');
        const storedLogs = localStorage.getItem('gia_pha_logs');

        if (storedMembers) setMembers(JSON.parse(storedMembers));
        else setMembers(initialMembers);

        if (storedAnnouncements) setAnnouncements(JSON.parse(storedAnnouncements));
        else setAnnouncements(initialAnnouncements);

        if (storedPrayers) setPrayers(JSON.parse(storedPrayers));
        else {
          const defaultPrayers: AltarPrayer[] = [
            {
              id: 'p-1',
              sender: 'Nghiêm Xuân Tuấn',
              message: 'thành tâm thắp nén tâm hương trầm kính dâng hương hồn Cụ Nghiêm Cung và cụ cố Nghiêm Điều cầu mong gia tộc thịnh đạt, gia quyến bình an.',
              timestamp: '2026-06-28 20:15',
              offeringType: 'incense'
            },
            {
              id: 'p-2',
              sender: 'Nghiêm Thị Thanh',
              message: 'dâng đĩa hoa tươi quả ngọt kính dâng Tiên tổ tiên linh mong hai cụ che chở con cháu học tập tiến bộ.',
              timestamp: '2026-06-29 09:30',
              offeringType: 'flower'
            }
          ];
          setPrayers(defaultPrayers);
        }

        if (storedLogs) setLogs(JSON.parse(storedLogs));
        else {
          const initialLogs: SystemLog[] = [
            { id: 'l-1', action: 'khởi tạo cơ sở dữ liệu gia phả ban đầu', user: 'Hệ thống', timestamp: '2026-06-28 21:50' }
          ];
          setLogs(initialLogs);
        }

        // Local settings fallbacks
        const storedKeys = ['heroTitle', 'heroSubtitle', 'heroImage', 'introText1', 'introText2', 'introText3'];
        const loaded: Record<string, string> = {};
        storedKeys.forEach(k => {
          const val = localStorage.getItem(k);
          if (val) loaded[k] = val;
        });
        if (Object.keys(loaded).length > 0) {
          setSettings(prev => ({ ...prev, ...loaded }));
        }

        // Local users fallbacks
        const storedUsers = localStorage.getItem('gia_pha_users');
        if (storedUsers) {
          setUsers(JSON.parse(storedUsers));
        }
      }

      const storedUser = localStorage.getItem('gia_pha_user');
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    };

    fetchData();
  }, []);

  // Helpers to persist data changes
  const saveMembers = (newMembers: FamilyMember[]) => {
    setMembers(newMembers);
    localStorage.setItem('gia_pha_members', JSON.stringify(newMembers));
  };

  const saveAnnouncements = (newAnns: Announcement[]) => {
    setAnnouncements(newAnns);
    localStorage.setItem('gia_pha_announcements', JSON.stringify(newAnns));
  };

  const savePrayers = (newPrayers: AltarPrayer[]) => {
    setPrayers(newPrayers);
    localStorage.setItem('gia_pha_prayers', JSON.stringify(newPrayers));
  };

  const saveLogs = (newLogs: SystemLog[]) => {
    setLogs(newLogs);
    localStorage.setItem('gia_pha_logs', JSON.stringify(newLogs));
  };

  const addLog = async (action: string, user: string) => {
    const newLog: SystemLog = {
      id: `l-${Date.now()}`,
      action,
      user,
      timestamp: new Date().toLocaleString('vi-VN'),
    };
    const updatedLogs = [newLog, ...logs];
    saveLogs(updatedLogs);

    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLog)
      });
    } catch (err) {
      console.error("Failed to sync log to database:", err);
    }
  };

  // Auth Functions
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const customUser = users.find(u => u.username === username.trim().toLowerCase() && u.password === password);

    // Specific instruction rule: admin/admin login explicitly
    if (username === 'admin' && password === 'admin') {
      const user = { username: 'admin', fullName: 'Quản Trị Viên Chi Trưởng', role: 'admin' };
      setCurrentUser(user);
      localStorage.setItem('gia_pha_user', JSON.stringify(user));
      setIsLoginModalOpen(false);
      setUsername('');
      setPassword('');
      addLog('đăng nhập vào hệ thống quản trị', 'admin');
    } else if (customUser) {
      const user = { username: customUser.username, fullName: customUser.fullName, role: customUser.role };
      setCurrentUser(user);
      localStorage.setItem('gia_pha_user', JSON.stringify(user));
      setIsLoginModalOpen(false);
      setUsername('');
      setPassword('');
      addLog('đăng nhập vào hệ thống quản trị', customUser.fullName);
    } else {
      setLoginError('Sai tài khoản đăng nhập hoặc mật khẩu quản trị!');
    }
  };

  const handleLogout = () => {
    addLog('đăng xuất khỏi hệ thống', currentUser?.username || 'admin');
    setCurrentUser(null);
    localStorage.removeItem('gia_pha_user');
    if (currentTab === 'admin') {
      setCurrentTab('home');
    }
  };

  // Systems Configuration Handlers
  const handleSaveSetting = async (key: string, value: string) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      localStorage.setItem(key, value);
      return next;
    });
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      });
      addLog(`cập nhật cấu hình: ${key}`, currentUser?.fullName || 'admin');
    } catch (err) {
      console.error("Failed to save setting to database:", err);
    }
  };

  const handleAddUser = async (user: SystemUser) => {
    setUsers(prev => {
      const next = [user, ...prev.filter(u => u.username !== user.username)];
      localStorage.setItem('gia_pha_users', JSON.stringify(next));
      return next;
    });
    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      addLog(`cấp tài khoản quản lý mới: ${user.username}`, currentUser?.fullName || 'admin');
    } catch (err) {
      console.error("Failed to add custom user to database:", err);
    }
  };

  const handleDeleteUser = async (username: string) => {
    setUsers(prev => {
      const next = prev.filter(u => u.username !== username);
      localStorage.setItem('gia_pha_users', JSON.stringify(next));
      return next;
    });
    try {
      await fetch(`/api/users/${username}`, {
        method: 'DELETE'
      });
      addLog(`thu hồi tài khoản quản trị: ${username}`, currentUser?.fullName || 'admin');
    } catch (err) {
      console.error("Failed to delete custom user from database:", err);
    }
  };

  // CRUD Callback Handlers for Admin Dashboard
  const handleAddMember = async (member: FamilyMember) => {
    const updated = [member, ...members];
    saveMembers(updated);
    
    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(member)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setMembers(prev => prev.map(m => m.id === member.id ? json.data : m));
        }
      }
    } catch (err) {
      console.error("Failed to add member to Supabase:", err);
    }
    await addLog(`thêm mới thành viên phả hệ: ${member.name}`, currentUser?.fullName || 'admin');
  };

  const handleEditMember = async (member: FamilyMember) => {
    const updated = members.map((m) => (m.id === member.id ? member : m));
    saveMembers(updated);

    try {
      await fetch(`/api/members/${member.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(member)
      });
    } catch (err) {
      console.error("Failed to edit member in Supabase:", err);
    }
    await addLog(`chỉnh sửa thông tin thành viên phả hệ: ${member.name}`, currentUser?.fullName || 'admin');
  };

  const handleDeleteMember = async (id: string) => {
    const name = members.find((m) => m.id === id)?.name || id;
    const updated = members.filter((m) => m.id !== id);
    saveMembers(updated);

    try {
      await fetch(`/api/members/${id}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error("Failed to delete member from Supabase:", err);
    }
    await addLog(`xóa bỏ thành viên khỏi gia hệ: ${name}`, currentUser?.fullName || 'admin');
  };

  const handleSyncAll = async (newMembers: FamilyMember[]) => {
    saveMembers(newMembers);
    try {
      const res = await fetch('/api/members/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMembers)
      });
      
      const contentType = res.headers.get('content-type');
      if (res.ok) {
        if (contentType && contentType.includes('application/json')) {
          const json = await res.json();
          if (json.success && json.data) {
            setMembers(json.data);
            localStorage.setItem('gia_pha_members', JSON.stringify(json.data));
          }
          await addLog(`đồng bộ hóa toàn bộ danh sách phả hệ (${newMembers.length} thành viên)`, currentUser?.fullName || 'admin');
          return { success: true, count: newMembers.length };
        } else {
          await addLog(`đồng bộ hóa toàn bộ danh sách phả hệ ngoại tuyến (${newMembers.length} thành viên)`, currentUser?.fullName || 'admin');
          return { success: true, count: newMembers.length, isOffline: true };
        }
      } else {
        if (contentType && contentType.includes('application/json')) {
          const errJson = await res.json();
          throw new Error(errJson.error || "HTTP sync error");
        } else {
          const text = await res.text();
          if (res.status === 404 || text.includes('<!DOCTYPE html>') || text.includes('The page') || text.includes('not found')) {
            await addLog(`lưu phả hệ ngoại tuyến trên Vercel (${newMembers.length} thành viên)`, currentUser?.fullName || 'admin');
            return { 
              success: true, 
              count: newMembers.length, 
              isOffline: true,
              message: "Hệ thống đang chạy ở chế độ tĩnh ngoại tuyến (không có máy chủ Node.js). Dữ liệu gia phả của bạn đã được cập nhật thành công và lưu trữ trực tiếp trên trình duyệt (Local Storage) của thiết bị này!" 
            };
          }
          throw new Error(text || `Yêu cầu không thành công với mã trạng thái ${res.status}`);
        }
      }
    } catch (err: any) {
      console.error("Failed to sync members to Supabase:", err);
      await addLog(`lỗi đồng bộ hóa phả hệ: ${err.message}`, currentUser?.fullName || 'admin');
      
      if (err.message && (err.message.includes('fetch') || err.message.includes('Failed to fetch') || err.message.includes('NetworkError') || err.message.includes('JSON'))) {
        return {
          success: true,
          count: newMembers.length,
          isOffline: true,
          message: "Lưu trữ thành công vào bộ nhớ trình duyệt! (Phát hiện lỗi kết nối máy chủ, hệ thống tự động chuyển sang chế độ lưu trữ thiết bị ngoại tuyến)."
        };
      }
      return { success: false, error: err.message };
    }
  };

  const handleAddAnnouncement = async (ann: Announcement) => {
    const updated = [ann, ...announcements];
    saveAnnouncements(updated);

    try {
      await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ann)
      });
    } catch (err) {
      console.error("Failed to add announcement to Supabase:", err);
    }
    await addLog(`đăng tải thông báo mới: "${ann.title}"`, currentUser?.fullName || 'admin');
  };

  const handleDeleteAnnouncement = async (id: string) => {
    const title = announcements.find((a) => a.id === id)?.title || id;
    const updated = announcements.filter((a) => a.id !== id);
    saveAnnouncements(updated);

    try {
      await fetch(`/api/announcements/${id}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error("Failed to delete announcement from Supabase:", err);
    }
    await addLog(`gỡ bỏ thông báo dòng họ: "${title}"`, currentUser?.fullName || 'admin');
  };

  // Prayer Altar Offering log Callback
  const handleAddPrayer = async (sender: string, message: string, offeringType: 'incense' | 'candle' | 'flower' | 'none') => {
    const newPrayer: AltarPrayer = {
      id: `p-${Date.now()}`,
      sender,
      message,
      timestamp: new Date().toLocaleString('vi-VN'),
      offeringType,
    };
    const updated = [newPrayer, ...prayers];
    savePrayers(updated);

    try {
      await fetch('/api/prayers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPrayer)
      });
    } catch (err) {
      console.error("Failed to save prayer to Supabase:", err);
    }
  };

  // Printing & Document Exports Action Placeholders
  const handlePrint = () => {
    window.print();
  };

  const handleExportWord = () => {
    // Elegant download trigger
    const content = `GIA PHẢ GIA ĐÌNH CỤ NGHIÊM CUNG\n\nDanh sách dòng tộc chi thứ đời 15 - 19:\n\n` + 
                    members.map(m => `- Đời ${m.generation}: ${m.name} (${m.role}) - ${m.isDeceased ? 'Đã mất' : 'Còn sống'}`).join('\n') + 
                    `\n\nXuất bản tại Hà Nội, năm 2026.`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'GiaPha_CuNghiemCung_XuatBan.doc';
    link.click();
    addLog('tải xuống văn bản gia phả thô (.doc)', 'Người dùng');
  };

  const handleExportPdf = () => {
    const content = `GIA PHẢ GIA ĐÌNH CỤ NGHIÊM CUNG\n\nChiết xuất báo cáo hồ sơ phả hệ kỹ thuật số\n\n` + 
                    members.map(m => `[Thế hệ ${m.generation}] ${m.name} | Vai trò: ${m.role} | Trạng thái: ${m.isDeceased ? 'Đã tạ thế' : 'Còn sống'} | Nơi ở: ${m.address || 'Hòa Xá'}`).join('\n') + 
                    `\n\nTài liệu nội bộ lưu hành gia tộc.`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'BaoCao_Phashe_CuNghiemCung.pdf';
    link.click();
    addLog('tải xuống văn bản PDF bảo tồn (.pdf)', 'Người dùng');
  };

  return (
    <div className="min-h-screen flex flex-col text-[#4a331a] bg-[#fdfbf7] font-sans">
      
      {/* 1. HERO BANNER HEADER */}
      <header className="relative bg-[#3e2a16] h-[220px] md:h-[280px] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 opacity-25 bg-center bg-cover" 
          style={{ backgroundImage: `url('${settings.heroImage}')` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#2a1d0f] to-transparent"></div>
        
        <div className="relative z-10 text-center px-4">
          <div className="flex items-center justify-center space-x-4 mb-3">
            <div className="h-[1.5px] w-12 md:w-20 bg-[#d6b583]"></div>
            <div className="text-[#d6b583] text-xl md:text-2xl"><TreeDeciduous className="w-6 h-6 inline" /></div>
            <div className="h-[1.5px] w-12 md:w-20 bg-[#d6b583]"></div>
          </div>
          <h1 className="text-2xl md:text-5xl font-extrabold text-[#fdfbf7] uppercase tracking-widest font-serif drop-shadow-md mb-2">
            {settings.heroTitle}
          </h1>
          <h2 className="text-xl md:text-3.5xl font-extrabold text-[#d6b583] uppercase tracking-widest font-serif drop-shadow-sm">
            {settings.heroSubtitle}
          </h2>
        </div>
      </header>

      {/* 2. NAVBAR NAVIGATION */}
      <nav className="bg-[#5c3e21] text-[#fdfbf7] shadow-lg sticky top-0 z-40 border-b border-[#4a3219]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <TreeDeciduous className="w-6 h-6 text-[#d6b583]" />
              <span className="font-serif font-bold text-sm tracking-wide hidden sm:inline text-[#d6b583]">Nghiêm Gia Hệ</span>
            </div>

            {/* Nav links */}
            <div className="flex items-center space-x-1 overflow-x-auto max-w-[80%] no-scrollbar py-1">
              <button
                onClick={() => setCurrentTab('home')}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1 shrink-0 ${
                  currentTab === 'home'
                    ? 'bg-[#4a3219] text-[#eadecb] border-b-2 border-[#d6b583]'
                    : 'hover:bg-[#4a3219] hover:text-white text-gray-200'
                }`}
              >
                Trang chủ
              </button>
              <button
                onClick={() => setCurrentTab('family-tree')}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1 shrink-0 ${
                  currentTab === 'family-tree'
                    ? 'bg-[#4a3219] text-[#eadecb] border-b-2 border-[#d6b583]'
                    : 'hover:bg-[#4a3219] hover:text-white text-gray-200'
                }`}
              >
                Cây gia phả
              </button>
              <button
                onClick={() => setCurrentTab('member-table')}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1 shrink-0 ${
                  currentTab === 'member-table'
                    ? 'bg-[#4a3219] text-[#eadecb] border-b-2 border-[#d6b583]'
                    : 'hover:bg-[#4a3219] hover:text-white text-gray-200'
                }`}
              >
                Danh sách
              </button>
              <button
                onClick={() => setCurrentTab('member-list')}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1 shrink-0 ${
                  currentTab === 'member-list'
                    ? 'bg-[#4a3219] text-[#eadecb] border-b-2 border-[#d6b583]'
                    : 'hover:bg-[#4a3219] hover:text-white text-gray-200'
                }`}
              >
                Tra cứu
              </button>
              <button
                onClick={() => setCurrentTab('memorial')}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1 shrink-0 ${
                  currentTab === 'memorial'
                    ? 'bg-[#4a3219] text-[#eadecb] border-b-2 border-[#d6b583]'
                    : 'hover:bg-[#4a3219] hover:text-white text-gray-200'
                }`}
              >
                Phòng tưởng niệm
              </button>
              <button
                onClick={() => setCurrentTab('statistics')}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1 shrink-0 ${
                  currentTab === 'statistics'
                    ? 'bg-[#4a3219] text-[#eadecb] border-b-2 border-[#d6b583]'
                    : 'hover:bg-[#4a3219] hover:text-white text-gray-200'
                }`}
              >
                Thống kê
              </button>
              
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => setCurrentTab('admin')}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1 shrink-0 bg-red-950/40 text-rose-300 border border-red-900/40 ${
                    currentTab === 'admin' ? 'bg-[#4a3219] border-b-2 border-[#d6b583]' : 'hover:bg-red-900/60'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  Quản trị
                </button>
              )}
            </div>

            {/* User Session Login Control */}
            <div className="flex items-center gap-2">
              {currentUser ? (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] md:text-xs font-bold text-[#d6b583] hidden md:inline">
                    Chào, {currentUser.fullName}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="p-2 bg-red-800 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-1 text-xs font-bold"
                    title="Đăng xuất"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline">Thoát</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="px-3.5 py-1.5 bg-[#d6b583] text-[#4a3219] rounded-lg hover:bg-[#c29f6b] transition flex items-center gap-1.5 text-xs font-bold shadow-xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Đăng nhập
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 3. RUNNING SLIDER ADVISORY (MARQUEE) */}
      <div className="bg-[#d6b583] text-[#4a3219] py-1.5 border-b border-[#c29f6b] overflow-hidden relative">
        <div className="animate-marquee whitespace-nowrap text-xs font-bold flex gap-4">
          <span>
            <Star className="w-3.5 h-3.5 text-[#7c562e] inline-block mr-1 align-middle" /> 
            Mộc bản thụ nguyên, thuỷ lưu tuyền bản - Cây có cội, nước có nguồn. Chào mừng quý thành viên về với dòng họ Nghiêm Cung. Chúc đại gia đình an khang thịnh vượng, hanh thông tấn tài tấn lộc! 
          </span>
          <span>
            <Star className="w-3.5 h-3.5 text-[#7c562e] inline-block mr-1 align-middle" /> 
            Mộc bản thụ nguyên, thuỷ lưu tuyền bản - Cây có cội, nước có nguồn. Chào mừng quý thành viên về với dòng họ Nghiêm Cung. Chúc đại gia đình an khang thịnh vượng, hanh thông tấn tài tấn lộc! 
          </span>
        </div>
      </div>

      {/* Database Initialization Check Banner */}
      {tablesNeedInitialization && (
        <div className="bg-amber-50 border-b border-amber-200 text-[#7c562e] px-4 py-3 text-xs md:text-sm font-semibold flex flex-col md:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="animate-pulse bg-amber-500 text-white rounded-full w-2 h-2 shrink-0"></span>
            <span>Hệ thống phát hiện các bảng dữ liệu Supabase chưa được khởi tạo. Ứng dụng đang chạy ở chế độ Offline dự phòng.</span>
          </div>
          <button
            onClick={() => setIsSqlModalOpen(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-1.5 rounded-lg font-bold transition shrink-0 uppercase tracking-wide text-[10px]"
          >
            Xem hướng dẫn khởi tạo SQL
          </button>
        </div>
      )}

      {/* 4. ACTIVE VIEW AREA */}
      <div className="flex-1 w-full bg-[#fdfbf7] flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex-1 w-full flex flex-col"
          >
            {currentTab === 'home' && (
              <HomeView
                members={members}
                announcements={announcements}
                setCurrentTab={setCurrentTab}
                onPrint={handlePrint}
                onExportWord={handleExportWord}
                onExportPdf={handleExportPdf}
                settings={settings}
              />
            )}

            {currentTab === 'family-tree' && <TreeView members={members} />}

            {currentTab === 'member-table' && (
              <MemberTableView
                members={members}
                onAddMember={handleAddMember}
                onEditMember={handleEditMember}
                onDeleteMember={handleDeleteMember}
                onSyncAll={handleSyncAll}
                currentUser={currentUser}
                onOpenLogin={() => setIsLoginModalOpen(true)}
              />
            )}

            {currentTab === 'member-list' && <MemberListView members={members} />}

            {currentTab === 'memorial' && (
              <MemorialView members={members} prayers={prayers} onAddPrayer={handleAddPrayer} />
            )}

            {currentTab === 'statistics' && <StatisticsView members={members} />}

            {currentTab === 'admin' && currentUser?.role === 'admin' && (
              <AdminView
                members={members}
                announcements={announcements}
                logs={logs}
                onAddMember={handleAddMember}
                onEditMember={handleEditMember}
                onDeleteMember={handleDeleteMember}
                onAddAnnouncement={handleAddAnnouncement}
                onDeleteAnnouncement={handleDeleteAnnouncement}
                settings={settings}
                onSaveSetting={handleSaveSetting}
                users={users}
                onAddUser={handleAddUser}
                onDeleteUser={handleDeleteUser}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 5. ELEVATED FOOTER */}
      <footer className="bg-[#3e2a16] text-[#eadecb] py-8 border-t-4 border-[#b8956b] mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-3">
          <h4 className="font-serif font-extrabold text-lg text-[#fdfbf7]">{settings.heroTitle} {settings.heroSubtitle}</h4>
          <p className="text-xs opacity-75 max-w-md mx-auto">
            Hệ thống kỹ thuật số bảo tồn phả hệ họ Nghiêm Việt Nam. Kế thừa tổ tông, khai sơn lập họ, bảo tồn truyền thống huyết thống thiêng liêng.
          </p>
          <div className="text-[10px] opacity-60">
            &copy; 2026 Gia tộc {settings.heroSubtitle}. Tất cả quyền được bảo lưu. Quê quán: Xã Hòa Xá, Thành phố Hà Nội.
          </div>
        </div>
      </footer>

      {/* 6. ADMIN AUTH LOGIN MODAL */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden border border-[#b8956b] shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-5 bg-[#3e2a16] text-center text-white relative">
              <button
                onClick={() => {
                  setIsLoginModalOpen(false);
                  setLoginError('');
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl font-bold leading-none"
              >
                &times;
              </button>
              <TreeDeciduous className="w-10 h-10 text-[#d6b583] mx-auto mb-2" />
              <h3 className="text-xl font-bold font-serif uppercase tracking-widest text-[#fdfbf7]">Đăng Nhập Quản Trị</h3>
              <p className="text-[10px] text-gray-400 mt-1">Sử dụng tài khoản ban quản lý được cấp để chỉnh sửa gia phả</p>
            </div>

            <form onSubmit={handleLogin} className="p-6 space-y-4 text-xs text-[#4a331a]">
              {loginError && (
                <div className="p-2.5 bg-red-50 border border-red-300 text-red-700 font-semibold rounded text-center">
                  {loginError}
                </div>
              )}

              <div>
                <label className="block font-bold text-[#6b4724] mb-1">Tên tài khoản (*):</label>
                <input
                  type="text"
                  required
                  placeholder="Nhập tài khoản (Ví dụ: admin)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-2.5 border border-[#d6b583] rounded bg-[#fdfbf7] text-sm focus:outline-none focus:ring-2 focus:ring-[#b8956b]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#6b4724] mb-1">Mật khẩu bảo mật (*):</label>
                <input
                  type="password"
                  required
                  placeholder="Nhập mật khẩu truy cập"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2.5 border border-[#d6b583] rounded bg-[#fdfbf7] text-sm focus:outline-none focus:ring-2 focus:ring-[#b8956b]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#b8956b] hover:bg-[#8b7355] text-white font-extrabold text-sm py-3 rounded-lg shadow-md transition uppercase tracking-wider"
                >
                  Xác thực danh tính
                </button>
              </div>

              <p className="text-[10px] text-gray-400 text-center italic mt-2">
                Tài khoản dùng thử quy định: <strong>admin / admin</strong>
              </p>
            </form>
          </div>
        </div>
      )}

      {/* SQL Setup Instructions Modal */}
      {isSqlModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden border border-[#b8956b] shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-5 bg-[#3e2a16] text-white flex justify-between items-center">
              <h3 className="text-lg font-bold font-serif uppercase tracking-wider text-[#fdfbf7]">Khởi Tạo Cơ Sở Dữ Liệu Supabase</h3>
              <button
                onClick={() => setIsSqlModalOpen(false)}
                className="text-gray-400 hover:text-white text-2xl font-bold leading-none"
              >
                &times;
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs text-[#4a331a]">
              <p className="font-semibold text-sm">Để liên kết phả hệ với cơ sở dữ liệu Supabase, bạn hãy làm theo các bước sau:</p>
              <ol className="list-decimal pl-5 space-y-2 font-medium">
                <li>Truy cập vào trang quản lý <strong>Supabase Dashboard</strong> của dự án.</li>
                <li>Chọn mục <strong>SQL Editor</strong> ở thanh menu bên trái.</li>
                <li>Tạo một truy vấn mới (New Query), sao chép toàn bộ đoạn mã SQL bên dưới dán vào và nhấn <strong>Run</strong>.</li>
              </ol>
              
              <div className="relative">
                <pre className="bg-gray-900 text-green-400 p-4 rounded-xl font-mono text-[11px] overflow-x-auto max-h-[300px]">
{`-- 1. Tạo bảng family_members
CREATE TABLE IF NOT EXISTS family_members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  gender TEXT NOT NULL,
  generation INTEGER NOT NULL,
  role TEXT NOT NULL,
  "birthYear" TEXT,
  "deathYear" TEXT,
  "isDeceased" BOOLEAN NOT NULL DEFAULT false,
  "parentId" TEXT,
  "spouseId" TEXT,
  "spouseIds" TEXT[],
  branch TEXT NOT NULL,
  story TEXT,
  occupation TEXT,
  address TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Thêm cột "spouseIds" vào bảng family_members nếu đã tạo trước đó
ALTER TABLE family_members ADD COLUMN IF NOT EXISTS "spouseIds" TEXT[];

-- 2. Tạo bảng announcements
CREATE TABLE IF NOT EXISTS announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL,
  date TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tạo bảng prayers
CREATE TABLE IF NOT EXISTS prayers (
  id TEXT PRIMARY KEY,
  sender TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  "offeringType" TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tạo bảng system_logs
CREATE TABLE IF NOT EXISTS system_logs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  "user" TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tạo bảng system_users
CREATE TABLE IF NOT EXISTS system_users (
  username TEXT PRIMARY KEY,
  "fullName" TEXT NOT NULL,
  role TEXT NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Tạo bảng system_settings
CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);`}
                </pre>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`-- 1. Tạo bảng family_members
CREATE TABLE IF NOT EXISTS family_members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  gender TEXT NOT NULL,
  generation INTEGER NOT NULL,
  role TEXT NOT NULL,
  "birthYear" TEXT,
  "deathYear" TEXT,
  "isDeceased" BOOLEAN NOT NULL DEFAULT false,
  "parentId" TEXT,
  "spouseId" TEXT,
  "spouseIds" TEXT[],
  branch TEXT NOT NULL,
  story TEXT,
  occupation TEXT,
  address TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Thêm cột "spouseIds" vào bảng family_members nếu đã tạo trước đó
ALTER TABLE family_members ADD COLUMN IF NOT EXISTS "spouseIds" TEXT[];

-- 2. Tạo bảng announcements
CREATE TABLE IF NOT EXISTS announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL,
  date TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tạo bảng prayers
CREATE TABLE IF NOT EXISTS prayers (
  id TEXT PRIMARY KEY,
  sender TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  "offeringType" TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tạo bảng system_logs
CREATE TABLE IF NOT EXISTS system_logs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  "user" TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tạo bảng system_users
CREATE TABLE IF NOT EXISTS system_users (
  username TEXT PRIMARY KEY,
  "fullName" TEXT NOT NULL,
  role TEXT NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Tạo bảng system_settings
CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);`);
                    alert('Đã sao chép đoạn mã SQL vào bộ nhớ đệm!');
                  }}
                  className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white px-2.5 py-1 rounded text-[10px] font-bold"
                >
                  Sao chép SQL
                </button>
              </div>
              <p className="text-gray-500 italic text-[10px]">Sau khi chạy truy vấn trên, hãy tải lại trang này. Hệ thống sẽ tự động đồng bộ hóa và lưu trữ toàn bộ dữ liệu mẫu ban đầu trực tiếp lên Supabase của bạn!</p>
              <div className="flex justify-end pt-2 border-t border-gray-100">
                <button
                  onClick={() => setIsSqlModalOpen(false)}
                  className="bg-[#3e2a16] text-[#fdfbf7] px-4 py-2 rounded-lg font-bold hover:bg-[#5c3e21]"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
