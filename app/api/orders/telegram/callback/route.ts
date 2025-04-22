import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

// Inisialisasi Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Setup Nodemailer transporter menggunakan Gmail SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Fungsi untuk mengirim email menggunakan Nodemailer
async function sendEmail(to: string, subject: string, html: string) {
  const mailOptions = {
    from: "Dire Tracksuit direfightwear@gmail.com", // Ganti dengan email kamu
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email successfully sent to ${to} with subject: ${subject}`);
  } catch (error) {
    throw new Error("Failed to send email via Nodemailer: " + (error as Error).message);
  }
}

// Fungsi untuk mengedit pesan Telegram
async function editTelegramMessage(chatId: string, messageId: number, text: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    throw new Error("Missing Telegram bot token. Please check TELEGRAM_BOT_TOKEN in .env.local");
  }

  const telegramUrl = `https://api.telegram.org/bot${botToken}/editMessageText`;
  const response = await fetch(telegramUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: "Markdown",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to edit Telegram message: " + response.statusText);
  }

  console.log(`Telegram message updated for chat ${chatId}, message ${messageId}`);
}

// Handler GET untuk debugging
export async function GET() {
  return NextResponse.json({ message: "Telegram callback endpoint is active" }, { status: 200 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Received Telegram callback:", JSON.stringify(body, null, 2));

    const callbackQuery = body.callback_query;

    if (!callbackQuery) {
      console.log("No callback query found in request body");
      return NextResponse.json({ error: "No callback query found" }, { status: 400 });
    }

    const chatId = callbackQuery.message.chat.id;
    const messageId = callbackQuery.message.message_id;
    const callbackData = callbackQuery.data;
    console.log(`Callback data received: ${callbackData}`);

    // Parse callback data (contoh: "confirm_KDF-12345" atau "reject_KDF-12345")
    const [action, orderNumber] = callbackData.split("_");

    if (!action || !orderNumber) {
      console.log("Invalid callback data format");
      return NextResponse.json({ error: "Invalid callback data" }, { status: 400 });
    }

    // Ambil data order dari Supabase
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("*")
      .eq("order_number", orderNumber)
      .single();

    if (fetchError || !order) {
      console.log(`Order not found for order_number: ${orderNumber}`);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update status order berdasarkan aksi
    const newStatus = action === "confirm" ? "confirmed" : "rejected";
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("order_number", orderNumber);

    if (updateError) {
      console.log(`Failed to update order status: ${updateError.message}`);
      return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
    }

    console.log(`Order status updated to ${newStatus} for order_number: ${orderNumber}`);

    // Edit pesan Telegram untuk menunjukkan status terbaru
    const updatedMessage = `
🎉 *Order Update!* 🎉  
📦 *Order Number:* \`${order.order_number}\`  
👤 *Buyer:* ${order.first_name} ${order.last_name}  
📧 *Email:* ${order.email}  
📱 *Phone:* ${order.phone}  
🏠 *Shipping Address:*  
   ${order.address}, ${order.city}, ${order.state} ${order.zip_code}  
💰 *Total Amount:* Rp ${order.amount.toLocaleString()}  
🖼️ *Payment Proof:* [View Here](${order.payment_proof_url})  
⏳ *Status:* ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}  
📅 *Order Date:* ${new Date(order.created_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
    `;
    await editTelegramMessage(chatId, messageId, updatedMessage);

    // Kirim email konfirmasi ke pembeli
    const emailSubject = action === "confirm" ? "Your Order Has Been Confirmed!" : "Your Order Has Been Rejected";
    const emailHtml = action === "confirm"
      ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2ecc71;">Order Confirmed! 🎉</h2>
          <p>Hi ${order.first_name},</p>
          <p>We’re excited to let you know that your order has been confirmed! Your Dire Khadaffi Track Suit will be shipped soon.</p>
          <h3>Order Details</h3>
          <p><strong>Order Number:</strong> ${order.order_number}</p>
          <p><strong>Product:</strong> Dire Khadaffi Track Suit</p>
          <p><strong>Amount:</strong> Rp ${order.amount.toLocaleString()}</p>
          <p><strong>Shipping Address:</strong> ${order.address}, ${order.city}, ${order.state} ${order.zip_code}</p>
          <p>If you have any questions, feel free to reply to this email.</p>
          <p>Thank you for shopping with Dire Tracksuit!</p>
          <p>Best regards,<br>The Dire Tracksuit Team</p>
        </div>
      `
      : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #e74c3c;">Order Rejected</h2>
          <p>Hi ${order.first_name},</p>
          <p>We’re sorry to inform you that your order has been rejected. This might be due to an issue with the payment proof or other verification steps.</p>
          <h3>Order Details</h3>
          <p><strong>Order Number:</strong> ${order.order_number}</p>
          <p><strong>Product:</strong> Dire Khadaffi Track Suit</p>
          <p><strong>Amount:</strong> Rp ${order.amount.toLocaleString()}</p>
          <p>Please contact us for more information or to resubmit your order.</p>
          <p>Best regards,<br>The Dire Tracksuit Team</p>
        </div>
      `;

    await sendEmail(order.email, emailSubject, emailHtml);

    return NextResponse.json({ message: "Order status updated and email sent" }, { status: 200 });
  } catch (error) {
    console.error("Error processing callback:", (error as Error).message);
    return NextResponse.json({ error: "Failed to process callback: " + (error as Error).message }, { status: 500 });
  }
}