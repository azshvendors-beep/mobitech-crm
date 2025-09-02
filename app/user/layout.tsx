import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

interface UserLayoutProps {
  children: React.ReactNode;
}

const UserLayout = ({ children }: UserLayoutProps) => {
  const router = useRouter();
  const checkIsMfaEnabled = async () => {
    try {
      const response = await fetch("/api/mfa/check");
      if (!response.ok) {
        throw new Error("Failed to check MFA status");
      }
      const data = await response.json();
      console.log("MFA Status:", data);
      data.isMfaEnabled === false &&
        router.push(`/auth/mfa-setup?userId=${data.userId}`);
    } catch (error) {
      console.error("Error checking MFA status:", error);
      return false;
    }
  };

  useEffect(() => {
    checkIsMfaEnabled();
  }, []);
  return <div>{children}</div>;
};

export default UserLayout;
