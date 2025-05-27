"use client";

import { authClient } from "@/lib/auth-client";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const page = () => {
  const handleSignIn = async () => {
    return await authClient.signIn.social({
      provider: "google",
    });
  };
  return (
    <main className="sign-in">
      <aside className="testimonial">
        <Link href="/">
          <Image
            src="/assets/icons/logo.svg"
            width={32}
            height={32}
            alt="logo"
          />
          <h1>Snapview</h1>
        </Link>

        <div className="description">
          <section>
            <figure>
              {Array.from({ length: 5 }).map((_, index) => (
                <Image
                  key={index}
                  src="/assets/icons/star.svg"
                  width={20}
                  height={20}
                  alt="testimonial"
                />
              ))}
            </figure>
            <p>
              "Snapview is a game-changer for my screen recording needs. The
              seamless capture quality and user-friendly interface have
              transformed the way I create tutorials and share feedback with my
              team."
            </p>

            <article>
              <Image
                src="/assets/images/jason.png"
                width={64}
                height={64}
                alt="testimonial user"
                className="rounded-full"
              />
              <div>
                <h3>Jason</h3>
                <p>Productivity Enthusiast</p>
              </div>
            </article>
          </section>
        </div>

        <p>All rights reserve for Snapview {new Date().getFullYear()}</p>
      </aside>
      <aside className="google-sign-in">
        <section>
          <Link href="/">
            <Image
              src="/assets/icons/logo.svg"
              width={40}
              height={40}
              alt="logo"
            />
            <h1>Snapview</h1>
          </Link>

          <p>
            Create and share your very first <span>Snapview video</span> in no
            time!
          </p>

          <button onClick={handleSignIn}>
            <Image
              src="/assets/icons/google.svg"
              width={22}
              height={22}
              alt="google icon"
            />
            Sign in with Google
          </button>
        </section>
      </aside>

      <div className="overlay" />
    </main>
  );
};

export default page;
