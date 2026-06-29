import React, { useState } from 'react';
import { Users, Eye, HelpCircle, User, Award, ArrowRight, Heart, RefreshCw } from 'lucide-react';
import { FamilyMember } from '../types';

interface TreeViewProps {
  members: FamilyMember[];
  onSyncAll?: (newMembers: FamilyMember[]) => Promise<{ success: boolean; count?: number; error?: string; message?: string }>;
  currentUser?: { username: string; fullName: string; role: string } | null;
  onOpenLogin?: () => void;
}

export default function TreeView({ members, onSyncAll, currentUser, onOpenLogin }: TreeViewProps) {
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [isSyncing, setIsSyncing] = useState(false);

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
        alert(result.message || `Đồng bộ hóa thành công toàn bộ ${members.length} thành viên lên cơ sở dữ liệu!`);
      } else {
        throw new Error(result.error || 'Lỗi đồng bộ.');
      }
    } catch (err: any) {
      alert('Đồng bộ thất bại: ' + (err.message || 'Lỗi kết nối'));
    } finally {
      setIsSyncing(false);
    }
  };

  const handleNodeClick = (member: FamilyMember) => {
    setSelectedMember(member);
  };

  // Safe search helper
  const findMember = (id: string) => members.find((m) => m.id === id);

  // Groups members under a father/parent ID
  const getChildren = (parentId: string) => {
    return members.filter((m) => m.parentId === parentId);
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 flex flex-col gap-6">
      <div className="bg-white rounded-xl shadow-xs border border-[#eadecb] p-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-[#eadecb] pb-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#6b4724] font-serif flex items-center gap-2">
              <Users className="w-6 h-6 text-[#b8956b]" />
              Sơ Đồ Phả Hệ Gia Đình
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Nhấp chuột vào từng thành viên để xem tiểu sử, nếp sống và thông tin liên hệ chi tiết.
            </p>
          </div>
          
          {/* Sync Button & Branch filters */}
          <div className="flex flex-wrap items-center gap-3">
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

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400 uppercase">Lọc theo Chi:</span>
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="p-2 border border-[#d6b583] rounded-lg bg-[#fdfbf7] text-sm text-[#4a3219] focus:outline-none focus:ring-2 focus:ring-[#b8956b]"
              >
                <option value="all">Toàn bộ gia quyến</option>
                <option value="Chi Cụ Bà Cả">Chi Cụ Bà Cả</option>
                <option value="Chi Cụ Bà Hai">Chi Cụ Bà Hai</option>
              </select>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 justify-center text-xs font-semibold mb-8 text-gray-600 bg-[#fdfbf7] p-3 rounded-lg border border-[#f4f0e6]">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 bg-blue-50 border border-blue-300 rounded inline-block"></span>
            <span>Thành viên Nam</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 bg-rose-50 border border-rose-300 rounded inline-block"></span>
            <span>Thành viên Nữ</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 bg-amber-50 border border-amber-300 rounded inline-block"></span>
            <span>Cụ Tổ tiên / Người sáng lập</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-red-500 font-bold">†</span>
            <span>Đã tạ thế</span>
          </div>
        </div>

        {/* Tree Container with horizontal scroll */}
        <div className="w-full overflow-x-auto pb-6">
          <div className="min-w-[1100px] flex flex-col items-center">
            
            {/* ĐỜI 15: Cụ Cố Nghiêm Điều (Chu) & Cụ Bà Lùn */}
            <div className="flex flex-col items-center mb-10">
              <span className="text-xs font-bold text-[#b8956b] uppercase tracking-wider mb-2 bg-[#f4f0e6] px-2.5 py-1 rounded-full">
                Thế hệ thứ 15
              </span>
              <div className="flex items-center gap-4 bg-[#fcf9f2] p-3 rounded-xl border-2 border-dashed border-[#d6b583] shadow-xs">
                {/* Father */}
                {(() => {
                  const m = findMember('nghiem-dieu');
                  return (
                    <button
                      onClick={() => m && handleNodeClick(m)}
                      className="px-4 py-2 bg-blue-50 hover:bg-blue-100/80 border-2 border-blue-400 rounded-lg text-left shadow-xs transition transform hover:-translate-y-0.5 group"
                    >
                      <div className="text-[10px] font-bold text-blue-800 uppercase">{m?.role || 'Cụ Cố Ông'}</div>
                      <div className="text-sm font-bold text-blue-900 flex items-center gap-1">
                        {m?.name || 'Nghiêm Điều (Chu)'} {m?.isDeceased && <span className="text-red-600 font-normal">†</span>}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        {m?.birthYear || '1875'} - {m?.deathYear || '1945'}
                      </div>
                    </button>
                  );
                })()}

                <div className="h-[2px] w-8 bg-[#8b7355] relative flex items-center justify-center">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 absolute" />
                </div>

                {/* Mother */}
                {(() => {
                  const m = findMember('cu-ba-lun');
                  return (
                    <button
                      onClick={() => m && handleNodeClick(m)}
                      className="px-4 py-2 bg-rose-50 hover:bg-rose-100/80 border-2 border-rose-400 rounded-lg text-left shadow-xs transition transform hover:-translate-y-0.5 group"
                    >
                      <div className="text-[10px] font-bold text-rose-800 uppercase">{m?.role || 'Cụ Cố Bà'}</div>
                      <div className="text-sm font-bold text-rose-900 flex items-center gap-1">
                        {m?.name || 'Cụ Bà Lùn'} {m?.isDeceased && <span className="text-red-600 font-normal">†</span>}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        {m?.birthYear || '1880'} - {m?.deathYear || '1952'}
                      </div>
                    </button>
                  );
                })()}
              </div>
            </div>

            {/* Link Line down */}
            <div className="h-8 w-0.5 bg-[#b8956b] mb-4"></div>

            {/* ĐỜI 16: Cụ Nghiêm Cung */}
            <div className="flex flex-col items-center mb-10">
              <span className="text-xs font-bold text-[#b8956b] uppercase tracking-wider mb-2 bg-[#f4f0e6] px-2.5 py-1 rounded-full">
                Thế hệ thứ 16
              </span>
              {(() => {
                const m = findMember('nghiem-cung');
                return (
                  <button
                    onClick={() => m && handleNodeClick(m)}
                    className="px-5 py-3 bg-amber-50 hover:bg-amber-100 border-2 border-amber-500 rounded-xl text-center shadow-md transition transform hover:-translate-y-0.5"
                  >
                    <div className="text-[10px] font-bold text-amber-800 uppercase tracking-widest">{m?.role || 'Cụ Ông Trụ Cột'}</div>
                    <div className="text-base font-extrabold text-amber-900 uppercase">
                      {m?.name || 'Nghiêm Cung'} {m?.isDeceased && <span className="text-red-600 font-normal">†</span>}
                    </div>
                    <div className="text-xs text-amber-700">
                      {m?.birthYear || '1902'} - {m?.deathYear || '1978'}
                    </div>
                  </button>
                );
              })()}
            </div>

            {/* Link Line down to children branches */}
            <div className="h-8 w-0.5 bg-[#b8956b]"></div>

            {/* BRANCHES SPLIT: CHI CỤ BÀ CẢ VS CHI CỤ BÀ HAI */}
            <div className="w-full border-t-2 border-[#b8956b] rounded-t-lg pt-6 flex justify-around gap-8">
              
              {/* CHI 1: CỤ BÀ CẢ */}
              {(branchFilter === 'all' || branchFilter === 'Chi Cụ Bà Cả') && (
                <div className="flex flex-col items-center w-1/3 min-w-[300px]">
                  <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-2 text-center mb-6">
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                      Chi Cụ Bà Cả (Đã Khuất)
                    </span>
                  </div>

                  <div className="flex flex-col gap-6">
                    {/* Daughter 1 */}
                    {(() => {
                      const m = findMember('con-gai-1');
                      return m ? (
                        <button
                          onClick={() => handleNodeClick(m)}
                          className="px-4 py-2 bg-rose-50 hover:bg-rose-100/80 border border-rose-300 rounded-lg text-center shadow-xs transition"
                        >
                          <div className="text-[10px] text-rose-700 font-bold">{m.role || 'Con Gái Thứ Nhất'}</div>
                          <div className="text-sm font-bold text-rose-900">
                            {m.name} {m.isDeceased && <span className="text-red-600">†</span>}
                          </div>
                        </button>
                      ) : null;
                    })()}

                    {/* Daughter 2 */}
                    {(() => {
                      const m = findMember('con-gai-2');
                      return m ? (
                        <button
                          onClick={() => handleNodeClick(m)}
                          className="px-4 py-2 bg-rose-50 hover:bg-rose-100/80 border border-rose-300 rounded-lg text-center shadow-xs transition"
                        >
                          <div className="text-[10px] text-rose-700 font-bold">{m.role || 'Con Gái Thứ Hai'}</div>
                          <div className="text-sm font-bold text-rose-900">
                            {m.name} {m.isDeceased && <span className="text-red-600">†</span>}
                          </div>
                        </button>
                      ) : null;
                    })()}
                  </div>
                </div>
              )}

              {/* CHI 2: CỤ BÀ HAI */}
              {(branchFilter === 'all' || branchFilter === 'Chi Cụ Bà Hai') && (
                <div className="flex flex-col items-center w-2/3 min-w-[700px] border-l border-dashed border-amber-200 pl-4">
                  <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-2 text-center mb-6">
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                      Chi Cụ Bà Hai
                    </span>
                  </div>

                  {/* Children of Cụ Bà Hai (Generation 17) */}
                  <div className="grid grid-cols-5 gap-4 w-full">
                    
                    {/* 1. Nghiêm Cảnh */}
                    {(() => {
                      const m = findMember('nghiem-canh');
                      return m ? (
                        <div className="flex flex-col items-center bg-[#fdfbf7] p-2 rounded-lg border border-[#f4f0e6]">
                          <button
                            onClick={() => handleNodeClick(m)}
                            className="w-full px-2 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-300 rounded-md text-center shadow-xs transition"
                          >
                            <div className="text-[9px] text-blue-700 font-bold">{m.role || 'Bác Trai Cả'}</div>
                            <div className="text-xs font-bold text-blue-900 truncate">
                              {m.name} {m.isDeceased && <span className="text-red-600">†</span>}
                            </div>
                          </button>
                          <div className="h-6 w-0.5 bg-[#b8956b] my-1"></div>
                          
                          {/* Generation 18 Children of Nghiêm Cảnh */}
                          <div className="flex flex-col gap-2 w-full mt-1">
                            {getChildren(m.id).map(child => {
                              const subChildren = getChildren(child.id);
                              if (subChildren.length > 0) {
                                return (
                                  <div key={child.id} className="flex flex-col items-center w-full p-1 bg-white rounded border border-[#eadecb]">
                                    <button
                                      onClick={() => handleNodeClick(child)}
                                      className={`w-full px-1 py-1 rounded text-center text-[10px] font-bold truncate transition ${
                                        child.gender === 'male'
                                          ? 'bg-blue-50 hover:bg-blue-100 text-blue-900'
                                          : 'bg-rose-50 hover:bg-rose-100 text-rose-900'
                                      }`}
                                    >
                                      {child.name} {child.isDeceased && <span className="text-red-600">†</span>}
                                    </button>
                                    <div className="h-3 w-0.5 bg-[#b8956b] my-0.5"></div>
                                    {/* Generation 19 Children */}
                                    <div className="flex flex-col gap-1 w-full">
                                      {subChildren.map(subChild => (
                                        <button
                                          key={subChild.id}
                                          onClick={() => handleNodeClick(subChild)}
                                          className={`w-full px-1 py-1 border rounded text-center text-[9px] font-medium truncate transition ${
                                            subChild.gender === 'male'
                                              ? 'bg-blue-50 hover:bg-blue-100 border-blue-300 text-blue-800'
                                              : 'bg-rose-50 hover:bg-rose-100 border-rose-300 text-rose-800'
                                          }`}
                                        >
                                          {subChild.name} {subChild.isDeceased && <span className="text-red-600">†</span>}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                );
                              } else {
                                return (
                                  <button
                                    key={child.id}
                                    onClick={() => handleNodeClick(child)}
                                    className={`w-full px-2 py-1.5 border rounded-md text-center text-[11px] font-medium transition truncate ${
                                      child.gender === 'male'
                                        ? 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-900'
                                        : 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-900'
                                    }`}
                                  >
                                    {child.name} {child.isDeceased && <span className="text-red-600">†</span>}
                                  </button>
                                );
                              }
                            })}
                          </div>
                        </div>
                      ) : null;
                    })()}

                    {/* 2. Nghiêm Thị Toàn */}
                    {(() => {
                      const m = findMember('nghiem-toan');
                      return m ? (
                        <div className="flex flex-col items-center bg-[#fdfbf7] p-2 rounded-lg border border-[#f4f0e6] justify-start">
                          <button
                            onClick={() => handleNodeClick(m)}
                            className="w-full px-2 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-md text-center shadow-xs transition"
                          >
                            <div className="text-[9px] text-rose-700 font-bold">{m.role || 'Bác Gái'}</div>
                            <div className="text-xs font-bold text-rose-900 truncate">
                              {m.name} {m.isDeceased && <span className="text-red-600">†</span>}
                            </div>
                          </button>
                          <div className="text-[9px] text-gray-400 mt-2 italic text-center">Ngoại tộc</div>
                        </div>
                      ) : null;
                    })()}

                    {/* 3. Nghiêm Phác */}
                    {(() => {
                      const m = findMember('nghiem-phac');
                      return m ? (
                        <div className="flex flex-col items-center bg-[#fdfbf7] p-2 rounded-lg border border-[#f4f0e6]">
                          <button
                            onClick={() => handleNodeClick(m)}
                            className="w-full px-2 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-300 rounded-md text-center shadow-xs transition"
                          >
                            <div className="text-[9px] text-blue-700 font-bold">{m.role || 'Bác Trai Hai'}</div>
                            <div className="text-xs font-bold text-blue-900 truncate">
                              {m.name} {m.isDeceased && <span className="text-red-600">†</span>}
                            </div>
                          </button>
                          <div className="h-6 w-0.5 bg-[#b8956b] my-1"></div>
                          
                          {/* Generation 18 Children of Nghiêm Phác */}
                          <div className="flex flex-col gap-2 w-full mt-1">
                            {getChildren(m.id).map(child => {
                              const subChildren = getChildren(child.id);
                              if (subChildren.length > 0) {
                                return (
                                  <div key={child.id} className="flex flex-col items-center w-full p-1 bg-white rounded border border-[#eadecb]">
                                    <button
                                      onClick={() => handleNodeClick(child)}
                                      className={`w-full px-1 py-1 rounded text-center text-[10px] font-bold truncate transition ${
                                        child.gender === 'male'
                                          ? 'bg-blue-50 hover:bg-blue-100 text-blue-900'
                                          : 'bg-rose-50 hover:bg-rose-100 text-rose-900'
                                      }`}
                                    >
                                      {child.name} {child.isDeceased && <span className="text-red-600">†</span>}
                                    </button>
                                    <div className="h-3 w-0.5 bg-[#b8956b] my-0.5"></div>
                                    {/* Generation 19 Children */}
                                    <div className="flex flex-col gap-1 w-full">
                                      {subChildren.map(subChild => (
                                        <button
                                          key={subChild.id}
                                          onClick={() => handleNodeClick(subChild)}
                                          className={`w-full px-1 py-1 border rounded text-center text-[9px] font-medium truncate transition ${
                                            subChild.gender === 'male'
                                              ? 'bg-blue-50 hover:bg-blue-100 border-blue-300 text-blue-800'
                                              : 'bg-rose-50 hover:bg-rose-100 border-rose-300 text-rose-800'
                                          }`}
                                        >
                                          {subChild.name} {subChild.isDeceased && <span className="text-red-600">†</span>}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                );
                              } else {
                                return (
                                  <button
                                    key={child.id}
                                    onClick={() => handleNodeClick(child)}
                                    className={`w-full px-2 py-1.5 border rounded-md text-center text-[11px] font-medium transition truncate ${
                                      child.gender === 'male'
                                        ? 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-900'
                                        : 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-900'
                                    }`}
                                  >
                                    {child.name} {child.isDeceased && <span className="text-red-600">†</span>}
                                  </button>
                                );
                              }
                            })}
                          </div>
                        </div>
                      ) : null;
                    })()}

                    {/* 4. Nghiêm Xuân Mã (Bố) */}
                    {(() => {
                      const m = findMember('nghiem-ma');
                      return m ? (
                        <div className="flex flex-col items-center bg-[#fcf8ef] p-3 rounded-lg border-2 border-[#d6b583]">
                          <button
                            onClick={() => handleNodeClick(m)}
                            className="w-full px-2 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-md text-center shadow-xs transition font-bold"
                          >
                            <div className="text-[9px] text-amber-800 font-extrabold uppercase">{m.role || 'Bố'}</div>
                            <div className="text-xs font-bold text-amber-950 truncate">
                              {m.name} {m.isDeceased && <span className="text-red-600">†</span>}
                            </div>
                          </button>
                          <div className="h-6 w-0.5 bg-[#b8956b] my-1"></div>
                          
                          {/* Generation 18 Children of Nghiêm Xuân Mã */}
                          <div className="flex flex-col gap-2 w-full mt-1">
                            {getChildren(m.id).map(child => {
                              const subChildren = getChildren(child.id);
                              if (subChildren.length > 0) {
                                return (
                                  <div key={child.id} className="flex flex-col items-center w-full p-1 bg-white rounded border border-[#eadecb]">
                                    <button
                                      onClick={() => handleNodeClick(child)}
                                      className={`w-full px-1 py-1 rounded text-center text-[10px] font-bold truncate transition ${
                                        child.gender === 'male'
                                          ? 'bg-blue-50 hover:bg-blue-100 text-blue-900'
                                          : 'bg-rose-50 hover:bg-rose-100 text-rose-900'
                                      }`}
                                    >
                                      {child.name} {child.isDeceased && <span className="text-red-600">†</span>}
                                    </button>
                                    <div className="h-3 w-0.5 bg-[#b8956b] my-0.5"></div>
                                    {/* Generation 19 Children */}
                                    <div className="flex flex-col gap-1 w-full">
                                      {subChildren.map(subChild => (
                                        <button
                                          key={subChild.id}
                                          onClick={() => handleNodeClick(subChild)}
                                          className={`w-full px-1 py-1 border rounded text-center text-[9px] font-medium truncate transition ${
                                            subChild.gender === 'male'
                                              ? 'bg-blue-50 hover:bg-blue-100 border-blue-300 text-blue-800'
                                              : 'bg-rose-50 hover:bg-rose-100 border-rose-300 text-rose-800'
                                          }`}
                                        >
                                          {subChild.name} {subChild.isDeceased && <span className="text-red-600">†</span>}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                );
                              } else {
                                return (
                                  <button
                                    key={child.id}
                                    onClick={() => handleNodeClick(child)}
                                    className={`w-full px-2 py-1 border rounded text-center text-[10px] font-medium transition truncate ${
                                      child.gender === 'male'
                                        ? 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-900'
                                        : 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-900'
                                    }`}
                                  >
                                    {child.name} {child.isDeceased && <span className="text-red-600">†</span>}
                                  </button>
                                );
                              }
                            })}
                          </div>
                        </div>
                      ) : null;
                    })()}

                    {/* 5. Nghiêm Thị Hoàn */}
                    {(() => {
                      const m = findMember('nghiem-hoan');
                      return m ? (
                        <div className="flex flex-col items-center bg-[#fdfbf7] p-2 rounded-lg border border-[#f4f0e6] justify-start">
                          <button
                            onClick={() => handleNodeClick(m)}
                            className="w-full px-2 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-md text-center shadow-xs transition"
                          >
                            <div className="text-[9px] text-rose-700 font-bold">{m.role || 'Cô'}</div>
                            <div className="text-xs font-bold text-rose-900 truncate">
                              {m.name} {m.isDeceased && <span className="text-red-600">†</span>}
                            </div>
                          </button>
                          <div className="text-[9px] text-gray-400 mt-2 italic text-center">Ngoại tộc</div>
                        </div>
                      ) : null;
                    })()}

                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      </div>

      {/* BIOGRAPHY MODAL SLIDEOUT */}
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
              <div className="flex items-center gap-4">
                {selectedMember.avatar && (
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/80 bg-white/10 shrink-0 shadow-md">
                    <img 
                      src={selectedMember.avatar} 
                      alt={selectedMember.name} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = selectedMember.gender === 'male' 
                          ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' 
                          : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150';
                      }}
                    />
                  </div>
                )}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full inline-block mb-1">
                    Đời thứ {selectedMember.generation} • {selectedMember.branch}
                  </span>
                  <h3 className="text-2xl font-bold font-serif flex items-center gap-2">
                    {selectedMember.name}
                    {selectedMember.isDeceased && <span className="text-sm font-normal text-amber-200 font-sans italic">(Khuất bóng †)</span>}
                  </h3>
                </div>
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
                    Năm {selectedMember.birthYear || '---'} {selectedMember.isDeceased ? ` - Năm ${selectedMember.deathYear || 'Khuất'}` : ' (Còn sống)'}
                  </span>
                </div>
                {(() => {
                  const parseYearStr = (str: string): number => {
                    if (!str) return NaN;
                    const cleaned = str.trim();
                    const match = cleaned.match(/\b\d{4}\b/);
                    if (match) return parseInt(match[0], 10);
                    return parseInt(cleaned, 10);
                  };
                  const bYear = parseYearStr(selectedMember.birthYear || '');
                  const currentYear = 2026;
                  
                  if (selectedMember.isDeceased) {
                    const dYear = parseYearStr(selectedMember.deathYear || '');
                    const age = (!isNaN(bYear) && !isNaN(dYear)) ? (dYear - bYear) : null;
                    let anniversary = '';
                    if (selectedMember.deathYear) {
                      const match = selectedMember.deathYear.trim().match(/^(\d{1,2}[\/\-]\d{1,2})/);
                      if (match) anniversary = match[1];
                    }
                    return (
                      <>
                        <div>
                          <span className="text-xs text-gray-400 font-bold block uppercase">Tuổi đã mất:</span>
                          <span className="font-bold text-rose-600">{age !== null ? `${age} tuổi` : 'Chưa rõ'}</span>
                        </div>
                        {anniversary && (
                          <div>
                            <span className="text-xs text-gray-400 font-bold block uppercase">Ngày giỗ chạp:</span>
                            <span className="font-bold text-amber-700">Ngày {anniversary}</span>
                          </div>
                        )}
                      </>
                    );
                  } else {
                    const age = !isNaN(bYear) ? (currentYear - bYear) : null;
                    return (
                      <div>
                        <span className="text-xs text-gray-400 font-bold block uppercase">Tuổi đang hưởng:</span>
                        <span className="font-bold text-emerald-600">{age !== null ? `${age} tuổi` : 'Chưa rõ'}</span>
                      </div>
                    );
                  }
                })()}
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

              {/* Relationships */}
              <div className="pt-2">
                <h4 className="text-sm font-bold text-[#6b4724] uppercase tracking-wider mb-2 border-b border-[#f4f0e6] pb-1">
                  Quan hệ trực hệ
                </h4>
                <div className="space-y-1.5 text-xs">
                  {selectedMember.parentId && findMember(selectedMember.parentId) && (
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400">Thân phụ:</span>
                      <button 
                        onClick={() => setSelectedMember(findMember(selectedMember.parentId!) || null)}
                        className="font-bold text-[#b8956b] hover:underline"
                      >
                        {findMember(selectedMember.parentId)!.name} (Đời {findMember(selectedMember.parentId)!.generation})
                      </button>
                    </div>
                  )}

                  {selectedMember.spouseId && findMember(selectedMember.spouseId) && (
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400">Hôn phối:</span>
                      <button 
                        onClick={() => setSelectedMember(findMember(selectedMember.spouseId!) || null)}
                        className="font-bold text-rose-600 hover:underline"
                      >
                        {findMember(selectedMember.spouseId)!.name}
                      </button>
                    </div>
                  )}

                  {selectedMember.spouseIds && selectedMember.spouseIds.length > 0 && (
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-400">Hôn phối (Nhiều vợ):</span>
                      <div className="flex gap-2">
                        {selectedMember.spouseIds.map(sid => findMember(sid) && (
                          <button 
                            key={sid}
                            onClick={() => setSelectedMember(findMember(sid) || null)}
                            className="font-bold text-rose-600 hover:underline bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100"
                          >
                            {findMember(sid)!.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Children List */}
                  {getChildren(selectedMember.id).length > 0 && (
                    <div className="flex flex-wrap gap-1 items-center">
                      <span className="text-gray-400">Hậu duệ (Con cái):</span>
                      {getChildren(selectedMember.id).map((child) => (
                        <button
                          key={child.id}
                          onClick={() => setSelectedMember(child)}
                          className="font-bold text-blue-600 hover:underline bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 m-0.5"
                        >
                          {child.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
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
