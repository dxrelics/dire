import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import rateLimit from "express-rate-limit";

// Ambil environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validasi environment variables untuk Supabase
if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
}

// Inisialisasi Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Konfigurasi rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 5, // Maksimal 5 request per IP dalam 15 menit
  keyGenerator: (req) => {
    return req.headers.get("x-forwarded-for") || "unknown-ip"; // Gunakan IP dari header
  },
  handler: () => {
    return NextResponse.json({ error: "Too many requests, please try again later" }, { status: 429 });
  },
});

// Middleware untuk menjalankan rate limiting di Next.js API Route
const applyRateLimit = async (req: Request) => {
  return new Promise<NextResponse | null>((resolve) => {
    limiter(req as any, {} as any, (result: any) => {
      if (result instanceof NextResponse) {
        resolve(result);
      } else {
        resolve(null);
      }
    });
  });
};

// Fungsi untuk mengirim notifikasi ke Telegram dengan tombol inline
async function sendTelegramNotification(order: any, paymentProofUrl: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  // Validasi environment variables untuk Telegram
  if (!botToken || !chatId) {
    throw new Error("Missing Telegram environment variables. Please check TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env.local");
  }

  const message = `
🎉 *New Order Alert!* 🎉  
📦 *Order Number:* \`${order.order_number}\`  
👤 *Buyer:* ${order.first_name} ${order.last_name}  
📧 *Email:* ${order.email}  
📱 *Phone:* ${order.phone}  
🏠 *Shipping Address:*  
   ${order.address}, ${order.city}, ${order.state} ${order.zip_code}  
💰 *Total Amount:* Rp ${order.amount.toLocaleString()}  
🖼️ *Payment Proof:* [View Here](${paymentProofUrl})  
⏳ *Status:* ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}  
📅 *Order Date:* ${new Date(order.created_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
  `;

  const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const response = await fetch(telegramUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "✅ Confirm", callback_data: `confirm_${order.order_number}` },
            { text: "❌ Reject", callback_data: `reject_${order.order_number}` },
          ],
        ],
      },
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to send Telegram notification");
  }
}

export async function POST(request: Request) {
  // Terapkan rate limiting
  const rateLimitResponse = await applyRateLimit(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const formData = await request.formData();
    const orderNumber = formData.get("orderNumber") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const state = formData.get("state") as string;
    const zipCode = formData.get("zipCode") as string;
    const amount = parseFloat(formData.get("amount") as string);
    const paymentProof = formData.get("paymentProof") as File;

    // Validasi semua field yang dibutuhkan
    if (!orderNumber || !firstName || !lastName || !email || !phone || !address || !city || !state || !zipCode || !amount || !paymentProof) {
      return NextResponse.json({ error: "All fields are required, including payment proof" }, { status: 400 });
    }

    // Validasi format email sederhana
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Upload payment proof ke Supabase Storage
    let paymentProofUrl = null;
    if (paymentProof) {
      const { data, error: uploadError } = await supabase.storage
        .from("payment-proofs")
        .upload(`${orderNumber}-${paymentProof.name}`, paymentProof);

      if (uploadError) {
        return NextResponse.json({ error: uploadError.message }, { status: 500 });
      }

      const { data: publicUrlData } = supabase.storage
        .from("payment-proofs")
        .getPublicUrl(`${orderNumber}-${paymentProof.name}`);
      paymentProofUrl = publicUrlData.publicUrl;
    }

    // Simpan data ke tabel 'orders' di Supabase
    const { data, error } = await supabase.from("orders").insert([
      {
        order_number: orderNumber,
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        address,
        city,
        state,
        zip_code: zipCode,
        amount,
        payment_proof_url: paymentProofUrl,
        status: "pending",
        created_at: new Date().toISOString(),
      },
    ]).select();

    if (error) {
      return NextResponse.json({ error: `Failed to save order: ${error.message}` }, { status: 500 });
    }

    const order = data[0];

    // Kirim notifikasi ke Telegram
    await sendTelegramNotification(order, paymentProofUrl!);

    return NextResponse.json({ message: "Order saved successfully", data: order }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save order: " + (error as Error).message }, { status: 500 });
  }
}