import React from "react";
import { connect } from "react-redux";
import { selectCrownedPlayers } from "../selectors/game_selectors";
import { ReduxState } from "../store";
import PlayerComponent from "./player";
import { GameState } from "../reducers/game";
import { Player } from "../types/store_types";
import { css } from "stitches.config";

interface Props {
  players: GameState["players"];
}

const playerPanel = css({
  borderRadius: 16,
  backgroundColor: "#151515",
  display: "flex",
  flexDirection: "column",
  gap: 6,
  height: "100%",
  width: 276,
  padding: 30,
});

const Players: React.FC<Props> = (props) => {
  return (
    <div className={playerPanel()}>
      {props.players.map((player: Player, i: number) => (
        <PlayerComponent key={`${i}${player.name}`} n={i} player={player} />
      ))}
    </div>
  );
};

const mapStateToProps = (state: ReduxState) => {
  return {
    players: selectCrownedPlayers(state),
  };
};

export default connect(mapStateToProps)(Players);
