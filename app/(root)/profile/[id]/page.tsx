import Header from "@/components/Header";
import VideoCard from "@/components/VideoCard";
import { dummyCards } from "@/constants";

const page = async ({ params }: ParamsWithSearch) => {
  const { id } = await params;

  return (
    <div className="wrapper page">
      <Header
        subHeader="johnanthony@gmail.com"
        title="John | mastery"
        userImg="/assets/images/dummy.jpg"
      />

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
    </div>
  );
};

export default page;
