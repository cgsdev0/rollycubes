import React from "react";
import "../App.css";

interface Props {
  imageUrl?: string | null;
  firstInitial: string;
}

const Avatar: React.FC<Props> = props => {
  const { imageUrl, firstInitial } = props;

  return (
    <>
      {imageUrl ? (
        <img alt="avatar" src={imageUrl} width={24} height={24} />
      ) : (
        <div className="avatar">{firstInitial.toUpperCase()}</div>
      )}
    </>
  );
};

export default Avatar;
