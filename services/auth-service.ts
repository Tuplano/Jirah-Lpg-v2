import { createClient } from "@/lib/supabase/server";

/**
 * Authentication service for handling Supabase auth operations.
 * This service is purely for data/auth logic and is decoupled from Next.js routing/cookies.
 */
export const authService = {
  /**
   * Signs in a user with email and password.
   */
  async signIn(email: string, password: string) {
    const supabase = await createClient();
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  },

  /**
   * Signs up a new user with email and password.
   */
  async signUp(email: string, password: string, redirectTo?: string) {
    const supabase = await createClient();
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
      },
    });
  },

  /**
   * Signs out the current user.
   */
  async signOut() {
    const supabase = await createClient();
    return await supabase.auth.signOut();
  },

  /**
   * Gets the current user session.
   */
  async getUser() {
    const supabase = await createClient();
    return await supabase.auth.getUser();
  },
};
