import React, { useState } from "react";
import { PlayIcon } from "lucide-react";

import * as S from "./styles";

const videoMeta = [
  {
    title: "Automate logging your budget from email to your expense tracker",
    id: 0,
    url: "https://www.loom.com/embed/f8dbe36b7e824e8c9b5e96772826de03?sid=649c36e1-0743-4235-a2ca-cdf9a78d61df",
  },
  {
    title:
      "Automate log details from the PDF receipt into your expense tracker",
    id: 1,
    url: "https://www.loom.com/embed/2caf488bbb76411993f9a7cdfeb80cd7?sid=d80800de-7997-4303-8f7f-8e163203fddf",
  },
  {
    title: "Comparison: Adept.ai vs AIEmploye",
    id: 2,
    url: "https://www.loom.com/embed/27d1f8983572429a8a08efdb2c336fe8?sid=3eeaa778-4350-412c-8042-58805a63ad13",
  },
  {
    title: "How to create a workflow",
    id: 3,
    url: "https://www.loom.com/embed/8327dfa677ec44869ab0d83235763998?sid=a676cdba-48e8-4f31-8cc2-5adf47989ae5",
  },
];

const Showcase = () => {
  const [selectedVideoId, setSelectedVideoId] = useState(0);
  return (
    <S.ShowcaseContainer>
      <S.MetaWrapper>
        {videoMeta.map((meta) => (
          <VideoMeta
            onClick={() => setSelectedVideoId(meta.id)}
            key={meta.id}
            {...meta}
            selected={selectedVideoId === meta.id}
          />
        ))}
      </S.MetaWrapper>
      <div
        style={{
          position: "relative",
          width: "100%",
          paddingBottom: "56.25%",
          height: 0,
          background: "#4d4d4d",
          marginTop: 28,
        }}
      >
        <iframe
          src={videoMeta[selectedVideoId].url}
          frameBorder={0}
          // @ts-ignore
          webkitallowfullscreen=""
          mozallowfullscreen=""
          // @ts-ignore
          allowFullScreen={true}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        />
      </div>
    </S.ShowcaseContainer>
  );
};

interface VideoMetaProps {
  title: string;
  id: number;
  onClick: () => void;
  selected: boolean;
}

export const VideoMeta = ({ title, id, selected, onClick }: VideoMetaProps) => {
  return (
    <S.VideoMetaWrapper
      onClick={onClick}
      style={
        selected ? { border: "1px solid #fff", background: "#3e3e3e" } : {}
      }
    >
      <S.VideoMetaTitle>
        <S.VideoIcon>
          <PlayIcon size={15} />
        </S.VideoIcon>
        <p>{title}</p>
      </S.VideoMetaTitle>
    </S.VideoMetaWrapper>
  );
};

export default Showcase;
