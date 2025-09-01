"use server";

import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function UpdatePassword(data: any) {
  try {
    const session = await getSession();
    if (!session?.isAdmin) {
      return { success: false, message: "Unauthorized action" };
    }
    const { id, newPassword } = data;
    if (!id || !newPassword) {
      throw new Error("Invalid input data");
    }

     const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return { success: false, message: "User not found" };
    }


    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    const response = await prisma.user.update({
      where: { id },
      data: { password: hashedNewPassword },
    });

    if (!response) {
     return { success: false, message: "User not found" };
    }
    return { success: true, message: "Password updated successfully" };
  } catch (error: any) {
    console.error("Error updating password:", error);
    return { success: false, message: error.message || "An error occurred" };
   
  }
}
