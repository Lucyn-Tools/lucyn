import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@lucyn/db";

/** Gets userId, redirects to /sign-in if not authenticated. */
export async function requireAuth(): Promise<string> {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  return userId;
}

/** Gets the full Clerk user object, redirects to /sign-in if not authenticated. */
export async function requireUser() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");
  return user;
}

/** Gets auth state without redirecting — use in API routes that return 401. */
export async function getAuth() {
  const { userId } = await auth();
  return { userId, isAuthenticated: !!userId };
}

/** Gets the orgId for the current user, or null if not a member of any org. */
export async function getOrgId(): Promise<string | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const membership = await prisma.orgMember.findFirst({ where: { userId } });
  return membership?.orgId ?? null;
}
