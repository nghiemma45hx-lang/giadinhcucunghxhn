import { FamilyMember, Announcement } from '../types';

export const initialMembers: FamilyMember[] = [
  // ĐỜI 15
  {
    id: 'nghiem-dieu',
    name: 'Nghiêm Điều (Chu)',
    gender: 'male',
    generation: 15,
    role: 'Cụ Cố Ông',
    birthYear: '1875',
    deathYear: '1945',
    isDeceased: true,
    spouseId: 'cu-ba-lun',
    branch: 'Nhánh chính',
    story: 'Cụ tổ khởi lập gia phong nghiêm túc, là người chính trực, thương dân, chăm lo dạy dỗ con cháu học hành, giữ gìn nền nếp.',
    address: 'Hòa Xá, Ứng Hòa, Hà Nội'
  },
  {
    id: 'cu-ba-lun',
    name: 'Cụ Bà Lùn',
    gender: 'female',
    generation: 15,
    role: 'Cụ Cố Bà',
    birthYear: '1880',
    deathYear: '1952',
    isDeceased: true,
    spouseId: 'nghiem-dieu',
    branch: 'Nhánh chính',
    story: 'Cụ bà hiền hậu, chịu thương chịu khó, vun vén gia đình mẫu mực trong thời kỳ khó khăn.',
    address: 'Hòa Xá, Ứng Hòa, Hà Nội'
  },

  // ĐỜI 16
  {
    id: 'nghiem-cung',
    name: 'Nghiêm Cung',
    gender: 'male',
    generation: 16,
    role: 'Cụ Ông',
    birthYear: '1902',
    deathYear: '1978',
    isDeceased: true,
    parentId: 'nghiem-dieu',
    spouseIds: ['cu-ba-ca', 'cu-ba-hai'],
    branch: 'Nhánh chính',
    story: 'Người kế thừa xuất sắc truyền thống hiếu học của gia đình, chăm lo kinh doanh và nuôi dạy các con thành tài.',
    address: 'Hòa Xá, Ứng Hòa, Hà Nội'
  },
  {
    id: 'cu-ba-ca',
    name: 'Cụ Bà Cả',
    gender: 'female',
    generation: 16,
    role: 'Cụ Bà Cả',
    birthYear: '1905',
    deathYear: '1940',
    isDeceased: true,
    spouseId: 'nghiem-cung',
    branch: 'Chi Cụ Bà Cả',
    story: 'Người vợ hiền hiếu đức, hết lòng vì gia quyến, hạ sinh hai con gái trước khi qua đời sớm.'
  },
  {
    id: 'cu-ba-hai',
    name: 'Cụ Bà Hai',
    gender: 'female',
    generation: 16,
    role: 'Cụ Bà Hai',
    birthYear: '1915',
    deathYear: '1995',
    isDeceased: true,
    spouseId: 'nghiem-cung',
    branch: 'Chi Cụ Bà Hai',
    story: 'Kế thất mẫu mực, nuôi dạy cả con chung con riêng thương yêu đùm bọc lẫn nhau.'
  },

  // ĐỜI 17 - CHI CỤ BÀ CẢ
  {
    id: 'con-gai-1',
    name: 'Nghiêm Thị Thứ Nhất',
    gender: 'female',
    generation: 17,
    role: 'Con Gái Thứ Nhất',
    birthYear: '1928',
    isDeceased: true,
    parentId: 'nghiem-cung',
    branch: 'Chi Cụ Bà Cả',
    story: 'Con gái cả chăm ngoan hiền dịu, đã đi lấy chồng lập nghiệp phương xa.'
  },
  {
    id: 'con-gai-2',
    name: 'Nghiêm Thị Thứ Hai',
    gender: 'female',
    generation: 17,
    role: 'Con Gái Thứ Hai',
    birthYear: '1931',
    isDeceased: true,
    parentId: 'nghiem-cung',
    branch: 'Chi Cụ Bà Cả',
    story: 'Con gái thứ hai, tính tình chu đáo khéo léo, chăm lo gìn giữ mối liên hệ dòng tộc.'
  },

  // ĐỜI 17 - CHI CỤ BÀ HAI
  {
    id: 'nghiem-canh',
    name: 'Nghiêm Cảnh',
    gender: 'male',
    generation: 17,
    role: 'Bác Trai Cả',
    birthYear: '1938',
    deathYear: '2012',
    isDeceased: true,
    parentId: 'nghiem-cung',
    spouseId: 'vo-nghiem-canh',
    branch: 'Chi Cụ Bà Hai',
    story: 'Con trai trưởng nhánh thứ hai, cống hiến trọn đời cho quê hương, làm gương cho thế hệ sau.',
    occupation: 'Nhà giáo',
    address: 'Hà Nội'
  },
  {
    id: 'vo-nghiem-canh',
    name: 'Bác Gái Cả',
    gender: 'female',
    generation: 17,
    role: 'Bác Gái Cả',
    birthYear: '1942',
    isDeceased: false,
    spouseId: 'nghiem-canh',
    branch: 'Chi Cụ Bà Hai',
    story: 'Hiền hậu chu đáo, hiện đang an hưởng tuổi già bên con cháu tại Hà Nội.'
  },
  {
    id: 'nghiem-toan',
    name: 'Nghiêm Thị Toàn',
    gender: 'female',
    generation: 17,
    role: 'Bác Gái',
    birthYear: '1941',
    isDeceased: false,
    parentId: 'nghiem-cung',
    branch: 'Chi Cụ Bà Hai',
    story: 'Con gái cả nhánh thứ hai, luôn tích cực trong công tác gắn kết gia tộc dẫu sống xa xứ.',
    address: 'Hải Phòng'
  },
  {
    id: 'nghiem-phac',
    name: 'Nghiêm Phác',
    gender: 'male',
    generation: 17,
    role: 'Bác Trai Hai',
    birthYear: '1944',
    isDeceased: false,
    parentId: 'nghiem-cung',
    spouseId: 'vo-nghiem-phac',
    branch: 'Chi Cụ Bà Hai',
    story: 'Lương y đức độ, luôn chăm sóc sức khỏe cho mọi người và nhiệt tình đóng góp việc họ.',
    occupation: 'Bác sĩ',
    address: 'Quảng Ninh'
  },
  {
    id: 'vo-nghiem-phac',
    name: 'Bác Gái Hai',
    gender: 'female',
    generation: 17,
    role: 'Bác Gái Hai',
    birthYear: '1947',
    isDeceased: false,
    spouseId: 'nghiem-phac',
    branch: 'Chi Cụ Bà Hai'
  },
  {
    id: 'nghiem-ma',
    name: 'Nghiêm Xuân Mã',
    gender: 'male',
    generation: 17,
    role: 'Bố',
    birthYear: '1949',
    isDeceased: false,
    parentId: 'nghiem-cung',
    spouseId: 'vo-nghiem-ma',
    branch: 'Chi Cụ Bà Hai',
    story: 'Kỹ sư cầu đường mẫu mực, là trụ cột gia đình đầm ấm, rất tâm huyết trong việc ghi chép bảo tồn gia phả dòng tộc.',
    occupation: 'Kỹ sư',
    address: 'Hà Nội',
    phone: '0912345678'
  },
  {
    id: 'vo-nghiem-ma',
    name: 'Mẹ (Vợ Bố)',
    gender: 'female',
    generation: 17,
    role: 'Mẹ',
    birthYear: '1952',
    isDeceased: false,
    spouseId: 'nghiem-ma',
    branch: 'Chi Cụ Bà Hai',
    occupation: 'Nhà báo'
  },
  {
    id: 'nghiem-hoan',
    name: 'Nghiêm Thị Hoàn',
    gender: 'female',
    generation: 17,
    role: 'Cô',
    birthYear: '1953',
    isDeceased: false,
    parentId: 'nghiem-cung',
    branch: 'Chi Cụ Bà Hai',
    story: 'Cô út luôn yêu quý con cháu, giữ nếp sống đôn hậu đảm đang.',
    address: 'Hà Nội'
  },

  // ĐỜI 18 (Con cháu)
  {
    id: 'nghiem-tuan',
    name: 'Nghiêm Xuân Tuấn',
    gender: 'male',
    generation: 18,
    role: 'Con Trai Trưởng',
    birthYear: '1978',
    isDeceased: false,
    parentId: 'nghiem-ma',
    spouseId: 'vo-nghiem-tuan',
    branch: 'Chi Cụ Bà Hai',
    story: 'Doanh nhân trẻ năng động, luôn ủng hộ tài chính cho các hoạt động tu tạo nhà thờ tổ.',
    occupation: 'Kinh doanh',
    address: 'Hà Nội',
    phone: '0987654321'
  },
  {
    id: 'vo-nghiem-tuan',
    name: 'Vợ Xuân Tuấn',
    gender: 'female',
    generation: 18,
    role: 'Con Dâu Trưởng',
    birthYear: '1982',
    isDeceased: false,
    spouseId: 'nghiem-tuan',
    branch: 'Chi Cụ Bà Hai'
  },
  {
    id: 'nghiem-thanh',
    name: 'Nghiêm Thị Thanh',
    gender: 'female',
    generation: 18,
    role: 'Con Gái',
    birthYear: '1983',
    isDeceased: false,
    parentId: 'nghiem-ma',
    branch: 'Chi Cụ Bà Hai',
    occupation: 'Giảng viên',
    address: 'Đà Nẵng'
  },
  {
    id: 'nghiem-hai',
    name: 'Nghiêm Xuân Hải',
    gender: 'male',
    generation: 18,
    role: 'Con Trai',
    birthYear: '1975',
    isDeceased: false,
    parentId: 'nghiem-phac',
    branch: 'Chi Cụ Bà Hai',
    occupation: 'Kinh doanh',
    address: 'Hà Nội'
  },
  {
    id: 'nghiem-nam',
    name: 'Nghiêm Xuân Nam',
    gender: 'male',
    generation: 18,
    role: 'Con Trai',
    birthYear: '1970',
    isDeceased: false,
    parentId: 'nghiem-canh',
    branch: 'Chi Cụ Bà Hai',
    occupation: 'Công nhân viên',
    address: 'Hà Nội'
  },

  // ĐỜI 19 (Cháu cố)
  {
    id: 'nghiem-huy',
    name: 'Nghiêm Xuân Huy',
    gender: 'male',
    generation: 19,
    role: 'Cháu Đích Tôn',
    birthYear: '2008',
    isDeceased: false,
    parentId: 'nghiem-tuan',
    branch: 'Chi Cụ Bà Hai',
    story: 'Học sinh giỏi cấp thành phố, chăm ngoan hiếu thảo, là niềm hy vọng mới của dòng tộc.',
    occupation: 'Học sinh',
    address: 'Hà Nội'
  }
];

export const initialAnnouncements: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Đóng góp quỹ trùng tu lăng mộ Cụ Cố',
    content: 'Ban quản trị gia tộc kêu gọi con cháu chung tay đóng góp tịnh tài trùng tu phần lăng mộ đá của Cụ Cố Nghiêm Điều tại nghĩa trang quê nhà Hòa Xá. Kế hoạch thi công dự kiến khởi công vào tháng 8 âm lịch năm nay. Mọi đóng góp xin gửi về Trưởng ban tài chính Nghiêm Xuân Mã.',
    type: 'urgent',
    date: '2026-06-25'
  },
  {
    id: 'ann-2',
    title: 'Cập nhật bổ sung thông tin gia phả đời thứ 18, 19',
    content: 'Nhằm hoàn thiện dữ liệu gia tộc, kính mong các gia đình cung cấp thêm thông tin ngày sinh, ngày mất (nếu có), nghề nghiệp, nơi ở hiện tại của con cháu thuộc thế hệ thứ 18 và 19 cho chú Nghiêm Xuân Mã để tổng hợp.',
    type: 'update',
    date: '2026-06-28'
  },
  {
    id: 'ann-3',
    title: 'Lễ giỗ Cụ Nghiêm Cung vào ngày 12 tháng 7 âm lịch',
    content: 'Kính mời toàn thể con cháu sắp xếp công việc về dự lễ giỗ Tổ Cụ Nghiêm Cung tại Từ đường chi trưởng vào lúc 9h00 ngày 12 tháng 7 Âm lịch. Sự hiện diện đông đủ của con cháu là niềm tôn kính thiêng liêng dâng lên hương hồn Cụ.',
    type: 'event',
    date: '2026-06-20'
  }
];
