export type AuthedUser = {
  id: string;
  email: string;
  displayName: string;
  /** False when Supabase allows sign-in before email confirmation (project setting). */
  emailVerified: boolean;
};
