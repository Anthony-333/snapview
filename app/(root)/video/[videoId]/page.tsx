import VideoDetailHeader from "@/components/VideoDetailHeader";
import VideoPlayer from "@/components/VideoPlayer";
import { getVideoByid } from "@/lib/actions/video";
import { redirect } from "next/navigation";

import React from "react";

const page = async ({ params }: Params) => {
  const { id } = await params;

  const videoRecord = await getVideoByid(id);

  if (!videoRecord?.video) redirect("/404");

  return (
    <main className="wrapper page">
      <VideoDetailHeader
        {...videoRecord.video}
        userImg={videoRecord.user?.image}
        ownerId={videoRecord.video.userId}
        username={videoRecord.user?.name}
      />      <section className="video-details">
        <div className="content">
          <VideoPlayer videoId={videoRecord.video.videoId} />
        </div>
      </section>
    </main>
  );
};

export default page;
