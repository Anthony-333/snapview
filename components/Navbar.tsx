"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";

const Navbar = () => {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);

  const user = session?.user;

  // Get session only on client side
  useEffect(() => {
    setIsClient(true);
    
    const getSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const sessionData = await response.json();
          setSession(sessionData);
        }
      } catch (error) {
        console.error("Error getting session:", error);
      }
    };
    
    getSession();
  }, []);

  const handleLogout = async () => {
    try {
      const { authClient } = await import("@/lib/auth-client");
      await authClient.signOut();
      router.push("/sign-in");
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Don't render user-specific content until client-side
  if (!isClient) {
    return (
      <header className="navbar">
        <nav>
          <Link href="/">
            <Image
              src="/assets/icons/logo.svg"
              width={32}
              height={32}
              alt="logo"
            />
            <h1>Snapview</h1>
          </Link>
          <figure>
            <div className="w-9 h-9 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
          </figure>
        </nav>
      </header>
    );
  }

  return (
    <header className="navbar">
      <nav>
        <Link href="/">
          <Image
            src="/assets/icons/logo.svg"
            width={32}
            height={32}
            alt="logo"
          />
          <h1>Snapview</h1>
        </Link>

        <figure>
          <button onClick={() => router.push(`/profile/${user?.id}`)}>
            <Image
              src={user?.image || "/assets/images/dummy.jpg"}
              width={36}
              height={36}
              alt="useravatar"
              className="rounded-full aspect-square"
            />
          </button>
          <button onClick={handleLogout} className="cursor-pointer">
            <Image
              src="/assets/icons/logout.svg"
              width={24}
              height={24}
              alt="logout"
              className="rotate-180"
            />
          </button>
        </figure>
      </nav>
    </header>
  );
};

export default Navbar;
