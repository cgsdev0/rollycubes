import React from "react";
import HorizontalScroll from "react-horizontal-scrolling";
import { connect } from "react-redux";
import ReactTooltip from "react-tooltip";
import "../App.css";
import { selectSelfIndex, selectTurnIndex } from "../selectors/game_selectors";
import { Player, ReduxState } from "../store";
import { ThemeContext } from "../themes";
import Avatar from "./avatar";

interface Props {
  player: Player;
  n: number;
  self_index?: number;
  turn_index: number;
  socket?: WebSocket;
}

const PlayerComponent = (props: Props) => {
  console.log(props.player);
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

  const overridePosition = (
    { left, top },
    currentEvent,
    currentTarget,
    node
  ) => {
    const d = document.documentElement;
    left = Math.min(d.clientWidth - node.clientWidth, left);
    top = Math.min(d.clientHeight - node.clientHeight, top);
    left = Math.max(0, left);
    top = Math.max(0, top);
    return { top, left };
  };

  const { n, player, self_index, turn_index } = props;
  const theme = React.useContext(ThemeContext);
  const imageUrl = player.userData?.image_url;
  const firstInitial = player.name ? player.name[0] : "U";
  const showAvatar = Boolean(player.user_id);

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

  return (
    <>
      <ReactTooltip
        className="player-tooltip"
        id={`player-${n}`}
        effect="solid"
        place="bottom"
        overridePosition={overridePosition}
        backgroundColor="#777"
        globalEventOff="click"
        isCapture={true}
        afterShow={e => {
          e.stopPropagation();
        }}
      >
        <h1>
          <Avatar imageUrl={imageUrl} firstInitial={firstInitial} size={32} />
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
        <div>
          {props.player.userData?.userToAchievements.map(ach => (
            <ReactTooltip
              id={`achievement-${n}-${ach.achievement.id}`}
              key={ach.achievement.id}
            >
              <h1>{ach.achievement.name}</h1>
              <p>{ach.achievement.description}</p>
            </ReactTooltip>
          ))}
        </div>
        <HorizontalScroll className="achievements-scroll">
          <div className="achievements">
            {props.player.userData?.userToAchievements
              .filter(ach => ach.unlocked)
              .map(ach => (
                <img
                  data-tip
                  data-for={`achievement-${n}-${ach.achievement.id}`}
                  key={ach.achievement.id}
                  alt={ach.achievement.description}
                  src={ach.achievement.image_url || "//via.placeholder.com/48"}
                />
              ))}
          </div>
        </HorizontalScroll>
      </ReactTooltip>
      <div
        className={`Player${!player.connected ? " Disconnected" : ""}`}
        style={turn_index === n ? theme.turnHighlight : undefined}
        onClick={
          self_index === n ? changeName : player.connected ? undefined : onKick
        }
      >
        <div className={`${player.crowned ? "Crown " : ""}Name`}>
          {showAvatar ? (
            <Avatar imageUrl={imageUrl} firstInitial={firstInitial} n={n} />
          ) : null}
          {player.name || `User${n + 1}`}
          <div className="You">{self_index === n ? " (You)" : null}</div>
        </div>
        <div className="Score">{JSON.stringify(player.score)}</div>
      </div>
    </>
  );
};

const mapStateToProps = (state: ReduxState) => {
  return {
    self_index: selectSelfIndex(state),
    turn_index: selectTurnIndex(state),
    socket: state.socket
  };
};

export default connect(mapStateToProps)(PlayerComponent);
