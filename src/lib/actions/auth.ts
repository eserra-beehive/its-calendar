"use server";

import bcrypt from "bcryptjs";
import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AuthError } from "next-auth";
import type { ActionResult } from "@/types";

export async function authenticate(
  email: string,
  password: string
): Promise<ActionResult> {
  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: "Credenziali non valide" };
    }
    throw error;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}

export async function seedAdmin(): Promise<ActionResult> {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    return { success: false, error: "ADMIN_EMAIL e ADMIN_PASSWORD non configurati" };
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return { success: false, error: "Admin già esistente" };
  }

  const hashed = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { email, password: hashed, name: "Admin" },
  });

  return { success: true };
}
