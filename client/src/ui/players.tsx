import React from "react";
import { connect } from "react-redux";
import { selectCrownedPlayers } from "../selectors/game_selectors";
import { Player, ReduxState } from "../store";
import PlayerComponent from "./player";
import "../App.css";

interface Props {
  players: ReduxState["players"];
}

const Players: React.FC<Props> = props => {
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
    players: selectCrownedPlayers(state)
  };
};

export default connect(mapStateToProps)(Players);
