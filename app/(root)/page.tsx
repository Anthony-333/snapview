import Header from "@/components/Header";
import VideoCard from "@/components/VideoCard";
import { dummyCards } from "@/constants";
import React from "react";

const page = () => {
  return (
    <main className="wrapper page">
      <Header title="All Videos" subHeader="Public Library" />

      <section className="video-grid">
        {dummyCards.map((card) => (
          <VideoCard
            key={card.id}
            id={card.id}
            title={card.title}
            thumbnail={card.thumbnail}
            createdAt={card.createdAt}
            userImg={card.userImg}
            username={card.username}
            views={card.views}
            visibility={card.visibility}
            duration={card.duration}
          />
        ))}
      </section>
    </main>
  );
};

export default page;
