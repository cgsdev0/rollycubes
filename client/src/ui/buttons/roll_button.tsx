import React from "react";
import { connect } from "react-redux";
import { styled } from "stitches.config";
import {
  selectHasMultiplePlayers,
  selectIsMyTurn,
  selectTurnName,
} from "../../selectors/game_selectors";
import { ReduxState } from "../../store";
import "./buttons.css";

type Props = ReturnType<typeof mapStateToProps>;

const Subtitle = styled("p", {
  color: "$primaryDimmed",
  textAlign: "center",
  paddingTop: 12,
  fontSize: 16,
  width: "100%",
  display: "flex",
  justifyContent: "center",
});

const SubtitleName = styled("div", {
  overflow: "hidden",
  maxWidth: 160,
  textOverflow: "ellipsis",
});

const RollButton: React.FC<Props> = ({
  socket,
  hasEnoughPlayers,
  myTurn,
  turnName,
}) => {
  const onClick = () => {
    if (socket) {
      socket.send(JSON.stringify({ type: "roll" }));
    }
  };
  if (!hasEnoughPlayers) return <Subtitle>Waiting for players...</Subtitle>;
  if (!myTurn)
    return (
      <Subtitle>
        <SubtitleName>{turnName}</SubtitleName>'s turn
      </Subtitle>
    );
  return <button onClick={onClick}>Roll</button>;
};

const mapStateToProps = (state: ReduxState) => {
  return {
    socket: state.connection.socket,
    hasEnoughPlayers: selectHasMultiplePlayers(state),
    myTurn: selectIsMyTurn(state),
    turnName: selectTurnName(state),
  };
};

export default connect(mapStateToProps)(RollButton);
