import React from "react";

interface Props {
  imageUrl?: string | null;
  firstInitial: string;
  n?: number;
  size?: number;
}

const Avatar: React.FC<Props> = (props) => {
  const { size, imageUrl, firstInitial, n } = props;

  const size2 = size || 24;

  return (
    <span
      className="avatar-container"
      data-for={`player-${n}`}
      data-tip="custom show"
      data-event="click focus"
    >
      {imageUrl ? (
        <img alt="avatar" src={imageUrl} width={size2} height={size2} />
      ) : (
        <div className="avatar" style={{ width: size2, height: size2 }}>
          {firstInitial.toUpperCase()}
        </div>
      )}
    </span>
  );
};

export default Avatar;
