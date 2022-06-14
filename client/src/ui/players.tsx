import React from "react";
import { connect } from "react-redux";
import { selectCrownedPlayers } from "../selectors/game_selectors";
import { ReduxState } from "../store";
import PlayerComponent from "./player";
import { GameState } from "../reducers/game";
import { Player } from "../types/store_types";

interface Props {
  players: GameState["players"];
}

const Players: React.FC<Props> = (props) => {
  return (
    <div className="PlayerPanel">
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
