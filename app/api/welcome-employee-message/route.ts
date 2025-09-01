import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { employeeId, name, phone } = await req.json();
        if (!employeeId || !name || !phone) {
            return NextResponse.json({ error: "Missing employeeId, name, or phone" }, { status: 400 });
        }

        // Fast2SMS WhatsApp API details
        const API_KEY = process.env.FAST2SMS_API_KEY;
        const MESSAGE_ID = "4183";
        const BASE_URL = "https://www.fast2sms.com/dev/whatsapp";

        // Variables for template
        const Var1 = name.split(" ")[0]; // First name for header
        const Var2 = name; // Full name for body
        const Var3 = employeeId; // Employee ID
        const variables_values = `${Var1}|${Var2}|${Var3}`;

        const url = `${BASE_URL}?authorization=${API_KEY}&message_id=${MESSAGE_ID}&numbers=${phone}&variables_values=${encodeURIComponent(variables_values)}`;

        const response = await fetch(url, {
            method: "GET",
        });
        const result = await response.json();

        if (!response.ok || !result.return) {
            return NextResponse.json({ error: result.message || "Failed to send WhatsApp message" }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: "Welcome message sent successfully" });
    } catch (error) {
        console.error("Error in welcome employee message:", error);
        return NextResponse.json({ error: "Failed to send welcome message" }, { status: 500 });
    }
}