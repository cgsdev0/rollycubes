import React from "react";

interface Props {
  achievement_id: string;
  image_url: string;
  description: string;
  name: string;
}
export const Achievement = (props: Props) => {
  return (
    <div>
      <img src={props.image_url} />
      <p>Achievement Unlocked</p>
      <p>{props.name}</p>
      <span>{props.description}</span>
    </div>
  );
};
