import React from "react";
import { css } from "stitches.config";

interface Props {
  imageUrl?: string | null;
  firstInitial: string;
  n?: number;
  size?: number;
}

const avatarWrapper = css({
  alignItems: "center",
  marginRight: 8,
  cursor: "pointer",
  "& img": {
    borderRadius: "50%",
  },
});

const avatar = css({
  borderRadius: "50%",
  backgroundColor: "green",
  color: "white",
  textAlign: "center",
  fontSize: "14pt",
  fontWeight: "bold",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
});

const Avatar: React.FC<Props> = (props) => {
  const { size, imageUrl, firstInitial, n } = props;

  const size2 = size || 36;

  return (
    <span
      className={avatarWrapper()}
      data-for={`player-${n}`}
      data-tip="custom show"
      data-event="click focus"
    >
      {imageUrl ? (
        <img alt="avatar" src={imageUrl} width={size2} height={size2} />
      ) : (
        <div className={avatar()} style={{ width: size2, height: size2 }}>
          {firstInitial.toUpperCase()}
        </div>
      )}
    </span>
  );
};

export default Avatar;
