import React from "react";
import "../App.css";

interface Props {
  imageUrl?: string | null;
  firstInitial: string;
  n?: number;
}

const Avatar: React.FC<Props> = props => {
  const { imageUrl, firstInitial, n } = props;

  return (
    <span className="avatar-container" data-tip data-for={`player-${n}`}>
      {imageUrl ? (
        <img alt="avatar" src={imageUrl} width={24} height={24} />
      ) : (
        <div className="avatar">{firstInitial.toUpperCase()}</div>
      )}
    </span>
  );
};

export default Avatar;
