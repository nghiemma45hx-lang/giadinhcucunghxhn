import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import { initialMembers, initialAnnouncements } from "./src/data/familyData";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

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

  const fallbackUrl = "https://domczpyfjiqttwdcrdsj.supabase.co";
  const fallbackKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvbWN6cHlmamlxdHR3ZGNyZHNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjcwMTM5NCwiZXhwIjoyMDk4Mjc3Mzk0fQ.-2ksd7TQPy6hDPwE2S2OWUzWC0ws04FjecgL2lhRWf0";

  if (!url || url === "MY_SUPABASE_URL" || !url.startsWith("http")) {
    url = fallbackUrl;
  }

  // If using the default Supabase project, force use the correct full key
  if (url.includes("domczpyfjiqttwdcrdsj.supabase.co")) {
    key = fallbackKey;
  } else if (
    !key || 
    key === "MY_SUPABASE_SERVICE_ROLE_KEY" || 
    key === "SUPABASE_SERVICE_ROLE_KEY" ||
    key.startsWith("YOUR_") || 
    key.startsWith("your_") ||
    key.includes("SERVICE_ROLE") ||
    key.includes("service_role") ||
    !key.startsWith("eyJ")
  ) {
    key = fallbackKey;
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
    }
  });
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

// 1. Members Endpoints
app.get("/api/members", async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("family_members")
      .select("*")
      .order("generation", { ascending: true });

    if (error) {
      console.warn("family_members database query error (falling back to local):", error.message || error);
      return res.json({ tablesNeedInitialization: true, data: [] });
    }

    if (!data || data.length === 0) {
      console.log("family_members table is empty, auto-seeding default data...");
      const { error: insertError } = await supabase.from("family_members").insert(initialMembers);
      if (insertError) {
        console.warn("Failed to seed family_members (using initial fallback):", insertError.message || insertError);
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

app.post("/api/members", async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const member = req.body;
    const { data, error } = await supabase.from("family_members").insert([member]).select();
    if (error) throw error;
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
    const { error } = await supabase.from("family_members").update(member).eq("id", id);
    if (error) throw error;
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
      console.warn("announcements database query error (falling back to local):", error.message || error);
      return res.json({ tablesNeedInitialization: true, data: [] });
    }

    if (!data || data.length === 0) {
      console.log("announcements table is empty, auto-seeding default data...");
      const { error: insertError } = await supabase.from("announcements").insert(initialAnnouncements);
      if (insertError) {
        console.warn("Failed to seed announcements (using initial fallback):", insertError.message || insertError);
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
      console.warn("prayers database query error (falling back to local):", error.message || error);
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
      console.warn("system_logs database query error (falling back to local):", error.message || error);
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
