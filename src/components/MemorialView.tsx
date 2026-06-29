import React, { useState } from 'react';
import { Flame, Sparkles, BookOpen, Heart, User, Clipboard, Check, Send, AlertCircle } from 'lucide-react';
import { FamilyMember, AltarPrayer } from '../types';

interface MemorialViewProps {
  members: FamilyMember[];
  prayers: AltarPrayer[];
  onAddPrayer: (sender: string, message: string, offeringType: 'incense' | 'candle' | 'flower' | 'none') => void;
}

export default function MemorialView({ members, prayers, onAddPrayer }: MemorialViewProps) {
  const [senderName, setSenderName] = useState('');
  const [selectedAncestor, setSelectedAncestor] = useState('');
  const [customWish, setCustomWish] = useState('');
  const [offeringType, setOfferingType] = useState<'incense' | 'candle' | 'flower' | 'none'>('incense');
  const [isCopied, setIsCopied] = useState(false);

  // AI Generator States
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrayerText, setAiPrayerText] = useState('');
  const [errorText, setErrorText] = useState('');

  // Get deceased ancestors for drop down
  const deceasedAncestors = members.filter((m) => m.isDeceased);

  // Handle standard virtual offering
  const handlePostOffering = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim()) {
      alert('Vui lòng điền họ tên con cháu dâng lễ.');
      return;
    }

    const targetAncestor = selectedAncestor ? `kính dâng hương hồn ${selectedAncestor}` : 'kính dâng hương hồn tổ tiên';
    const offeringLabel = 
      offeringType === 'incense' 
        ? 'đã thắp nén tâm hương trầm thành kính' 
        : offeringType === 'candle' 
        ? 'đã thành tâm thắp ngọn đăng rực rỡ' 
        : offeringType === 'flower' 
        ? 'đã dâng đĩa hoa tươi thanh khiết' 
        : 'thành tâm đảnh lễ';

    const completeMessage = `${offeringLabel} ${targetAncestor}.${customWish ? ` Lời khấn nguyện: "${customWish}"` : ''}`;
    
    onAddPrayer(senderName, completeMessage, offeringType);
    
    // Clear inputs
    setCustomWish('');
    alert('Thắp hương dâng lễ thành công! Tấm lòng của quý vị đã được ghi nhận lên Bảng Vàng Tưởng Nhớ.');
  };

  // Trigger Gemini API to write custom Vietnamese prayer text (Văn khấn cổ truyền)
  const handleAIPrayer = async () => {
    if (!senderName.trim()) {
      alert('Vui lòng điền họ tên con cháu dâng hương khấn nguyện để AI lập sớ.');
      return;
    }
    if (!selectedAncestor) {
      alert('Vui lòng chọn cụ gia tiên linh thiêng để kính khấn lập sớ.');
      return;
    }

    setIsGenerating(true);
    setAiPrayerText('');
    setErrorText('');

    try {
      const response = await fetch('/api/gemini/pray', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ancestors: [selectedAncestor],
          senderName: senderName,
          offering: offeringType,
          customWish: customWish
        })
      });

      if (!response.ok) {
        throw new Error('Không thể kết nối đến hệ thống AI Soạn Sớ.');
      }

      const data = await response.json();
      setAiPrayerText(data.text);
    } catch (err: any) {
      console.error(err);
      setErrorText('Đang ngắt quãng kết nối AI. Sử dụng mẫu sớ dâng hương truyền thống dự phòng dưới đây.');
      
      // Fallback local prayer generator
      const fallbackText = `Nam mô A Di Đà Phật!\nNam mô A Di Đà Phật!\nNam mô A Di Đà Phật!\n\nCon lạy chín phương Trời, mười phương Chư Phật, Chư Phật mười phương.\nCon kính lạy Cao Tằng Tổ Khảo, Cao Tằng Tổ Tỷ, bá thúc đệ huynh, cô di tỷ muội họ Nghiêm.\nCon kính lạy tiên linh cụ cố: ${selectedAncestor}.\n\nHôm nay tín chủ con là hậu duệ: ${senderName}.\nNgụ tại địa chỉ gia môn họ Nghiêm lập tế dâng hương.\n\nNhân ngày lành thanh khiết, tín chủ thành kính dâng lên ${offeringType === 'incense' ? 'nén tâm hương trầm ngào ngạt' : offeringType === 'candle' ? 'ngọn đăng rạng ngời' : offeringType === 'flower' ? 'đĩa hoa thơm trái ngọt' : 'lễ mọn lòng thành'}.\n\nCúi xin tiên linh chứng giám lòng thành, giáng lâm thụ nhận lễ vật, phù trì bảo bọc cho toàn gia quyến họ Nghiêm được vạn sự bình an, tai qua nạn khỏi, trí tuệ sáng tỏ, học hành hanh thông, công thành danh toại, dòng tộc đời đời hưng vinh.\n\nLời khấn nguyện riêng: ${customWish || 'Cầu mong dòng tộc hòa hợp, thịnh vượng cát tường.'}\n\nTín chủ con thành tâm kính dâng!\nCẩn cáo!`;
      setAiPrayerText(fallbackText);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!aiPrayerText) return;
    navigator.clipboard.writeText(aiPrayerText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4 flex flex-col gap-8">
      {/* 1. ALTAR PRESENTATION CONTAINER */}
      <div className="bg-[#0f0f12] text-[#eadecb] rounded-2xl shadow-2xl border border-[#2d2114] p-6 md:p-10 relative overflow-hidden flex flex-col items-center">
        
        {/* Golden border patterns */}
        <div className="absolute inset-0 border-4 border-double border-[#b8956b]/20 rounded-2xl pointer-events-none m-2"></div>
        
        {/* Header decoration */}
        <span className="text-amber-500 text-xs font-bold tracking-[0.25em] uppercase mb-2">Bàn Thờ Tổ Tiên • Cội Nguồn Thiêng Liêng</span>
        <h2 className="text-3xl md:text-5xl font-bold text-[#fcf9f2] font-serif uppercase tracking-widest text-center mb-4 text-shadow-lg">
          Không Gian Tưởng Niệm & Tri Ân
        </h2>
        <p className="text-gray-400 max-w-2xl text-center text-sm leading-relaxed mb-8">
          Nơi con cháu xa gần dâng lễ, kính cáo hương linh tiên tổ dòng họ Nghiêm, bày tỏ đạo lý "Uống nước nhớ nguồn" truyền thống của dân tộc Việt Nam.
        </p>

        {/* ALTAR INTERACTIVE GRAPHIC */}
        <div className="relative w-full max-w-lg bg-[#18130e] border border-[#b8956b]/30 rounded-2xl py-8 px-6 flex flex-col items-center shadow-inner mb-8">
          
          {/* Incense Sticks and Smoke Visual */}
          <div className="flex flex-col items-center mb-10 relative">
            <div className="flex justify-center gap-4 mb-[-8px] z-0">
              {/* Incense 1 */}
              <div className="w-1.5 h-20 bg-gradient-to-t from-[#8b5a2b] to-[#d6a56b] rounded-t-full relative">
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#ff5e00] rounded-full shadow-[0_0_8px_#ff5e00] animate-ping opacity-60"></div>
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#ff8800] rounded-full shadow-[0_0_5px_#ff8800]"></div>
              </div>
              {/* Incense 2 (center, taller) */}
              <div className="w-1.5 h-24 bg-gradient-to-t from-[#8b5a2b] to-[#d6a56b] rounded-t-full relative">
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#ff5e00] rounded-full shadow-[0_0_10px_#ff5e00] animate-pulse"></div>
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#ffa200] rounded-full shadow-[0_0_6px_#ffa200]"></div>
              </div>
              {/* Incense 3 */}
              <div className="w-1.5 h-20 bg-gradient-to-t from-[#8b5a2b] to-[#d6a56b] rounded-t-full relative">
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#ff5e00] rounded-full shadow-[0_0_8px_#ff5e00] animate-ping opacity-60"></div>
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#ff8800] rounded-full shadow-[0_0_5px_#ff8800]"></div>
              </div>
            </div>

            {/* Incoronated incense burner pot */}
            <div className="w-24 h-20 bg-gradient-to-b from-[#a65d1d] to-[#4e2704] rounded-b-[40px] border-t-4 border-[#d69e2e] flex flex-col items-center justify-center shadow-[0_10px_20px_rgba(0,0,0,0.8)] z-10">
              <span className="text-[#fdfbf7] text-[10px] font-extrabold uppercase tracking-widest leading-none text-center">Nghiêm<br />Gia</span>
            </div>
          </div>

          {/* Altar Offerings Row */}
          <div className="flex justify-around w-full gap-4 mt-2">
            {/* Left Candle */}
            <div className="flex flex-col items-center">
              <div className="w-3 h-14 bg-red-600 rounded-t relative flex justify-center">
                <div className="absolute -top-3 w-2 h-3.5 bg-amber-400 rounded-full animate-pulse shadow-[0_0_10px_#e5a93c]"></div>
              </div>
              <span className="text-[10px] text-gray-500 font-bold mt-1.5">Ngọn đăng tả</span>
            </div>

            {/* Offerings Platter */}
            <div className="bg-[#281a0e] border border-[#b8956b]/40 rounded-full px-5 py-2 flex items-center gap-2 shadow-inner">
              <span className="text-[10px] uppercase font-bold text-amber-500">Mâm Ngũ Quả dâng tế</span>
            </div>

            {/* Right Candle */}
            <div className="flex flex-col items-center">
              <div className="w-3 h-14 bg-red-600 rounded-t relative flex justify-center">
                <div className="absolute -top-3 w-2 h-3.5 bg-amber-400 rounded-full animate-pulse shadow-[0_0_10px_#e5a93c]"></div>
              </div>
              <span className="text-[10px] text-gray-500 font-bold mt-1.5">Ngọn đăng hữu</span>
            </div>
          </div>
        </div>

        {/* 2. CORE ACTION: VIRTUAL OFFERING FORM & AI SOẠN SỚ */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4 z-10">
          
          {/* LEFT PANELS: FORM TO OFFER */}
          <div className="bg-[#18130e]/80 border border-[#b8956b]/30 rounded-xl p-6 flex flex-col gap-4">
            <h3 className="text-lg font-bold text-amber-400 font-serif uppercase tracking-wider border-b border-[#2d2114] pb-2 flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500 animate-pulse" />
              Dâng Hương Khấn Nguyện
            </h3>

            <form onSubmit={handlePostOffering} className="space-y-4 text-sm text-[#eadecb]">
              {/* Sender Name */}
              <div>
                <label className="block text-xs font-bold text-[#b8956b] uppercase tracking-wider mb-1">
                  Họ tên con cháu dâng hương:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Hậu duệ Nghiêm Xuân Tuấn"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full p-2.5 bg-[#251b11] border border-[#b8956b]/40 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#b8956b]"
                />
              </div>

              {/* Ancestor Dedication Selection */}
              <div>
                <label className="block text-xs font-bold text-[#b8956b] uppercase tracking-wider mb-1">
                  Kính khấn hương linh cụ nào:
                </label>
                <select
                  value={selectedAncestor}
                  onChange={(e) => setSelectedAncestor(e.target.value)}
                  className="w-full p-2.5 bg-[#251b11] border border-[#b8956b]/40 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#b8956b]"
                >
                  <option value="">-- Tiên tổ gia môn chung --</option>
                  {deceasedAncestors.map((anc) => (
                    <option key={anc.id} value={`${anc.name} (Đời ${anc.generation})`}>
                      {anc.name} - {anc.role} (Đời {anc.generation})
                    </option>
                  ))}
                </select>
              </div>

              {/* Offering Type Selection */}
              <div>
                <label className="block text-xs font-bold text-[#b8956b] uppercase tracking-wider mb-1.5">
                  Chọn lễ dâng kính:
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setOfferingType('incense')}
                    className={`p-2 rounded-lg border flex flex-col items-center gap-1 font-semibold transition ${
                      offeringType === 'incense'
                        ? 'bg-[#b8956b] text-[#18130e] border-[#b8956b]'
                        : 'bg-[#251b11] text-[#eadecb] border-[#b8956b]/20 hover:border-[#b8956b]/50'
                    }`}
                  >
                    <span>香 Thắp Nhang</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOfferingType('candle')}
                    className={`p-2 rounded-lg border flex flex-col items-center gap-1 font-semibold transition ${
                      offeringType === 'candle'
                        ? 'bg-[#b8956b] text-[#18130e] border-[#b8956b]'
                        : 'bg-[#251b11] text-[#eadecb] border-[#b8956b]/20 hover:border-[#b8956b]/50'
                    }`}
                  >
                    <span>燈 Thắp Nến</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOfferingType('flower')}
                    className={`p-2 rounded-lg border flex flex-col items-center gap-1 font-semibold transition ${
                      offeringType === 'flower'
                        ? 'bg-[#b8956b] text-[#18130e] border-[#b8956b]'
                        : 'bg-[#251b11] text-[#eadecb] border-[#b8956b]/20 hover:border-[#b8956b]/50'
                    }`}
                  >
                    <span>花 Dâng Hoa Quả</span>
                  </button>
                </div>
              </div>

              {/* Wishes message */}
              <div>
                <label className="block text-xs font-bold text-[#b8956b] uppercase tracking-wider mb-1">
                  Lời tâm nguyện khấn cầu (nếu có):
                </label>
                <textarea
                  rows={3}
                  placeholder="Cầu mong gia đình khỏe mạnh, con cháu thi cử đỗ đạt, công việc thuận lợi hưng thịnh..."
                  value={customWish}
                  onChange={(e) => setCustomWish(e.target.value)}
                  className="w-full p-2.5 bg-[#251b11] border border-[#b8956b]/40 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#b8956b] text-xs resize-none"
                />
              </div>

              {/* Submit offerings */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#b8956b] hover:bg-[#8b7355] text-[#18130e] font-bold py-2.5 rounded-lg transition text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  Dâng hương lễ Phật
                </button>
                <button
                  type="button"
                  onClick={handleAIPrayer}
                  disabled={isGenerating}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-lg transition text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {isGenerating ? 'Đang soạn sớ...' : 'Trợ lý AI Soạn sớ'}
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT PANELS: AI TEXT DISPLAY SCROLL */}
          <div className="bg-[#18130e]/80 border border-[#b8956b]/30 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-amber-400 font-serif uppercase tracking-wider border-b border-[#2d2114] pb-2 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-500" />
                Sớ / Văn Khấn Cổ Truyền
              </h3>

              {aiPrayerText ? (
                <div className="bg-[#241a10] border border-[#b8956b]/20 p-5 rounded-lg text-amber-100 font-serif text-sm leading-relaxed max-h-[300px] overflow-y-auto whitespace-pre-line text-justify shadow-inner">
                  {aiPrayerText}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[250px] text-center p-4">
                  <Sparkles className="w-10 h-10 text-amber-500/40 mb-3 animate-pulse" />
                  <p className="text-xs text-gray-500 italic max-w-xs leading-relaxed">
                    Điền đầy đủ thông tin con cháu và chọn tiên tổ giỗ tạ ở bảng trái, sau đó nhấn nút "Trợ lý AI Soạn sớ" để nhận bài văn khấn gia tổ truyền thống Việt Nam đầy ý nghĩa.
                  </p>
                </div>
              )}

              {errorText && (
                <div className="mt-2 text-xs text-amber-600 flex items-center gap-1.5 bg-[#251111] p-2 rounded border border-red-900/30">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorText}</span>
                </div>
              )}
            </div>

            {aiPrayerText && (
              <div className="mt-4 pt-3 border-t border-[#2d2114] flex justify-end">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1 px-4 py-2 bg-[#b8956b]/20 hover:bg-[#b8956b]/40 text-amber-300 rounded-lg text-xs font-bold transition border border-[#b8956b]/30"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      Đã sao chép!
                    </>
                  ) : (
                    <>
                      <Clipboard className="w-3.5 h-3.5" />
                      Sao chép bài sớ
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 3. PRAYER LOGS WALL */}
      <div className="bg-white rounded-xl shadow-xs border border-[#eadecb] p-6">
        <h3 className="text-xl font-bold text-[#6b4724] font-serif uppercase tracking-wider border-b border-[#eadecb] pb-3 mb-6 flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500 fill-red-500 animate-pulse" />
          Bảng Vàng Ghi Công Tưởng Niệm (Prayer Wall)
        </h3>

        {prayers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prayers.map((pr) => (
              <div
                key={pr.id}
                className="bg-[#fdfbf7] border border-[#eadecb] p-5 rounded-xl shadow-xs flex flex-col justify-between relative overflow-hidden group"
              >
                {/* Visual candle/incense corner glow */}
                <div className={`absolute top-0 right-0 w-8 h-8 rounded-bl-full ${
                  pr.offeringType === 'incense'
                    ? 'bg-amber-100/70 border-l border-b border-amber-200'
                    : pr.offeringType === 'candle'
                    ? 'bg-red-50/70 border-l border-b border-red-100'
                    : 'bg-emerald-50/70 border-l border-b border-emerald-100'
                } flex items-center justify-center`}>
                  {pr.offeringType === 'incense' && <span className="text-xs">香</span>}
                  {pr.offeringType === 'candle' && <span className="text-xs text-red-500">🕯️</span>}
                  {pr.offeringType === 'flower' && <span className="text-xs">🌸</span>}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-[#b8956b]" />
                    <span className="font-extrabold text-sm text-[#6b4724]">
                      {pr.sender}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 italic leading-relaxed text-justify">
                    {pr.message}
                  </p>
                </div>

                <div className="mt-4 pt-2 border-t border-dashed border-[#eadecb] text-[10px] text-gray-400 font-medium text-right">
                  Vừa dâng lễ lúc: {pr.timestamp}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#fdfbf7] rounded-xl p-10 text-center border border-dashed border-[#eadecb]">
            <p className="text-gray-400 italic">Hiện tại chưa có gia đình nào đăng ký dâng hương cầu nguyện hôm nay. Kính mong là người đầu tiên dâng lễ kính dâng bái tổ dòng họ.</p>
          </div>
        )}
      </div>
    </div>
  );
}
