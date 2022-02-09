import React from "react";
import "./achievement.css";

interface Props {
  achievement_id: string;
  image_url?: string;
  description: string;
  name: string;
}
export const Achievement = (props: Props) => {
  return (
    <div className="achievement">
      <img width={48} height={48} src={props.image_url} />
      <div>
        <p className="header">Achievement Unlocked</p>
        <p className="name">{props.name}</p>
      </div>
    </div>
  );
};
