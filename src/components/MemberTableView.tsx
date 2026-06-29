import React, { useState, useMemo } from 'react';
import { Table, Calendar, MapPin, Phone, User, Award, Search, ArrowUpDown, Shield, PlusCircle, Edit2, Trash2, X, Plus, Download, Upload, RefreshCw, FileSpreadsheet, FileJson, Check, Loader2, FileText } from 'lucide-react';
// @ts-ignore
import { getLunarDate } from 'vietnamese-lunar-calendar';
import { FamilyMember } from '../types';

interface MemberTableViewProps {
  members: FamilyMember[];
  onAddMember?: (member: FamilyMember) => void;
  onEditMember?: (member: FamilyMember) => void;
  onDeleteMember?: (id: string) => void;
  onSyncAll?: (newMembers: FamilyMember[]) => Promise<{ success: boolean; count?: number; error?: string }>;
  currentUser?: { username: string; fullName: string; role: string } | null;
  onOpenLogin?: () => void;
}

export default function MemberTableView({
  members,
  onAddMember,
  onEditMember,
  onDeleteMember,
  onSyncAll,
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

  // --- NEW IMPORT/EXPORT & SYNC STATES & HELPERS ---
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importedMembers, setImportedMembers] = useState<FamilyMember[]>([]);
  const [importType, setImportType] = useState<'merge' | 'replace'>('merge');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);

  // Helper: Simple CSV parser that supports quotes
  const parseCSV = (text: string): Record<string, string>[] => {
    const lines = text.split(/\r?\n/);
    if (lines.length === 0) return [];
    
    const rawHeaders = lines[0].split(',');
    const headers = rawHeaders.map(h => h.trim().replace(/^"|"$/g, ''));
    
    const results: Record<string, string>[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim().replace(/^"|"$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim().replace(/^"|"$/g, ''));
      
      const obj: Record<string, string> = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });
      results.push(obj);
    }
    return results;
  };

  // Helper: Map CSV key/values to FamilyMember object properties
  const mapCsvRowToMember = (row: Record<string, string>): Partial<FamilyMember> => {
    const findVal = (keys: string[]): string => {
      for (const k of keys) {
        const foundKey = Object.keys(row).find(rk => 
          rk.toLowerCase().trim() === k.toLowerCase() || 
          rk.toLowerCase().includes(k.toLowerCase())
        );
        if (foundKey) return row[foundKey];
      }
      return '';
    };

    const id = findVal(['id', 'mã số', 'ma so']);
    const name = findVal(['name', 'họ và tên', 'ho va ten', 'họ & tên', 'ho & ten']);
    const genderStr = findVal(['gender', 'giới tính', 'gioi tinh']).toLowerCase();
    const gender: 'male' | 'female' = genderStr.includes('nữ') || genderStr.includes('female') ? 'female' : 'male';
    
    const genStr = findVal(['generation', 'đời thứ', 'doi thu', 'đời', 'doi']);
    const generation = parseInt(genStr) || 18;
    
    const role = findVal(['role', 'vai trò', 'vai tro']);
    const birthYear = findVal(['birthyear', 'năm sinh', 'nam sinh', 'birth']);
    const deathYear = findVal(['deathyear', 'năm mất', 'nam mat', 'death']);
    const deceasedStr = findVal(['isdeceased', 'đã mất', 'da mat', 'deceased']).toLowerCase();
    const isDeceased = deceasedStr.includes('true') || deceasedStr.includes('có') || deceasedStr.includes('đã mất') || deathYear !== '';
    
    const parentId = findVal(['parentid', 'mã cha', 'ma cha']);
    const motherId = findVal(['motherid', 'mã mẹ', 'ma me']);
    const spouseId = findVal(['spouseid', 'mã vợ/chồng', 'mã vợ', 'mã chồng', 'ma vo', 'ma chong']);
    
    const marriedStr = findVal(['ismarried', 'đã kết hôn', 'da ket hon', 'kết hôn', 'ket hon']).toLowerCase();
    const isMarried = marriedStr.includes('true') || marriedStr.includes('có') || spouseId !== '';
    
    const branch = findVal(['branch', 'chi nhánh', 'chi nhanh', 'phân chi', 'phan chi']) || 'Nhánh chính';
    const story = findVal(['story', 'tiểu sử', 'tieu su']);
    const occupation = findVal(['occupation', 'nghề nghiệp', 'nghe nghiep']);
    const address = findVal(['address', 'địa chỉ', 'dia chi']);
    const phone = findVal(['phone', 'điện thoại', 'dien thoai', 'sđt', 'sdt']);

    return {
      id: id || `m-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: name || 'Thành viên mới',
      gender,
      generation,
      role: role || 'Thành viên',
      birthYear: birthYear || undefined,
      deathYear: isDeceased ? (deathYear || undefined) : undefined,
      isDeceased,
      parentId: parentId || undefined,
      motherId: motherId || undefined,
      spouseId: spouseId || undefined,
      isMarried: isMarried || undefined,
      branch: branch || 'Nhánh chính',
      story: story || undefined,
      occupation: occupation || undefined,
      address: address || undefined,
      phone: phone || undefined
    };
  };

  // Action: Trigger file selection programmatically
  const triggerFileInput = () => {
    if (!currentUser) {
      if (onOpenLogin) {
        onOpenLogin();
      } else {
        alert('Vui lòng đăng nhập bằng tài khoản quản trị để thực hiện tải lên biểu mẫu!');
      }
      return;
    }
    const input = document.getElementById('import-file-input');
    if (input) input.click();
  };

  // Action: Read and parse selected CSV, JSON, Excel, DOCX, or PDF file
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    setImportSuccess(null);

    // If it's JSON, parse it locally
    if (file.name.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            setImportedMembers(parsed);
            setIsImportModalOpen(true);
            setImportSuccess(`Đã nhận dạng thành công ${parsed.length} thành viên từ tệp JSON!`);
          } else if (parsed && typeof parsed === 'object') {
            setImportedMembers([parsed]);
            setIsImportModalOpen(true);
            setImportSuccess(`Đã nhận dạng thành công 1 thành viên từ tệp JSON!`);
          } else {
            throw new Error('Định dạng tệp JSON không hợp lệ. Phải là một mảng danh sách thành viên.');
          }
        } catch (err: any) {
          setImportError(err.message || 'Lỗi đọc tệp JSON.');
          alert(err.message || 'Lỗi đọc tệp JSON.');
        }
      };
      reader.readAsText(file, 'UTF-8');
      e.target.value = '';
      return;
    }

    // For xlsx, xls, csv, docx, pdf, upload to our unified endpoint /api/members/parse-document
    setIsSyncing(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        
        // Convert arrayBuffer to Base64 safely
        const bytes = new Uint8Array(arrayBuffer);
        let binaryStr = '';
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
          binaryStr += String.fromCharCode(bytes[i]);
        }
        const base64String = btoa(binaryStr);

        const response = await fetch('/api/members/parse-document', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            base64: base64String,
            fileName: file.name,
            mimeType: file.type
          })
        });

        const resData = await response.json();
        setIsSyncing(false);

        if (!response.ok) {
          throw new Error(resData.error || 'Lỗi phân tích tài liệu.');
        }

        if (resData.success && resData.data) {
          setImportedMembers(resData.data);
          setIsImportModalOpen(true);
          setImportSuccess(`Đã nhận diện thành công ${resData.count} thành viên từ tệp ${file.name}!`);
        } else {
          throw new Error('Không trích xuất được thành viên nào từ tài liệu.');
        }
      } catch (err: any) {
        setIsSyncing(false);
        setImportError(err.message || 'Lỗi đọc tệp.');
        alert(err.message || 'Lỗi đọc tệp.');
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  // Action: Download CSV template with Vietnamese columns and UTF-8 BOM
  const downloadCSVTemplate = () => {
    const viHeaders = [
      'Mã số (id)', 'Họ và tên (name)', 'Giới tính (gender: male/female)', 
      'Đời thứ (generation)', 'Vai trò (role)', 'Năm sinh (birthYear)', 
      'Năm mất (deathYear)', 'Đã mất (isDeceased: true/false)', 
      'Mã cha (parentId)', 'Mã mẹ (motherId)', 'Mã vợ/chồng (spouseId)', 
      'Đã kết hôn (isMarried: true/false)', 'Chi nhánh (branch)', 
      'Tiểu sử (story)', 'Nghề nghiệp (occupation)', 'Địa chỉ (address)', 'Số điện thoại (phone)'
    ];

    const sampleRows = [
      [
        'nghiem-dieu', 'Nghiêm Điều (Chu)', 'male', '15', 'CỤ CỐ ÔNG', 
        '1875', '1945', 'true', '', '', 'cu-ba-lun', 'true', 'Nhánh chính', 
        'Cụ cố khởi tổ sinh cơ lập nghiệp tại Hòa Xá...', 'Nông nghiệp', 'Hòa Xá, Ứng Hòa, Hà Nội', ''
      ],
      [
        'cu-ba-lun', 'Đỗ Thị Lùn', 'female', '15', 'CỤ CỐ BÀ', 
        '1880', '1952', 'true', '', '', 'nghiem-dieu', 'true', 'Nhánh chính', 
        'Cụ cố bà hiền từ đảm đang gánh vác...', 'Nội trợ', 'Hòa Xá, Ứng Hòa, Hà Nội', ''
      ],
      [
        'nghiem-cung', 'Nghiêm Cung', 'male', '16', 'CỤ ÔNG TRỤ CỘT', 
        '1902', '1978', 'true', 'nghiem-dieu', 'cu-ba-lun', '', 'false', 'Nhánh chính', 
        'Y sĩ nổi tiếng trong vùng Hòa Xá...', 'Đông y', 'Hòa Xá, Ứng Hòa, Hà Nội', ''
      ]
    ];

    // Perfect UTF-8 BOM
    let csvContent = '\uFEFF';
    csvContent += viHeaders.join(',') + '\n';
    sampleRows.forEach(row => {
      const escaped = row.map(val => {
        const s = String(val);
        if (s.includes(',') || s.includes('"') || s.includes('\n')) {
          return `"${s.replace(/"/g, '""')}"`;
        }
        return s;
      });
      csvContent += escaped.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'bieu_mau_nhap_gia_pha.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsTemplateMenuOpen(false);
  };

  // Action: Download JSON template
  const downloadJSONTemplate = () => {
    const sampleJSON = [
      {
        id: "nghiem-dieu",
        name: "Nghiêm Điều (Chu)",
        gender: "male",
        generation: 15,
        role: "CỤ CỐ ÔNG",
        birthYear: "1875",
        deathYear: "1945",
        isDeceased: true,
        parentId: "",
        motherId: "",
        spouseId: "cu-ba-lun",
        isMarried: true,
        branch: "Nhánh chính",
        story: "Cụ cố khởi tổ sinh cơ lập nghiệp...",
        occupation: "Nông nghiệp",
        address: "Hòa Xá, Ứng Hòa, Hà Nội",
        phone: ""
      },
      {
        id: "cu-ba-lun",
        name: "Đỗ Thị Lùn",
        gender: "female",
        generation: 15,
        role: "CỤ CỐ BÀ",
        birthYear: "1880",
        deathYear: "1952",
        isDeceased: true,
        parentId: "",
        motherId: "",
        spouseId: "nghiem-dieu",
        isMarried: true,
        branch: "Nhánh chính",
        story: "Cụ cố bà tảo tần gánh vác việc gia đình...",
        occupation: "Nội trợ",
        address: "Hòa Xá, Ứng Hòa, Hà Nội",
        phone: ""
      }
    ];

    const blob = new Blob([JSON.stringify(sampleJSON, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'bieu_mau_nhap_gia_pha.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsTemplateMenuOpen(false);
  };

  // Action: Process import locally and call backend sync
  const handleConfirmImport = async () => {
    if (!onSyncAll) {
      alert('Ứng dụng chưa được cấu hình tính năng đồng bộ máy chủ.');
      return;
    }
    setIsSyncing(true);
    try {
      let finalMembersList: FamilyMember[] = [];
      if (importType === 'replace') {
        finalMembersList = [...importedMembers];
      } else {
        // Merge: Update matching IDs, add new ones
        const existingMap = new Map(members.map(m => [m.id, m]));
        importedMembers.forEach(m => {
          existingMap.set(m.id, m);
        });
        finalMembersList = Array.from(existingMap.values());
      }

      // Execute Sync to backend Supabase database
      const result = await onSyncAll(finalMembersList);
      if (result.success) {
        setImportSuccess(`Đã đồng bộ hóa thành công ${importedMembers.length} thành viên vào cây gia phả!`);
        alert(`Đồng bộ thành công! Đã cập nhật ${importedMembers.length} thành viên vào cây gia phả trên hệ thống.`);
        setIsImportModalOpen(false);
      } else {
        throw new Error(result.error || 'Lỗi lưu thông tin đồng bộ.');
      }
    } catch (err: any) {
      setImportError(err.message || 'Đồng bộ phả hệ thất bại.');
      alert('Lỗi đồng bộ phả hệ: ' + (err.message || 'Lỗi không xác định'));
    } finally {
      setIsSyncing(false);
    }
  };

  // Action: Direct Manual Sync current UI members list to server
  const handleManualSyncAll = async () => {
    if (!currentUser) {
      if (onOpenLogin) {
        onOpenLogin();
      } else {
        alert('Vui lòng đăng nhập quyền quản trị để thực hiện đồng bộ hóa phả hệ!');
      }
      return;
    }
    if (!onSyncAll) {
      alert('Tính năng đồng bộ hóa chưa được kích hoạt.');
      return;
    }
    
    if (!window.confirm(`Bạn có chắc chắn muốn đồng bộ hóa toàn bộ danh sách hiện tại (${members.length} thành viên) lên cơ sở dữ liệu đám mây?`)) {
      return;
    }

    setIsSyncing(true);
    try {
      const result = await onSyncAll(members);
      if (result.success) {
        alert(`Đồng bộ hóa thành công toàn bộ ${members.length} thành viên lên cơ sở dữ liệu!`);
      } else {
        throw new Error(result.error || 'Lỗi đồng bộ.');
      }
    } catch (err: any) {
      alert('Đồng bộ thất bại: ' + (err.message || 'Lỗi kết nối'));
    } finally {
      setIsSyncing(false);
    }
  };
  // --------------------------------------------------

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
    const match = cleaned.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (!match) return null;
    const d = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const y = parseInt(match[3], 10);
    try {
      // @ts-ignore
      const res = getLunarDate(d, m, y);
      if (res && res.day && res.month && res.year) {
        const canChiYear = getCanChi(String(res.year));
        return `ngày ${res.day} tháng ${res.month}${res.leap ? ' (nhuận)' : ''} năm ${canChiYear}`;
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

            {/* Hidden Input for Import */}
            <input
              type="file"
              id="import-file-input"
              accept=".csv,.json,.xlsx,.xls,.docx,.pdf"
              className="hidden"
              onChange={handleFileSelect}
            />

            {/* Template Download Option Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsTemplateMenuOpen(!isTemplateMenuOpen)}
                className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold rounded-lg border border-amber-200 transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                title="Tải biểu mẫu nhập dữ liệu về máy tính (.xlsx, .docx, .pdf, .json)"
              >
                <Download className="w-3.5 h-3.5 text-amber-700" />
                <span>Tải Mẫu</span>
              </button>
              
              {isTemplateMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsTemplateMenuOpen(false)}></div>
                  <div className="absolute right-0 mt-1.5 w-60 bg-white border border-[#eadecb] rounded-lg shadow-lg z-20 py-1 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        window.location.href = '/api/templates/download?format=excel';
                        setIsTemplateMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-[#fdfbf7] flex items-center gap-3 text-gray-700 font-medium cursor-pointer border-b border-gray-50"
                      title="Tải tệp mẫu Excel (.xlsx) chuẩn hóa các trường dữ liệu phả hệ"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="block font-bold text-gray-800">Mẫu Excel (.xlsx)</span>
                        <span className="block text-[10px] text-gray-400 font-normal">Bảng biểu chuẩn hóa</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        window.location.href = '/api/templates/download?format=docx';
                        setIsTemplateMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-[#fdfbf7] flex items-center gap-3 text-gray-700 font-medium cursor-pointer border-b border-gray-50"
                      title="Tải mẫu văn bản Word (.docx) dành cho ghi ghép cốt truyện bằng AI"
                    >
                      <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                      <div>
                        <span className="block font-bold text-gray-800">Mẫu Word (.doc/.docx)</span>
                        <span className="block text-[10px] text-gray-400 font-normal">Lời mô tả lịch sử phả hệ AI</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        window.open('/api/templates/download?format=pdf', '_blank');
                        setIsTemplateMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-[#fdfbf7] flex items-center gap-3 text-gray-700 font-medium cursor-pointer border-b border-gray-50"
                      title="In hoặc tải bản mẫu PDF truyền thống để biên tập tay"
                    >
                      <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                      <div>
                        <span className="block font-bold text-gray-800">Bản mẫu PDF (In/Lưu)</span>
                        <span className="block text-[10px] text-gray-400 font-normal">Tờ khai thông tin phả hệ</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        downloadJSONTemplate();
                        setIsTemplateMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-[#fdfbf7] flex items-center gap-3 text-gray-700 font-medium cursor-pointer"
                    >
                      <FileJson className="w-4 h-4 text-purple-500 shrink-0" />
                      <div>
                        <span className="block font-bold text-gray-800">Mẫu cấu trúc JSON</span>
                        <span className="block text-[10px] text-gray-400 font-normal">Định dạng nén lập trình viên</span>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Upload Button */}
            <button
              type="button"
              onClick={triggerFileInput}
              className="px-3 py-2 bg-[#fdfbf7] hover:bg-[#f4f0e6] text-[#6b4724] text-xs font-bold rounded-lg border border-[#d6b583] transition flex items-center gap-1.5 shrink-0 cursor-pointer"
              title="Tải tệp dữ liệu phả hệ từ máy tính (.csv, .json)"
            >
              <Upload className="w-3.5 h-3.5 text-[#b8956b]" />
              <span>Up Mẫu</span>
            </button>

            {/* Manual Sync Button */}
            <button
              type="button"
              onClick={handleManualSyncAll}
              disabled={isSyncing}
              className="px-3 py-2 bg-[#5d4037] hover:bg-[#4e342e] text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
              title="Đồng bộ tất cả danh sách phả hệ hiện tại lên cơ sở dữ liệu"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Đồng Bộ Tất Cả</span>
            </button>

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
                          Còn sống
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      {(() => {
                        const bYear = parseYearStr(m.birthYear || '');
                        const dYear = m.isDeceased ? parseYearStr(m.deathYear || '') : NaN;
                        const age = m.isDeceased 
                          ? (!isNaN(bYear) && !isNaN(dYear) ? (dYear - bYear) : null)
                          : (!isNaN(bYear) ? (2026 - bYear) : null);
                        
                        let anniversary = '';
                        if (m.isDeceased && m.deathYear) {
                          const match = m.deathYear.trim().match(/^(\d{1,2}[\/\-]\d{1,2})/);
                          if (match) {
                            anniversary = match[1];
                          }
                        }

                        return (
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center gap-1">
                              <span className="text-gray-400 font-medium">Sinh:</span>
                              <span className="font-semibold text-gray-700">{m.birthYear || '—'}</span>
                            </div>
                            {m.isDeceased ? (
                              <>
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-400 font-medium">Mất:</span>
                                  <span className="font-semibold text-gray-700">{m.deathYear || '—'}</span>
                                </div>
                                <div className="text-rose-600 font-semibold text-[11px] mt-0.5">
                                  Tuổi đã mất: {age !== null ? `${age} tuổi` : 'Chưa rõ'}
                                </div>
                                {anniversary && (
                                  <div className="text-amber-800 font-bold text-[10px] bg-amber-50 border border-amber-100 rounded px-1.5 py-0.5 inline-block mt-1">
                                    Giỗ chạp: {anniversary}
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="text-emerald-600 font-semibold text-[11px] mt-0.5">
                                Tuổi đang hưởng: {age !== null ? `${age} tuổi` : 'Chưa rõ'}
                              </div>
                            )}
                          </div>
                        );
                      })()}
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
                      className="w-full p-2 border border-[#d6b583] rounded bg-[#fdfbf7] pr-20 focus:outline-none focus:ring-2 focus:ring-[#b8956b]"
                      placeholder="Ví dụ: 1949"
                    />
                    {!isDeceased && birthYear && !isNaN(parseYearStr(birthYear)) && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                        {2026 - parseYearStr(birthYear)} tuổi (2026)
                      </span>
                    )}
                  </div>
                </div>

                {/* Death Year */}
                {isDeceased && (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block font-bold text-rose-600">Năm tạ thế †:</label>
                      {deathYear && getCanChi(deathYear) && (
                        <span className="text-xs text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded font-bold">
                          Âm lịch: {getCanChi(deathYear)}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={deathYear}
                        onChange={(e) => setDeathYear(e.target.value)}
                        className="w-full p-2 border border-rose-300 rounded bg-rose-50/50 pr-24 focus:outline-none focus:ring-2 focus:ring-rose-400"
                        placeholder="Ví dụ: 2012"
                      />
                      {birthYear && deathYear && !isNaN(parseYearStr(birthYear)) && !isNaN(parseYearStr(deathYear)) && (
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                          Mất lúc: {parseYearStr(deathYear) - parseYearStr(birthYear)} tuổi
                        </span>
                      )}
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
                      className="w-full p-2 border border-rose-200 rounded bg-white focus:outline-none focus:ring-2 focus:ring-rose-300 cursor-pointer text-rose-950 font-medium"
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

      {/* IMPORT MODAL PREVIEW */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden border border-[#b8956b] shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-[#5d4037] to-[#8b7355] text-white flex justify-between items-center">
              <h3 className="text-lg font-bold font-serif uppercase tracking-wider flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                Xác nhận nhập dữ liệu từ máy tính
              </h3>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-white/80 hover:text-white text-2xl font-bold leading-none bg-white/10 hover:bg-white/20 px-2 rounded-full cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs text-gray-700">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 leading-relaxed">
                <p className="font-bold text-sm mb-1">📋 Thông tin tệp dữ liệu tải lên:</p>
                <p>Đã nhận diện và phân tích thành công <strong className="text-[#6b4724] text-sm">{importedMembers.length}</strong> thành viên gia hệ.</p>
                <p className="mt-1 text-[11px] text-amber-800">Mẹo: Hệ thống tự động phân tích và chuẩn hóa các cột tiếng Việt/tiếng Anh tương ứng từ Excel CSV hoặc JSON.</p>
              </div>

              {/* Mode Select */}
              <div className="space-y-2.5">
                <label className="block font-bold text-[#6b4724] text-xs">Phương thức đồng bộ dữ liệu:</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className={`p-3 border rounded-xl flex items-start gap-2.5 cursor-pointer transition ${
                    importType === 'merge' ? 'border-amber-600 bg-amber-50/30 font-semibold' : 'border-gray-200 hover:bg-gray-50'
                  }`}>
                    <input
                      type="radio"
                      name="importType"
                      value="merge"
                      checked={importType === 'merge'}
                      onChange={() => setImportType('merge')}
                      className="mt-0.5 accent-amber-700 cursor-pointer"
                    />
                    <div>
                      <span className="block text-[#5d4037] font-bold">Gộp phả hệ (Khuyên dùng)</span>
                      <span className="block text-[11px] text-gray-500 font-normal mt-0.5">Giữ lại danh sách hiện tại. Cập nhật các cụ/thành viên trùng mã số (ID), và thêm mới các thành viên chưa có.</span>
                    </div>
                  </label>

                  <label className={`p-3 border rounded-xl flex items-start gap-2.5 cursor-pointer transition ${
                    importType === 'replace' ? 'border-rose-600 bg-rose-50/10 font-semibold' : 'border-gray-200 hover:bg-gray-50'
                  }`}>
                    <input
                      type="radio"
                      name="importType"
                      value="replace"
                      checked={importType === 'replace'}
                      onChange={() => setImportType('replace')}
                      className="mt-0.5 accent-rose-700 cursor-pointer"
                    />
                    <div>
                      <span className="block text-rose-800 font-bold">Ghi đè toàn bộ (Xóa danh sách cũ)</span>
                      <span className="block text-[11px] text-gray-500 font-normal mt-0.5">Xóa hoàn toàn danh sách phả hệ hiện có trên cơ sở dữ liệu và thay thế 100% bằng danh sách mới trong tệp tải lên.</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Preview Table */}
              <div className="space-y-1.5">
                <label className="block font-bold text-[#6b4724] text-xs">Xem trước danh sách thành viên trong tệp ({importedMembers.length} người):</label>
                <div className="overflow-x-auto rounded-lg border border-gray-200 max-h-48 overflow-y-auto">
                  <table className="w-full border-collapse text-left text-[11px]">
                    <thead>
                      <tr className="bg-gray-50 text-gray-600 border-b border-gray-200 font-bold">
                        <th className="p-2">Mã số (ID)</th>
                        <th className="p-2">Họ & Tên</th>
                        <th className="p-2">Giới tính</th>
                        <th className="p-2">Đời thứ</th>
                        <th className="p-2">Vai trò</th>
                        <th className="p-2">Chi Nhánh</th>
                        <th className="p-2">Năm Sinh/Mất</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      {importedMembers.slice(0, 15).map((m, idx) => (
                        <tr key={m.id || idx} className="hover:bg-gray-50">
                          <td className="p-2 font-mono text-gray-400 text-[10px]">{m.id}</td>
                          <td className="p-2 font-bold text-gray-800">{m.name}</td>
                          <td className="p-2">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${m.gender === 'male' ? 'bg-blue-50 text-blue-700' : 'bg-rose-50 text-rose-700'}`}>
                              {m.gender === 'male' ? 'Nam' : 'Nữ'}
                            </span>
                          </td>
                          <td className="p-2 text-center font-bold">Đời {m.generation}</td>
                          <td className="p-2 text-gray-500">{m.role || 'Thành viên'}</td>
                          <td className="p-2 text-gray-500">{m.branch || 'Nhánh chính'}</td>
                          <td className="p-2 text-gray-400">
                            {m.birthYear || '?'}{m.isDeceased ? ` - ${m.deathYear || '?'}` : ' (Sống)'}
                          </td>
                        </tr>
                      ))}
                      {importedMembers.length > 15 && (
                        <tr>
                          <td colSpan={7} className="p-2.5 text-center text-gray-400 font-medium bg-gray-50 italic">
                            ... và {importedMembers.length - 15} thành viên khác ở phía dưới ...
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  disabled={isSyncing}
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 font-bold cursor-pointer disabled:opacity-50 text-gray-700"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  disabled={isSyncing}
                  className="px-6 py-2 bg-[#5d4037] text-white rounded-lg hover:bg-[#4e342e] shadow-md font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSyncing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang đồng bộ...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Xác Nhận Nhập & Đồng Bộ
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

