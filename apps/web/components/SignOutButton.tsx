"use client";

import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const { signOut } = useClerk();
  const router = useRouter();

  return (
    <button
      onClick={async () => {
        await signOut();
        router.push("/sign-in");
      }}
      style={{
        padding: "6px 12px",
        fontSize: "13px",
        color: "#787774",
        background: "none",
        border: "1px solid #e9e9e7",
        borderRadius: "6px",
        cursor: "pointer",
      }}
    >
      Sign out
    </button>
  );
}
