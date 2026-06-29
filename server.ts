import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import { initialMembers, initialAnnouncements } from "./src/data/familyData";
import * as XLSX from "xlsx";
import mammoth from "mammoth";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Helper to clean environment variables from quotes or placeholders
const cleanEnvVar = (val: string | undefined): string | undefined => {
  if (!val) return undefined;
  let s = val.trim();
  if (s.startsWith('"') && s.endsWith('"')) {
    s = s.slice(1, -1).trim();
  }
  if (s.startsWith("'") && s.endsWith("'")) {
    s = s.slice(1, -1).trim();
  }
  return s;
};

// Log environment variables on server load to diagnose key issues
(() => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anon = process.env.SUPABASE_ANON_KEY;
  const logContent = [
    "=== SUPABASE ENVIRONMENT DIAGNOSTICS ===",
    `SUPABASE_URL: ${url}`,
    `SUPABASE_SERVICE_ROLE_KEY: ${key}`,
    `SUPABASE_ANON_KEY: ${anon}`,
    `Cleaned URL: ${cleanEnvVar(url)}`,
    `Cleaned KEY: ${cleanEnvVar(key)}`,
    "=== END DIAGNOSTICS ==="
  ].join("\n");
  fs.writeFileSync(path.join(process.cwd(), "debug.log"), logContent);
  console.log(logContent);
})();

// Initialize Supabase Client with environment variable checks & fallback safety
const getSupabaseClient = () => {
  let url = cleanEnvVar(process.env.SUPABASE_URL);
  let key = cleanEnvVar(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const anon = cleanEnvVar(process.env.SUPABASE_ANON_KEY);

  const fallbackUrl = "https://domczpyfjiqttwdcrdsj.supabase.co";
  const fallbackKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvbWN6cHlmamlxdHR3ZGNyZHNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjcwMTM5NCwiZXhwIjoyMDk4Mjc3Mzk0fQ.-2ksd7TQPy6hDPwE2S2OWUzWC0ws04FjecgL2lhRWf0";

  const isCustomProject = url && url !== "MY_SUPABASE_URL" && url.startsWith("http") && !url.includes("domczpyfjiqttwdcrdsj.supabase.co");

  if (isCustomProject) {
    const hasValidKey = key && key !== "MY_SUPABASE_SERVICE_ROLE_KEY" && key !== "SUPABASE_SERVICE_ROLE_KEY" && key.startsWith("eyJ");
    const hasValidAnon = anon && anon !== "MY_SUPABASE_ANON_KEY" && anon !== "SUPABASE_ANON_KEY" && anon.startsWith("eyJ");
    
    if (hasValidKey) {
      // Keep using their service role key
    } else if (hasValidAnon) {
      key = anon; // Fallback to their anon key if service role is missing
    } else {
      url = fallbackUrl;
      key = fallbackKey;
    }
  } else {
    url = fallbackUrl;
    key = fallbackKey;
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
    }
  });
};

// Local JSON Fallback Storage Helpers for system_users and system_settings
const USERS_FILE = path.join(process.cwd(), "local_users.json");
const SETTINGS_FILE = path.join(process.cwd(), "local_settings.json");

const getLocalUsers = (): any[] => {
  try {
    if (fs.existsSync(USERS_FILE)) {
      return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
    }
  } catch (e) {
    console.error("Failed to read local users:", e);
  }
  return [];
};

const saveLocalUsers = (users: any[]) => {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to write local users:", e);
  }
};

const getLocalSettings = (): any[] => {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      return JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf-8"));
    }
  } catch (e) {
    console.error("Failed to read local settings:", e);
  }
  return [];
};

const saveLocalSettings = (settings: any[]) => {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to write local settings:", e);
  }
};

// Helper to check if a Supabase error is a relation/table-not-found error
function isTableMissingError(error: any): boolean {
  if (!error) return false;
  const message = (error.message || "").toLowerCase();
  return (
    error.code === "PGRST116" ||
    error.code === "42P01" ||
    message.includes("relation") ||
    message.includes("does not exist") ||
    message.includes("not found")
  );
}

// --- TEMPLATES & DOCUMENT PARSER ENDPOINTS ---
// Endpoint to download properly formatted templates (Excel, Word, PDF)
app.get("/api/templates/download", (req, res) => {
  const format = req.query.format;

  if (format === "excel") {
    try {
      const headers = [
        "Mã số (id)", "Họ và tên (name)", "Giới tính (gender: male/female)", 
        "Đời thứ (generation)", "Vai trò (role)", "Năm sinh (birthYear)", 
        "Năm mất (deathYear)", "Đã mất (isDeceased: true/false)", 
        "Mã cha (parentId)", "Mã mẹ (motherId)", "Mã vợ/chồng (spouseId)", 
        "Đã kết hôn (isMarried: true/false)", "Chi nhánh (branch)", 
        "Tiểu sử (story)", "Nghề nghiệp (occupation)", "Địa chỉ (address)", "Số điện thoại (phone)"
      ];

      const rows = [
        [
          "nghiem-dieu", "Nghiêm Điều (Chu)", "male", 15, "CỤ CỐ ÔNG", 
          "1875", "1945", true, "", "", "cu-ba-lun", true, "Nhánh chính", 
          "Cụ cố khởi tổ sinh cơ lập nghiệp tại Hòa Xá...", "Nông nghiệp", "Hòa Xá, Ứng Hòa, Hà Nội", ""
        ],
        [
          "cu-ba-lun", "Đỗ Thị Lùn", "female", 15, "CỤ CỐ BÀ", 
          "1880", "1952", true, "", "", "nghiem-dieu", true, "Nhánh chính", 
          "Cụ cố bà hiền từ đảm đang gánh vác việc gia đình...", "Nội trợ", "Hòa Xá, Ứng Hòa, Hà Nội", ""
        ],
        [
          "nghiem-cung", "Nghiêm Cung", "male", 16, "CỤ ÔNG TRỤ CỘT", 
          "1902", "1978", true, "nghiem-dieu", "cu-ba-lun", "", false, "Nhánh chính", 
          "Y sĩ đông y nổi tiếng trong vùng Hòa Xá, bốc thuốc cứu người...", "Đông y", "Hòa Xá, Ứng Hòa, Hà Nội", "0901234567"
        ]
      ];

      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

      // Set nice column widths for Excel
      const wscols = [
        { wch: 15 }, // id
        { wch: 25 }, // name
        { wch: 12 }, // gender
        { wch: 10 }, // generation
        { wch: 15 }, // role
        { wch: 12 }, // birthYear
        { wch: 12 }, // deathYear
        { wch: 10 }, // isDeceased
        { wch: 15 }, // parentId
        { wch: 15 }, // motherId
        { wch: 15 }, // spouseId
        { wch: 12 }, // isMarried
        { wch: 15 }, // branch
        { wch: 40 }, // story
        { wch: 15 }, // occupation
        { wch: 30 }, // address
        { wch: 15 }  // phone
      ];
      ws["!cols"] = wscols;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "GiaPhaTemplate");

      const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

      res.setHeader("Content-Disposition", "attachment; filename=bieu_mau_nhap_gia_pha_excel.xlsx");
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      return res.send(buf);
    } catch (error: any) {
      console.error("Excel template generation error:", error);
      return res.status(500).json({ error: "Không thể tạo biểu mẫu Excel: " + error.message });
    }
  }

  if (format === "docx") {
    try {
      const htmlDoc = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Times New Roman', Times, serif; line-height: 1.6; margin: 1in; color: #333333; }
            h1 { text-align: center; color: #5d4037; font-size: 20pt; margin-bottom: 5pt; font-weight: bold; }
            .subtitle { text-align: center; font-style: italic; color: #555555; font-size: 11pt; margin-bottom: 25pt; }
            h2 { color: #8b7355; font-size: 14pt; border-bottom: 2px solid #b8956b; padding-bottom: 3px; margin-top: 25pt; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-top: 10pt; margin-bottom: 15pt; }
            th, td { border: 1px solid #d6b583; padding: 10px; text-align: left; font-size: 10pt; }
            th { background-color: #fdfbf7; font-weight: bold; color: #5d4037; }
            .note-box { background-color: #fffde7; border-left: 4px solid #fbc02d; padding: 10px; margin: 15pt 0; font-size: 9.5pt; color: #5d4037; }
            .sample-narrative { background-color: #fafafa; border: 1px dashed #cccccc; padding: 12px; font-size: 10pt; line-height: 1.5; color: #444444; }
          </style>
        </head>
        <body>
          <h1>MẪU SOẠN THẢO GIA PHẢ - GIA TỘC NGHIÊM CUNG</h1>
          <div class="subtitle">Dành cho việc số hóa sơ đồ phả hệ tự động bằng Trí tuệ Nhân tạo (AI)</div>
          
          <div class="note-box">
            <strong>⚠️ HƯỚNG DẪN QUAN TRỌNG:</strong><br/>
            Hệ thống AI thông minh của chúng tôi có khả năng đọc hiểu trực tiếp tệp Word văn bản này. Quý ban biên soạn dòng họ có thể chọn một trong hai cách soạn thảo bên dưới:
            <br/>- <strong>Cách 1:</strong> Điền thông tin thành viên chi tiết vào Bảng cấu trúc mục II.
            <br/>- <strong>Cách 2:</strong> Viết lời kể chuyện, mô tả chi tiết các cụ và mối quan hệ gia tộc ở mục III. AI sẽ tự đọc hiểu và liên kết thành sơ đồ phả hệ!
          </div>

          <h2>I. THÔNG TIN CHUNG</h2>
          <p><strong>Dòng họ:</strong> Nghiêm Cung (Hòa Xá, Ứng Hòa, Hà Nội)</p>
          <p><strong>Người đóng góp/Biên soạn:</strong> ............................................................</p>
          <p><strong>Ngày lập bản mẫu:</strong> Ngày ...... tháng ...... năm 2026</p>

          <h2>II. BẢNG THÔNG TIN THÀNH VIÊN GIA TỘC (MẪU CẤU TRÚC)</h2>
          <table>
            <thead>
              <tr>
                <th>Mã số (ID)*</th>
                <th>Họ và tên*</th>
                <th>Giới tính (Nam/Nữ)*</th>
                <th>Đời thứ*</th>
                <th>Vai trò/Danh xưng</th>
                <th>Năm sinh</th>
                <th>Năm mất</th>
                <th>Mã cha (hoặc mẹ)</th>
                <th>Quê quán/Địa chỉ</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>nghiem-dieu</td>
                <td>Nghiêm Điều (Chu)</td>
                <td>Nam</td>
                <td>15</td>
                <td>CỤ CỐ ÔNG</td>
                <td>1875</td>
                <td>1945</td>
                <td>(Khởi tổ)</td>
                <td>Hòa Xá, Ứng Hòa, Hà Nội</td>
              </tr>
              <tr>
                <td>cu-ba-lun</td>
                <td>Đỗ Thị Lùn</td>
                <td>Nữ</td>
                <td>15</td>
                <td>CỤ CỐ BÀ</td>
                <td>1880</td>
                <td>1952</td>
                <td></td>
                <td>Hòa Xá, Ứng Hòa, Hà Nội</td>
              </tr>
              <tr>
                <td>nghiem-cung</td>
                <td>Nghiêm Cung</td>
                <td>Nam</td>
                <td>16</td>
                <td>CỤ ÔNG TRỤ CỘT</td>
                <td>1902</td>
                <td>1978</td>
                <td>nghiem-dieu</td>
                <td>Hòa Xá, Ứng Hòa, Hà Nội</td>
              </tr>
              <tr>
                <td>[Điền mã tiếp theo]</td>
                <td>[Họ tên thành viên]</td>
                <td>[Nam/Nữ]</td>
                <td>[Đời thứ]</td>
                <td>[Danh xưng dòng họ]</td>
                <td>[Năm sinh]</td>
                <td>[Năm mất]</td>
                <td>[Mã người cha]</td>
                <td>[Quê quán]</td>
              </tr>
            </tbody>
          </table>
          <p style="font-size: 9pt; color: #777777;">* Ghi chú: Mã số (ID) viết liền không dấu, ví dụ: 'nghiem-cung-con-ca', 'nghiem-ha', dùng để liên kết các cụ với nhau thông qua trường Mã cha.</p>

          <h2>III. TIỂU SỬ CHI TIẾT / LỜI KỂ PHẢ HỆ DẠNG VĂN BẢN (MẪU)</h2>
          <div class="sample-narrative">
            Cụ ông Nghiêm Điều (Chu) kết hôn với cụ bà Đỗ Thị Lùn. Hai cụ sinh cơ lập nghiệp tại vùng quê Hòa Xá, nổi tiếng nhân đức đảm đang.
            Cụ ông sinh năm 1875, qua đời năm 1945. Cụ bà sinh năm 1880, qua đời năm 1952. 
            Hai cụ hạ sinh được cụ Nghiêm Cung (sinh năm 1902, mất năm 1978), tức cụ ông đời thứ 16 kế nghiệp gia phong dòng họ Nghiêm...
            [Quý vị vui lòng viết tiếp lịch sử gia đình, lời giới thiệu dòng họ ở đây để AI trích xuất]
          </div>
        </body>
        </html>
      `;

      res.setHeader("Content-Disposition", "attachment; filename=bieu_mau_nhap_gia_pha_word.doc");
      res.setHeader("Content-Type", "application/msword");
      return res.send(htmlDoc);
    } catch (error: any) {
      console.error("Docx template generation error:", error);
      return res.status(500).json({ error: "Không thể tạo biểu mẫu Word: " + error.message });
    }
  }

  if (format === "pdf") {
    try {
      const pdfHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Biểu Mẫu Soạn Thảo Gia Phả Họ Nghiêm</title>
          <style>
            @media print {
              body { margin: 0; padding: 0; background: white; font-size: 11pt; }
              .no-print { display: none; }
              .page-break { page-break-before: always; }
            }
            body {
              font-family: 'Times New Roman', Times, serif;
              line-height: 1.6;
              color: #2b1b0c;
              background-color: #faf7f2;
              margin: 0;
              padding: 40px;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              padding: 50px 60px;
              border: 1px solid #e2d3be;
              box-shadow: 0 4px 15px rgba(0,0,0,0.05);
              position: relative;
            }
            .container::before {
              content: "";
              position: absolute;
              top: 15px; left: 15px; right: 15px; bottom: 15px;
              border: 1px solid #b8956b;
              pointer-events: none;
              opacity: 0.5;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px double #b8956b;
              padding-bottom: 20px;
            }
            .header h1 {
              font-size: 22pt;
              margin: 0 0 10px 0;
              color: #5d4037;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .header p {
              margin: 5px 0;
              font-style: italic;
              color: #6d4c41;
              font-size: 11pt;
            }
            h2 {
              color: #5d4037;
              font-size: 14pt;
              border-bottom: 1px solid #d6b583;
              padding-bottom: 5px;
              margin-top: 25px;
              text-transform: uppercase;
              font-weight: bold;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
            }
            th, td {
              border: 1px solid #d6b583;
              padding: 8px 10px;
              text-align: left;
              font-size: 10pt;
            }
            th {
              background-color: #fbf8f3;
              color: #5d4037;
              font-weight: bold;
            }
            .guidelines {
              background-color: #fffde7;
              border-left: 4px solid #fbc02d;
              padding: 12px 15px;
              margin: 20px 0;
              font-size: 10pt;
              border-radius: 4px;
            }
            .footer {
              margin-top: 50px;
              text-align: center;
              font-size: 9.5pt;
              color: #777777;
              border-top: 1px dashed #d6b583;
              padding-top: 15px;
            }
            .no-print-bar {
              max-width: 800px;
              margin: 0 auto 20px auto;
              background: #5d4037;
              color: white;
              padding: 12px 20px;
              border-radius: 8px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-family: system-ui, sans-serif;
              font-size: 13px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            }
            .print-btn {
              background: #b8956b;
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 4px;
              font-weight: bold;
              cursor: pointer;
              transition: background 0.2s;
            }
            .print-btn:hover {
              background: #a37f55;
            }
          </style>
        </head>
        <body onload="window.print()">
          <div class="no-print-bar no-print">
            <span><strong>🖨️ TRÌNH IN BIỂU MẪU PDF GIA PHẢ:</strong> Bản mẫu hiển thị chuẩn kích thước vector để in hoặc xuất PDF.</span>
            <button class="print-btn" onclick="window.print()">In / Xuất PDF</button>
          </div>

          <div class="container">
            <div class="header">
              <h1>BIỂU MẪU BIÊN SOẠN GIA PHẢ</h1>
              <p>Hội Đồng Gia Tộc Nghiêm Cung — Hòa Xá, Ứng Hòa, Hà Nội</p>
              <p>Mẫu chuẩn số hóa sơ đồ cây phả hệ trực tuyến</p>
            </div>

            <div class="guidelines">
              <strong>📖 HƯỚNG DẪN BIÊN CHÉP GIA PHẢ:</strong><br/>
              Kính gửi các bậc cao niên và ban khánh tiết dòng họ, để việc dựng cây phả hệ số hóa được chính xác 100%, xin vui lòng điền các cụ tiền nhân vào Bảng Danh sách dưới đây hoặc cung cấp bản viết tay, tư liệu bằng văn bản lịch sử.
              Hệ thống AI sẽ tự động đọc hiểu các mối liên kết (Cha - Con, Vợ - Chồng) từ tài liệu này!
            </div>

            <h2>I. THÔNG TIN NGƯỜI ĐÓNG GÓP TƯ LIỆU</h2>
            <p>Họ tên: ........................................................................ Điện thoại: .............................................</p>
            <p>Thuộc chi ngành: ........................................................... Địa chỉ hiện tại: .......................................</p>

            <h2>II. SƠ ĐỒ ĐẠI DIỆN BA ĐỜI KHỞI TỔ (MẪU THAM KHẢO)</h2>
            <table>
              <thead>
                <tr>
                  <th style="width: 15%">Mã số (ID)</th>
                  <th style="width: 25%">Họ và Tên các cụ</th>
                  <th style="width: 10%">Đời thứ</th>
                  <th style="width: 15%">Danh xưng</th>
                  <th style="width: 20%">Mối quan hệ</th>
                  <th style="width: 15%">Năm sinh/mất</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>nghiem-dieu</strong></td>
                  <td>Nghiêm Điều (Chu)</td>
                  <td>Đời 15</td>
                  <td>CỤ CỐ ÔNG</td>
                  <td>Khởi tổ dòng họ</td>
                  <td>1875 - 1945</td>
                </tr>
                <tr>
                  <td><strong>cu-ba-lun</strong></td>
                  <td>Đỗ Thị Lùn</td>
                  <td>Đời 15</td>
                  <td>CỤ CỐ BÀ</td>
                  <td>Vợ cụ Nghiêm Điều</td>
                  <td>1880 - 1952</td>
                </tr>
                <tr>
                  <td><strong>nghiem-cung</strong></td>
                  <td>Nghiêm Cung</td>
                  <td>Đời 16</td>
                  <td>CỤ ÔNG TRỤ CỘT</td>
                  <td>Con cụ Nghiêm Điều</td>
                  <td>1902 - 1978</td>
                </tr>
              </tbody>
            </table>

            <h2>III. DANH SÁCH THÀNH VIÊN CẦN THÊM MỚI</h2>
            <table>
              <thead>
                <tr>
                  <th style="height: 25px;">Họ và Tên</th>
                  <th>Giới tính</th>
                  <th>Đời</th>
                  <th>Tên Cha / Mẹ</th>
                  <th>Tên Vợ / Chồng</th>
                  <th>Năm sinh/mất</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style="height: 30px;"></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td style="height: 30px;"></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td style="height: 30px;"></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td style="height: 30px;"></td><td></td><td></td><td></td><td></td><td></td></tr>
                <tr><td style="height: 30px;"></td><td></td><td></td><td></td><td></td><td></td></tr>
              </tbody>
            </table>

            <h2>IV. LỊCH SỬ DÒNG HỌ / TIỂU SỬ CHI TIẾT (VIẾT TAY)</h2>
            <p style="border-bottom: 1px dotted #ccc; height: 35px;"></p>
            <p style="border-bottom: 1px dotted #ccc; height: 35px;"></p>
            <p style="border-bottom: 1px dotted #ccc; height: 35px;"></p>
            <p style="border-bottom: 1px dotted #ccc; height: 35px;"></p>

            <div class="footer">
              <p>Mẫu hồ sơ phả hệ Nghiêm Cung Gia Tộc — Uống nước nhớ nguồn, ngàn năm thịnh hưng</p>
            </div>
          </div>
        </body>
        </html>
      `;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.send(pdfHtml);
    } catch (error: any) {
      console.error("PDF template generation error:", error);
      return res.status(500).json({ error: "Không thể tạo biểu mẫu PDF: " + error.message });
    }
  }

  return res.status(400).json({ error: "Định dạng không hợp lệ. Chỉ hỗ trợ excel, docx, pdf" });
});

// Endpoint to parse uploaded files (.xlsx, .xls, .csv, .docx, .pdf) using Mammoth & Gemini
app.post("/api/members/parse-document", async (req, res) => {
  try {
    const { base64, fileName, mimeType } = req.body;

    if (!base64) {
      return res.status(400).json({ error: "Thiếu dữ liệu tệp tải lên (Base64)" });
    }

    const buffer = Buffer.from(base64, "base64");
    const nameLower = (fileName || "").toLowerCase();

    // 1. Process Excel / CSV directly using xlsx package
    if (nameLower.endsWith(".xlsx") || nameLower.endsWith(".xls") || nameLower.endsWith(".csv")) {
      try {
        const workbook = XLSX.read(buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet) as any[];

        if (rows.length === 0) {
          return res.status(400).json({ error: "Tệp Excel trống hoặc không đúng cấu trúc dòng cột." });
        }

        // Helper: Find value from multiple possible header keys
        const findVal = (row: any, keys: string[]): string => {
          for (const k of keys) {
            const rowKeys = Object.keys(row);
            const foundKey = rowKeys.find(rk => 
              rk.toLowerCase().trim() === k.toLowerCase() || 
              rk.toLowerCase().includes(k.toLowerCase())
            );
            if (foundKey) return String(row[foundKey] || "").trim();
          }
          return "";
        };

        const parsedMembers = rows.map((r, idx) => {
          const id = findVal(r, ["id", "mã số", "ma so", "mã"]);
          const name = findVal(r, ["name", "họ và tên", "ho va ten", "họ & tên", "ho & ten", "tên"]);
          const genderStr = findVal(r, ["gender", "giới tính", "gioi tinh"]).toLowerCase();
          const gender = genderStr.includes("nữ") || genderStr.includes("female") ? "female" : "male";
          
          const genStr = findVal(r, ["generation", "đời thứ", "doi thu", "đời", "doi"]);
          const generation = parseInt(genStr) || 18;
          
          const role = findVal(r, ["role", "vai trò", "vai tro", "danh xưng"]);
          const birthYear = findVal(r, ["birthyear", "năm sinh", "nam sinh", "sinh"]);
          const deathYear = findVal(r, ["deathyear", "năm mất", "nam mat", "mất", "mat"]);
          const deceasedStr = findVal(r, ["isdeceased", "đã mất", "da mat", "deceased"]).toLowerCase();
          const isDeceased = deceasedStr.includes("true") || deceasedStr.includes("có") || deceasedStr.includes("đã mất") || deathYear !== "";
          
          const parentId = findVal(r, ["parentid", "mã cha", "ma cha", "cha"]);
          const motherId = findVal(r, ["motherid", "mã mẹ", "ma me", "mẹ"]);
          const spouseId = findVal(r, ["spouseid", "mã vợ/chồng", "vợ", "chồng", "ma vo", "ma chong"]);
          const marriedStr = findVal(r, ["ismarried", "đã kết hôn", "da ket hon", "kết hôn", "ket hon"]).toLowerCase();
          const isMarried = marriedStr.includes("true") || marriedStr.includes("có") || spouseId !== "";
          
          const branch = findVal(r, ["branch", "chi nhánh", "chi nhanh", "phân chi"]) || "Nhánh chính";
          const story = findVal(r, ["story", "tiểu sử", "tieu su", "ghi chú"]);
          const occupation = findVal(r, ["occupation", "nghề nghiệp", "nghe nghiep"]);
          const address = findVal(r, ["address", "địa chỉ", "dia chi", "quê quán"]);
          const phone = findVal(r, ["phone", "điện thoại", "dien thoai", "sđt", "sdt"]);

          return {
            id: id || `m-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
            name: name || "Thành viên gia phả",
            gender,
            generation,
            role: role || "Thành viên",
            birthYear: birthYear || undefined,
            deathYear: isDeceased ? (deathYear || undefined) : undefined,
            isDeceased,
            parentId: parentId || undefined,
            motherId: motherId || undefined,
            spouseId: spouseId || undefined,
            isMarried: isMarried || undefined,
            branch: branch || "Nhánh chính",
            story: story || undefined,
            occupation: occupation || undefined,
            address: address || undefined,
            phone: phone || undefined
          };
        });

        return res.json({ success: true, count: parsedMembers.length, data: parsedMembers });
      } catch (err: any) {
        console.error("Excel server parsing error:", err);
        return res.status(500).json({ error: "Lỗi phân tích tệp Excel: " + err.message });
      }
    }

    // 2. Process Word and PDF using Gemini API
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      return res.status(400).json({ 
        error: "Để phân tích tài liệu Word (.docx) hoặc PDF tự động bằng Trí tuệ Nhân tạo (AI), quý quản trị viên vui lòng truy cập Settings và cấu hình khóa GEMINI_API_KEY. Hệ thống vẫn cho phép tải/nhập tệp Excel (.xlsx, .csv) bình thường không cần API Key." 
      });
    }

    let extractedText = "";

    if (nameLower.endsWith(".docx")) {
      try {
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value;
        if (!extractedText.trim()) {
          return res.status(400).json({ error: "Tài liệu Word rỗng hoặc không trích xuất được văn bản thô." });
        }
      } catch (err: any) {
        console.error("Mammoth docx extraction error:", err);
        return res.status(500).json({ error: "Lỗi trích xuất văn bản từ tệp Word: " + err.message });
      }
    }

    // Setup prompt for AI
    const systemPrompt = "Bạn là trợ lý ảo chuyên nghiệp số hóa gia phả, tư liệu dòng họ Nghiêm. Nhiệm vụ của bạn là trích xuất chính xác danh sách các thành viên gia tộc từ tài liệu lịch sử gia phả thành mảng JSON đúng chuẩn.";
    
    const userPrompt = `Hãy đọc tài liệu lịch sử dòng họ đính kèm và trích xuất danh sách tất cả các thành viên gia tộc được nhắc tới.
Mỗi thành viên được trích xuất bắt buộc phải có cấu trúc khớp hoàn toàn với kiểu dữ liệu FamilyMember sau đây:
{
  "id": "chuỗi định danh duy nhất viết liền không dấu gạch ngang hoặc gạch dưới nối chữ, ví dụ: 'nghiem-cung', tự sinh thông minh từ tên nếu không có sẵn",
  "name": "Họ và tên cụ thể của thành viên",
  "gender": "male" hoặc "female",
  "generation": số đời thứ mấy trong phả hệ (ví dụ: 15, 16, 17, 18, nếu không rõ hãy tính toán ước lượng từ mối quan hệ thế hệ trước/sau hoặc điền số hợp lý)",
  "role": "danh xưng tôn kính dòng họ, ví dụ: CỤ CỐ ÔNG, CỤ CỐ BÀ, CỤ ÔNG, CỤ BÀ, Trưởng họ, Thành viên",
  "birthYear": "năm sinh dạng chuỗi, ví dụ: '1902' hoặc để trống nếu chưa rõ",
  "deathYear": "năm mất dạng chuỗi, ví dụ: '1978' hoặc để trống nếu còn sống hoặc chưa rõ",
  "isDeceased": true hoặc false (nếu có năm mất hoặc được ghi là đã mất/đã qua đời thì ghi true, còn lại để false)",
  "parentId": "id của người cha (hoặc mẹ) để liên kết phả hệ, cực kỳ quan trọng",
  "motherId": "id của người mẹ (nếu xác định được)",
  "spouseId": "id của người vợ hoặc chồng",
  "isMarried": true hoặc false (nếu có spouseId hoặc ghi có vợ có chồng thì là true)",
  "branch": "chi nhánh, phân chi dòng họ, ví dụ: 'Nhánh chính' hoặc tên nhánh tương ứng trong văn bản",
  "story": "mô tả tóm tắt đóng góp, công trạng, chức vị, sự tích hoặc thông tin nổi bật của cụ/thành viên nếu có",
  "occupation": "nghề nghiệp hoạt động tiêu biểu của họ",
  "address": "nơi cư trú hoặc quê quán",
  "phone": "số điện thoại liên lạc"
}

Yêu cầu kỹ thuật:
1. Hãy phân tích các mối liên kết Cha - Con, Vợ - Chồng cẩn thận để gán trường 'parentId', 'spouseId' chính xác nhất giúp vẽ cây phả hệ đúng cấu trúc.
2. Trả về DUY NHẤT một mảng JSON hợp lệ [ { ... }, ... ]. Tuyệt đối KHÔNG bọc trong khối code markdown \`\`\`json, không giải thích gì thêm, không viết chữ thừa ngoài mảng JSON.`;

    const ai = getAIClient();
    let responseText = "";

    if (nameLower.endsWith(".docx")) {
      // Send extracted text to Gemini
      const docxPrompt = `${userPrompt}\n\nNỘI DUNG VĂN BẢN TRÍCH XUẤT TỪ FILE WORD:\n${extractedText}`;
      const aiResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: docxPrompt,
        config: {
          systemInstruction: systemPrompt
        }
      });
      responseText = aiResponse.text || "";
    } else if (nameLower.endsWith(".pdf")) {
      // Send PDF directly to Gemini
      const aiResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            inlineData: {
              mimeType: "application/pdf",
              data: base64
            }
          },
          userPrompt
        ],
        config: {
          systemInstruction: systemPrompt
        }
      });
      responseText = aiResponse.text || "";
    } else {
      return res.status(400).json({ error: "Định dạng tệp không được hỗ trợ để phân tích AI. Chỉ chấp nhận .docx, .pdf" });
    }

    // Clean JSON response from Gemini
    let cleanedText = responseText.trim();
    if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/^```json\s*/i, "");
      cleanedText = cleanedText.replace(/^```\s*/, "");
      cleanedText = cleanedText.replace(/```$/, "");
    }
    cleanedText = cleanedText.trim();

    try {
      const parsedMembers = JSON.parse(cleanedText);
      if (!Array.isArray(parsedMembers)) {
        throw new Error("Dữ liệu trích xuất từ AI không phải dạng mảng thành viên.");
      }
      return res.json({ success: true, count: parsedMembers.length, data: parsedMembers });
    } catch (parseErr: any) {
      console.error("JSON parsing error of Gemini output. Output was:", cleanedText);
      return res.status(500).json({ 
        error: "Lỗi phân tích cú pháp kết quả từ Trí tuệ Nhân tạo. Hãy thử tài liệu rõ ràng hơn hoặc sử dụng tệp nhập Excel.",
        rawAiOutput: responseText 
      });
    }

  } catch (error: any) {
    console.error("Document parsing endpoint error:", error);
    return res.status(500).json({ error: "Không thể phân tích tài liệu: " + error.message });
  }
});

// 1. Members Endpoints
app.get("/api/members", async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("family_members")
      .select("*")
      .order("generation", { ascending: true });

    if (error) {
      console.log("family_members database query status:", error.message || error);
      return res.json({ tablesNeedInitialization: true, data: [] });
    }

    if (!data || data.length === 0) {
      console.log("family_members table is empty, auto-seeding default data...");
      const { error: insertError } = await supabase.from("family_members").insert(initialMembers);
      if (insertError) {
        if (insertError.message && (insertError.message.includes("spouseIds") || insertError.message.includes("column"))) {
          console.log("Missing spouseIds column detected in DB. Seeding cleaned version instead...");
          const cleanedMembers = initialMembers.map(({ spouseIds, ...rest }) => rest);
          const { error: retryError } = await supabase.from("family_members").insert(cleanedMembers);
          if (retryError) {
            console.log("Failed to seed family_members even without spouseIds:", retryError.message || retryError);
            return res.json({ tablesNeedInitialization: true, data: [] });
          }
          return res.json({ data: cleanedMembers });
        }
        console.log("Failed to seed family_members (using initial fallback):", insertError.message || insertError);
        return res.json({ tablesNeedInitialization: true, data: [] });
      }
      return res.json({ data: initialMembers });
    }

    return res.json({ data });
  } catch (error: any) {
    console.error("GET /api/members error:", error?.message || error, error?.stack || "");
    return res.json({ data: [] });
  }
});

app.post("/api/members/sync", async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const members = req.body;
    if (!Array.isArray(members)) {
      return res.status(400).json({ error: "Data must be an array of members" });
    }

    // Since we are syncing ALL, we can upsert. Let's filter out invalid IDs or handle empty arrays
    if (members.length === 0) {
      // If we are syncing an empty list, let's clear the table or return success
      return res.json({ success: true, data: [] });
    }

    // Try upserting. Since some members might be new and some updated, we upsert them.
    // If there is no ID, we can generate a new one, but they should usually have IDs.
    const preparedMembers = members.map(m => {
      if (!m.id) {
        m.id = `m-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }
      return m;
    });

    let { data, error } = await supabase.from("family_members").upsert(preparedMembers).select();
    if (error) {
      if (error.message && (error.message.includes("spouseIds") || error.message.includes("column"))) {
        console.warn("Bulk sync failed with spouseIds column error. Retrying without 'spouseIds'.");
        const cleanedMembers = preparedMembers.map(({ spouseIds, ...rest }: any) => rest);
        const retryResult = await supabase.from("family_members").upsert(cleanedMembers).select();
        if (retryResult.error) throw retryResult.error;
        data = retryResult.data;
      } else {
        throw error;
      }
    }
    return res.json({ success: true, data: data || preparedMembers });
  } catch (error: any) {
    console.error("POST /api/members/sync error:", error);
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/members", async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const member = req.body;
    let { data, error } = await supabase.from("family_members").insert([member]).select();
    if (error) {
      if (error.message && (error.message.includes("spouseIds") || error.message.includes("column"))) {
        console.warn("POST /api/members failed with spouseIds column error. Retrying without 'spouseIds'.");
        const { spouseIds, ...cleanedMember } = member;
        const retryResult = await supabase.from("family_members").insert([cleanedMember]).select();
        if (retryResult.error) throw retryResult.error;
        data = retryResult.data;
      } else {
        throw error;
      }
    }
    return res.json({ success: true, data: data?.[0] || member });
  } catch (error: any) {
    console.error("POST /api/members error:", error);
    return res.status(500).json({ error: error.message });
  }
});

app.put("/api/members/:id", async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { id } = req.params;
    const member = req.body;
    let { error } = await supabase.from("family_members").update(member).eq("id", id);
    if (error) {
      if (error.message && (error.message.includes("spouseIds") || error.message.includes("column"))) {
        console.warn("PUT /api/members failed with spouseIds column error. Retrying without 'spouseIds'.");
        const { spouseIds, ...cleanedMember } = member;
        const retryResult = await supabase.from("family_members").update(cleanedMember).eq("id", id);
        if (retryResult.error) throw retryResult.error;
        error = null;
      } else {
        throw error;
      }
    }
    return res.json({ success: true });
  } catch (error: any) {
    console.error("PUT /api/members error:", error);
    return res.status(500).json({ error: error.message });
  }
});

app.delete("/api/members/:id", async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { id } = req.params;
    const { error } = await supabase.from("family_members").delete().eq("id", id);
    if (error) throw error;
    return res.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/members error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// 2. Announcements Endpoints
app.get("/api/announcements", async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      console.log("announcements database query info:", error.message || error);
      return res.json({ tablesNeedInitialization: true, data: [] });
    }

    if (!data || data.length === 0) {
      console.log("announcements table is empty, auto-seeding default data...");
      const { error: insertError } = await supabase.from("announcements").insert(initialAnnouncements);
      if (insertError) {
        console.log("Seeding announcements status:", insertError.message || insertError);
        return res.json({ tablesNeedInitialization: true, data: [] });
      }
      return res.json({ data: initialAnnouncements });
    }

    return res.json({ data });
  } catch (error: any) {
    console.error("GET /api/announcements error:", error?.message || error, error?.stack || "");
    return res.json({ data: [] });
  }
});

app.post("/api/announcements", async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const announcement = req.body;
    const { error } = await supabase.from("announcements").insert([announcement]);
    if (error) throw error;
    return res.json({ success: true });
  } catch (error: any) {
    console.error("POST /api/announcements error:", error);
    return res.status(500).json({ error: error.message });
  }
});

app.delete("/api/announcements/:id", async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { id } = req.params;
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) throw error;
    return res.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/announcements error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// 3. Prayers Endpoints
app.get("/api/prayers", async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("prayers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log("prayers database query status:", error.message || error);
      return res.json({ tablesNeedInitialization: true, data: [] });
    }

    return res.json({ data: data || [] });
  } catch (error: any) {
    console.error("GET /api/prayers error:", error?.message || error, error?.stack || "");
    return res.json({ data: [] });
  }
});

app.post("/api/prayers", async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const prayer = req.body;
    const { error } = await supabase.from("prayers").insert([prayer]);
    if (error) throw error;
    return res.json({ success: true });
  } catch (error: any) {
    console.error("POST /api/prayers error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// 4. System Logs Endpoints
app.get("/api/logs", async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("system_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log("system_logs database query status:", error.message || error);
      return res.json({ tablesNeedInitialization: true, data: [] });
    }

    return res.json({ data: data || [] });
  } catch (error: any) {
    console.error("GET /api/logs error:", error?.message || error, error?.stack || "");
    return res.json({ data: [] });
  }
});

app.post("/api/logs", async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const log = req.body;
    const { error } = await supabase.from("system_logs").insert([log]);
    if (error) throw error;
    return res.json({ success: true });
  } catch (error: any) {
    console.error("POST /api/logs error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// 5. System Users Endpoints
app.get("/api/users", async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from("system_users").select("*");
    if (error) {
      console.log("system_users table query status:", error.message || error);
      const localUsers = getLocalUsers();
      return res.json({ data: localUsers });
    }
    return res.json({ data: data || [] });
  } catch (error: any) {
    console.error("GET /api/users error:", error?.message || error);
    const localUsers = getLocalUsers();
    return res.json({ data: localUsers });
  }
});

app.post("/api/users", async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const user = req.body;
    const { error } = await supabase.from("system_users").upsert([user]);
    if (error) {
      console.warn("system_users upsert failed, saving to local file fallback instead:", error.message);
      let localUsers = getLocalUsers();
      localUsers = localUsers.filter((u: any) => u.username !== user.username);
      localUsers.push(user);
      saveLocalUsers(localUsers);
      return res.json({ success: true, local: true });
    }
    return res.json({ success: true });
  } catch (error: any) {
    console.error("POST /api/users error:", error);
    const user = req.body;
    let localUsers = getLocalUsers();
    localUsers = localUsers.filter((u: any) => u.username !== user.username);
    localUsers.push(user);
    saveLocalUsers(localUsers);
    return res.json({ success: true, local: true });
  }
});

app.delete("/api/users/:username", async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { username } = req.params;
    const { error } = await supabase.from("system_users").delete().eq("username", username);
    if (error) {
      console.warn("system_users delete failed, deleting from local file fallback instead:", error.message);
      let localUsers = getLocalUsers();
      localUsers = localUsers.filter((u: any) => u.username !== username);
      saveLocalUsers(localUsers);
      return res.json({ success: true, local: true });
    }
    return res.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/users error:", error);
    const { username } = req.params;
    let localUsers = getLocalUsers();
    localUsers = localUsers.filter((u: any) => u.username !== username);
    saveLocalUsers(localUsers);
    return res.json({ success: true, local: true });
  }
});

// 6. System Settings Endpoints
app.get("/api/settings", async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from("system_settings").select("*");
    if (error) {
      console.log("system_settings table query status:", error.message || error);
      const localSettings = getLocalSettings();
      return res.json({ data: localSettings });
    }
    return res.json({ data: data || [] });
  } catch (error: any) {
    console.error("GET /api/settings error:", error?.message || error);
    const localSettings = getLocalSettings();
    return res.json({ data: localSettings });
  }
});

app.post("/api/settings", async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const setting = req.body;
    const { error } = await supabase.from("system_settings").upsert([setting]);
    if (error) {
      console.warn("system_settings upsert failed, saving to local file fallback instead:", error.message);
      let localSettings = getLocalSettings();
      localSettings = localSettings.filter((s: any) => s.key !== setting.key);
      localSettings.push(setting);
      saveLocalSettings(localSettings);
      return res.json({ success: true, local: true });
    }
    return res.json({ success: true });
  } catch (error: any) {
    console.error("POST /api/settings error:", error);
    const setting = req.body;
    let localSettings = getLocalSettings();
    localSettings = localSettings.filter((s: any) => s.key !== setting.key);
    localSettings.push(setting);
    saveLocalSettings(localSettings);
    return res.json({ success: true, local: true });
  }
});

// Lazy-initialize Gemini API client
let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("GEMINI_API_KEY is not defined. AI features will fallback to offline mock template.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// API endpoint for generating Vietnamese ancestral prayers (Sớ/Văn khấn gia tiên)
app.post("/api/gemini/pray", async (req, res) => {
  try {
    const { ancestors, senderName, offering, customWish } = req.body;
    
    if (!ancestors || ancestors.length === 0) {
      return res.status(400).json({ error: "Vui lòng chọn hoặc điền tên gia tiên cần dâng khấn." });
    }

    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      // Offline fallback generator
      const mockPrayers = [
        `Nam mô A Di Đà Phật! \n\nCon kính lạy chín phương Trời, mười phương Chư Phật. Con kính lạy các bậc tổ tiên Cao Tằng Tổ Khảo, Cao Tằng Tổ Tỷ dòng họ Nghiêm, đặc biệt là chân linh: ${ancestors.join(", ")}.\n\nHôm nay là ngày lành tháng tốt, tín chủ con là ${senderName || "con cháu hậu duệ"} thành tâm dâng lên ${offering === 'incense' ? 'nén tâm hương' : offering === 'candle' ? 'ngọn đăng rực rỡ' : offering === 'flower' ? 'đĩa hoa quả tươi thanh khiết' : 'lòng thành kính'}. \n\nCúi xin các cụ linh thiêng chín suối chứng giám lòng thành, thụ nhận lễ vật, phù hộ độ trì cho gia quyến dòng họ luôn được bình an, mạnh khỏe, tai qua nạn khỏi, gia đạo hưng thịnh. ${customWish ? `Lời nguyện cầu riêng: ${customWish}.` : ''}\n\nCẩn cáo!`,
        `Kính dâng hương hồn liệt tổ liệt tông họ Nghiêm! \n\nHậu duệ con cháu là ${senderName || "lòng thành kính"} hướng về cội nguồn, cúi đầu kính lạy liệt tổ họ Nghiêm và các cụ cố linh thiêng: ${ancestors.join(", ")}.\n\nNhân buổi dâng hương lễ mọn này, chúng con cúi xin các cụ che chở, dẫn dắt con cháu đi đúng đường đúng đạo, học hành đỗ đạt, sự nghiệp hanh thông, gìn giữ gia phong rạng danh tổ tiên. ${customWish ? `Lời khấn nguyện: ${customWish}.` : ''}\n\nCon cháu thành tâm cúi lạy.`
      ];
      const selectedMock = mockPrayers[Math.floor(Math.random() * mockPrayers.length)];
      return res.json({ text: selectedMock, isMock: true });
    }

    const prompt = `Bạn là một chuyên gia về văn hóa tâm linh Việt Nam và nghi lễ truyền thống. Hãy viết một bài VĂN KHẤN GIA TIÊN (hoặc bài sớ khấn nguyện dâng hương) trang trọng, thiêng liêng và giàu cảm xúc bằng tiếng Việt dành riêng cho Gia tộc họ Nghiêm (dòng dõi Cụ Nghiêm Cung, Cụ Nghiêm Điều).

Thông tin chi tiết:
- Người dâng hương khấn nguyện (Tín chủ): ${senderName || "Con cháu hậu duệ họ Nghiêm"}
- Các cụ tổ tiên linh thiêng được khấn riêng (Chân linh): ${ancestors.join(", ")}
- Lễ vật dâng lên tâm linh: ${offering === 'incense' ? 'nén tâm hương trầm thơm ngát' : offering === 'candle' ? 'ngọn nến sáng tỏ' : offering === 'flower' ? 'đĩa hoa thơm trái ngọt' : 'lễ mọn lòng thành'}
- Nguyện vọng/Lời nhắn nhủ của con cháu: ${customWish || "Cầu mong gia tộc hưng thịnh, vạn sự bình an, con cháu hiếu thảo và đoàn kết."}

Yêu cầu bài khấn:
1. Có cấu trúc cổ truyền tôn nghiêm (mở đầu trang trọng như Nam Mô A Di Đà Phật, kính lạy các vị thần linh, tổ tiên họ Nghiêm).
2. Viết với giọng văn cổ kính, thành kính, ấm áp, sâu sắc, đề cao tinh thần "Uống nước nhớ nguồn" của người Việt.
3. Chèn khéo léo thông tin các cụ tiên linh dòng họ Nghiêm được nhắc tới ở trên.
4. Chứa lời chúc phúc gia quyến hòa hợp, thịnh hưng cát tường, con cháu hiếu học.
5. Bài viết độ dài trung bình tầm 300-500 từ, định dạng xuống dòng sạch đẹp, dễ đọc dễ tụng khấn.`;

    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Bạn là một nhà sử học và chuyên gia văn hóa truyền thống Việt Nam chuyên viết văn tế và văn khấn dòng họ."
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini prayer generator error:", error);
    res.status(500).json({ error: "Không thể kết nối với trí tuệ nhân tạo lúc này. Hãy thử lại sau." });
  }
});

// Vite server development configuration vs Static files production configuration
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    
    // Serve fallback index.html for Vite development
    app.use("*", async (req, res, next) => {
      const url = req.originalUrl;
      try {
        const fs = await import("fs");
        let template = fs.readFileSync(path.resolve(__dirname, "index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

start();
