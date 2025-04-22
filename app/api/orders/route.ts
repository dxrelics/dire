import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Ambil environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validasi environment variables untuk Supabase
console.log("Checking Supabase environment variables...");
if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables!");
  throw new Error("Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
}

// Inisialisasi Supabase client
console.log("Initializing Supabase client...");
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Fungsi untuk mengirim notifikasi ke Telegram dengan tombol inline
async function sendTelegramNotification(order: any, paymentProofUrl: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  console.log("Checking Telegram environment variables...");
  if (!botToken || !chatId) {
    console.error("Missing Telegram environment variables!");
    throw new Error("Missing Telegram environment variables. Please check TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env.local");
  }

  console.log(`Sending Telegram notification for order ${order.order_number}`);

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
    const errorText = await response.text();
    console.error("Failed to send Telegram notification:", errorText);
    throw new Error("Failed to send Telegram notification: " + errorText);
  }

  console.log(`Telegram notification sent for order ${order.order_number}`);
}

export async function POST(request: Request) {
  console.log("Received POST request to /api/orders");
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

    console.log("Received form data:", {
      orderNumber,
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      zipCode,
      amount,
      paymentProof: paymentProof ? paymentProof.name : null,
    });

    // Validasi semua field yang dibutuhkan
    if (!orderNumber || !firstName || !lastName || !email || !phone || !address || !city || !state || !zipCode || !amount || !paymentProof) {
      console.log("Validation failed: Missing required fields");
      return NextResponse.json({ error: "All fields are required, including payment proof" }, { status: 400 });
    }

    // Validasi format email sederhana
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("Validation failed: Invalid email format");
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Validasi amount adalah angka
    if (isNaN(amount)) {
      console.log("Validation failed: Amount is not a valid number");
      return NextResponse.json({ error: "Amount must be a valid number" }, { status: 400 });
    }

    // Upload payment proof ke Supabase Storage
    let paymentProofUrl = null;
    if (paymentProof) {
      console.log(`Uploading payment proof: ${orderNumber}-${paymentProof.name}`);
      const { data, error: uploadError } = await supabase.storage
        .from("payment-proofs")
        .upload(`${orderNumber}-${paymentProof.name}`, paymentProof);

      if (uploadError) {
        console.error("Failed to upload payment proof:", uploadError.message);
        return NextResponse.json({ error: uploadError.message }, { status: 500 });
      }

      const { data: publicUrlData } = supabase.storage
        .from("payment-proofs")
        .getPublicUrl(`${orderNumber}-${paymentProof.name}`);
      paymentProofUrl = publicUrlData.publicUrl;
      console.log(`Payment proof uploaded, public URL: ${paymentProofUrl}`);
    }

    // Data yang akan disimpan ke Supabase
    const orderData = {
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
    };

    console.log("Data to insert into Supabase:", orderData);

    // Simpan data ke tabel 'orders' di Supabase
    console.log("Inserting order into Supabase...");
    const { data, error } = await supabase.from("orders").insert([orderData]).select();

    if (error) {
      console.error("Failed to insert order into Supabase:", error.message);
      return NextResponse.json({ error: `Failed to save order: ${error.message}` }, { status: 500 });
    }

    const order = data[0];
    console.log("Inserted order from Supabase:", order);

    // Kirim notifikasi ke Telegram
    console.log("Sending Telegram notification...");
    await sendTelegramNotification(order, paymentProofUrl!);

    console.log("Order processed successfully!");
    return NextResponse.json({ message: "Order saved successfully", data: order }, { status: 200 });
  } catch (error) {
    console.error("Error in /api/orders:", (error as Error).message);
    return NextResponse.json({ error: "Failed to save order: " + (error as Error).message }, { status: 500 });
  }
}