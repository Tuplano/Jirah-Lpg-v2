'use server'

import { authService } from "@/services/auth-service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * Handles the sign-in form submission.
 */
export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await authService.signIn(email, password);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

/**
 * Handles the sign-up form submission.
 */
export async function signUp(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`;

  const { error } = await authService.signUp(email, password, redirectTo);

  if (error) {
    return { error: error.message };
  }

  return { success: "Check your email to continue the sign-up process." };
}

/**
 * Handles the sign-out request.
 */
export async function signOut() {
  await authService.signOut();
  revalidatePath("/", "layout");
  redirect("/auth/login");
}
