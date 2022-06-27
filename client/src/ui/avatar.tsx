import React from "react";
import { css, styled } from "stitches.config";
import defaultIcon from "../../public/default_player.png";
import crownIcon from "../../public/crown.png";
import { DisconnectedIcon } from "./icons/disconnected";

interface Props {
  imageUrl?: string | null;
  n?: number;
  size?: number;
  crown?: boolean;
  disconnected?: boolean;
}

const avatarWrapper = css({
  alignItems: "center",
  marginRight: 8,
  position: "relative",
  cursor: "pointer",
  "& .avatar": {
    borderRadius: "50%",
  },
});

const disconnectedWrapper = css({
  position: "absolute",
  bottom: -5,
  zIndex: 5,
  left: -3,
  transform: "scale(80%)",
  backgroundColor: "#000000aa",
  borderRadius: "50%",
});
const Crown = styled("img", {
  position: "absolute",
  top: -6,
  zIndex: 5,
  left: 6,
});

const Avatar = React.forwardRef<HTMLSpanElement, Props>((props, ref) => {
  const { size, imageUrl, n, crown, disconnected } = props;

  const forSureImageUrl = imageUrl || defaultIcon;

  const size2 = size || 36;

  return (
    <span className={avatarWrapper()} ref={ref}>
      <img
        className="avatar"
        alt="avatar"
        src={forSureImageUrl}
        width={size2}
        height={size2}
      />
      {crown ? (
        <Crown alt="crown" src={crownIcon} width={24} height={18} />
      ) : null}
      {disconnected ? (
        <span className={disconnectedWrapper()}>
          <DisconnectedIcon />
        </span>
      ) : null}
    </span>
  );
});

export default Avatar;
