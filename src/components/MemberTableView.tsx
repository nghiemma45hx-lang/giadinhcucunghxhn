import React, { useState, useMemo } from 'react';
import { Table, Calendar, MapPin, Phone, User, Award, Search, ArrowUpDown, Shield } from 'lucide-react';
import { FamilyMember } from '../types';

interface MemberTableViewProps {
  members: FamilyMember[];
}

export default function MemberTableView({ members }: MemberTableViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [generationFilter, setGenerationFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof FamilyMember>('generation');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

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

          <div className="flex flex-wrap gap-2 w-full md:w-auto">
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-400 font-medium">
                    Không tìm thấy thành viên nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
