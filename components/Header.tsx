"use client";

import { ICONS } from "@/constants";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import DropdownList from "./DropdownList";
import RecordScreen from "./RecordScreen";

const Header = ({ subHeader, title, userImg }: SharedHeaderProps) => {
  const [selectedFilter, setSelectedFilter] = useState("Most Recent");
  
  const filterOptions = ["Most Recent", "Oldest First", "Most Viewed", "Least Viewed"];

  return (
    <header className="header">
      <section className="header-container">
        <div className="details">
          {userImg && (
            <Image
              src={userImg || "assets/images/dummy.jpg"}
              width={66}
              height={66}
              alt="user"
              className="rounded-full aspect-square"
            />
          )}

          <article>
            <p>{subHeader}</p>
            <h1>{title}</h1>
          </article>
        </div>

        <aside>
          <Link href="/upload">
            <Image
              src="/assets/icons/upload.svg"
              width={16}
              height={16}
              alt="upload"
            />
            <span>Upload a video</span>
          </Link>
          <RecordScreen />
        </aside>
      </section>

      <section className="search-filter">
        <div className="search">
          <input
            type="text"
            placeholder="Search for videos, tags, folders..."
          />
          <Image
            src="/assets/icons/search.svg"
            width={16}
            height={16}
            alt="search"
          />
        </div>

        <DropdownList 
          options={filterOptions}
          selectedOption={selectedFilter}
          onOptionSelect={setSelectedFilter}
          triggerElement={
            <button className="filter-trigger">
              <span>{selectedFilter}</span>
              <Image src="/assets/icons/hamburger.svg" width={16} height={16} alt="filter" />
            </button>
          }
        />
      </section>
    </header>
  );
};

export default Header;
