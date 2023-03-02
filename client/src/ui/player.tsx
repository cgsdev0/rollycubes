import HorizontalScroll from "react-horizontal-scrolling";
import { connect } from "react-redux";
import { css } from "stitches.config";
import { selectIsSpectator, selectSelfIndex, selectTurnIndex } from "../selectors/game_selectors";
import { ReduxState } from "../store";
import { Achievement, Player } from "../types/store_types";
import Avatar from "./avatar";
import { usePopperTooltip } from "react-popper-tooltip";

// TODO: remove
import "react-popper-tooltip/dist/styles.css";
import { KickIcon } from "./icons/kick";
import React from "react";

interface Props {
  player: Player;
  n: number;
  self_index?: number;
  turn_index: number;
  socket?: WebSocket;
  isSpectator: boolean;
}

const playerName = css({
  overflow: "hidden",
  height: "100%",
  width: "100%",
  alignItems: "center",
  display: "flex",
});

const playerRow = css({
  display: "flex",
  justifyContent: "space-between",
  lineHeight: 0,
  minHeight: 36,
  "&.highlight": {
    backgroundColor: "$brandFaded",
  },
  paddingLeft: 30,
  paddingRight: 30,
  paddingTop: 2,
  paddingBottom: 2,
  position: "relative",
});

const avatarAndName = css({
  display: "flex",
  maxWidth: "75%",
  alignItems: "center",
});

const score = css({
  display: "flex",
  alignItems: "center",
});

const kick = css({
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
  height: "100%",
  position: "absolute",
  top: 0,
  left: 5,
});

const PlayerComponent = (props: Props) => {
  const changeName = () => {
    const e = window.prompt("Enter a name: ", props.player.name);
    if (e === null) return;
    if (props.socket) {
      props.socket.send(JSON.stringify({ type: "update_name", name: e }));
      localStorage.setItem("name", e);
    }
  };

  const onKick = () => {
    const { player, n } = props;
    const e = window.confirm(`Are you sure you want to kick ${player.name}?`);
    if (e && props.socket) {
      props.socket.send(JSON.stringify({ type: "kick", id: n }));
    }
  };

  const [tooltipVisible, setTooltipVisible] = React.useState(false);
  const { getArrowProps, getTooltipProps, setTooltipRef, setTriggerRef } =
    usePopperTooltip({
      visible: tooltipVisible,
      onVisibleChange: setTooltipVisible,
      interactive: true,
      trigger: "click",
    });

  const overridePosition = (
    { left, top }: { left: number; top: number },
    currentEvent: any,
    currentTarget: any,

    node: any
  ) => {
    const d = document.documentElement;
    left = Math.min(d.clientWidth - node.clientWidth, left);
    top = Math.min(d.clientHeight - node.clientHeight, top);
    left = Math.max(0, left);
    top = Math.max(0, top);
    return { top, left };
  };

  const { n, player, self_index, turn_index } = props;
  const imageUrl = player.userData?.image_url;

  const turnHighlight = turn_index === n ? " highlight" : "";

  return (
    <>
      {tooltipVisible && (
        <div
          ref={setTooltipRef}
          {...getTooltipProps({ className: "tooltip-container" })}
        >
          <div {...getArrowProps({ className: "tooltip-arrow" })} />
          <TooltipContents {...props} />
        </div>
      )}
      <div
        className={playerRow() + turnHighlight}
        style={{
          zIndex: n,
        }}
      >
        <span className={avatarAndName()}>
          <Avatar
            ref={setTriggerRef}
            disconnected={!player.connected}
            imageUrl={imageUrl}
            n={n}
            crown={player.crowned}
          />
          <span className={playerName()}>{player.name || `User${n + 1}`}</span>
        </span>
        <span className={score()}>{JSON.stringify(player.score)}</span>
        {player.connected || props.isSpectator ? null : (
          <span className={kick()} onClick={onKick}>
            <KickIcon />
          </span>
        )}
      </div>
    </>
  );
};

const TooltipContents: typeof PlayerComponent = (props) => {
  const { n, player } = props;
  const imageUrl = player.userData?.image_url;
  const doubles = player.userData?.stats?.doubles || 0;
  const wins = player.userData?.stats?.wins || 0;
  const games = player.userData?.stats?.games || 0;
  const rolls = player.userData?.stats?.rolls || 0;

  const losses = games - wins;

  const win_rate = Math.floor((wins / (games || 1)) * 1000) / 10;
  const doubles_rate = Math.floor((doubles / (rolls || 1)) * 1000) / 10;

  const join_date = new Date(props.player.userData?.createdDate || 0)
    .toDateString()
    .split(" ");
  join_date.shift();

  return React.useMemo(
    () => (
      <>
        <h1>
          <Avatar imageUrl={imageUrl} size={32} />
          <span>{player.name || `User${n + 1}`}</span>
        </h1>
        <p>Player since {join_date.join(" ")}</p>
        <h2>Stats</h2>
        <p>
          Doubles: {doubles} / {rolls} rolls ({doubles_rate}%)
        </p>
        <p>
          Games: {wins} W / {losses} L ({win_rate}%)
        </p>
        <h2>Achievements</h2>
        <div className="achievements">
          <HorizontalScroll>
            {props.player.userData?.userToAchievements
              .filter((ach) => ach.unlocked)
              .map((ach) => (
                <AchievementImg {...ach} key={ach.achievement.id} />
              ))}
          </HorizontalScroll>
        </div>
      </>
    ),
    []
  );
};

const AchievementImg = (props: Achievement) => {
  const [tooltipVisible, setTooltipVisible] = React.useState(false);
  const { getArrowProps, getTooltipProps, setTooltipRef, setTriggerRef } =
    usePopperTooltip({
      visible: tooltipVisible,
      onVisibleChange: setTooltipVisible,
    });
  return React.useMemo(
    () => (
      <>
        {tooltipVisible && (
          <div
            ref={setTooltipRef}
            {...getTooltipProps({ className: "tooltip-container" })}
          >
            <div {...getArrowProps({ className: "tooltip-arrow" })} />
            <header>{props.achievement.name}</header>
            <p>{props.achievement.description}</p>
          </div>
        )}
        <img
          ref={setTriggerRef}
          width={48}
          height={48}
          alt={props.achievement.description}
          src={props.achievement.image_url || "//via.placeholder.com/48"}
        />
      </>
    ),
    [tooltipVisible, getTooltipProps]
  );
};

const mapStateToProps = (state: ReduxState) => {
  return {
    self_index: selectSelfIndex(state),
    turn_index: selectTurnIndex(state),
    socket: state.connection.socket,
    isSpectator: selectIsSpectator(state),
  };
};

export default connect(mapStateToProps)(PlayerComponent);
