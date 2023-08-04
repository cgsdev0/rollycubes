import React from 'react';
import { connect, useSelector } from 'react-redux';
import { styled } from 'stitches.config';
import {
  selectHasMultiplePlayers,
  selectIsGameOver,
  selectIsMyTurn,
  selectTurnName,
} from '../../selectors/game_selectors';
import { ReduxState } from '../../store';
import { Button } from './button';

type Props = ReturnType<typeof mapStateToProps>;

const Subtitle = styled('p', {
  color: '$primaryDimmed',
  textAlign: 'center',
  paddingTop: 12,
  fontSize: 16,
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
});

const SubtitleName = styled('span', {
  color: '$primaryDimmed',
  overflow: 'hidden',
  maxWidth: 160,
  textOverflow: 'ellipsis',
});

const RollButton: React.FC<Props> = ({
  socket,
  hasEnoughPlayers,
  myTurn,
  turnName,
  victory,
}) => {
  const onClick = () => {
    if (socket) {
      socket.send(JSON.stringify({ type: 'roll' }));
    }
  };

  const [canSkip, setCanSkip] = React.useState(false);
  const turn_index = useSelector((state: ReduxState) => state.game.turn_index);
  React.useLayoutEffect(() => {
    setCanSkip(false);
    const interval = setTimeout(() => setCanSkip(true), 15 * 1000);
    return () => {
      clearInterval(interval);
      setCanSkip(false);
    };
  }, [turn_index, setCanSkip]);
  const connected = useSelector(
    (state: ReduxState) =>
      state.game.players.at(state.game.turn_index)?.connected
  );

  const onSkip = () => {
    if (socket) {
      socket.send(JSON.stringify({ type: 'skip', id: turn_index }));
    }
  };
  if (victory) return null;
  if (!hasEnoughPlayers) return <Subtitle>Waiting for players...</Subtitle>;
  if (!myTurn) {
    if (!connected || canSkip) {
      return (
        <button className={'Reset'} onClick={onSkip}>
          Skip
        </button>
      );
    }
    return (
      <Subtitle>
        <SubtitleName>{turnName}</SubtitleName>'s turn
      </Subtitle>
    );
  }
  return <Button onClick={onClick}>Roll</Button>;
};

const mapStateToProps = (state: ReduxState) => {
  return {
    socket: state.connection.socket,
    hasEnoughPlayers: selectHasMultiplePlayers(state),
    myTurn: selectIsMyTurn(state),
    turnName: selectTurnName(state),
    victory: selectIsGameOver(state),
  };
};

export default connect(mapStateToProps)(RollButton);
