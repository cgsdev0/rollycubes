import React from 'react';
import { connect, useSelector } from 'react-redux';
import { styled } from 'stitches.config';
import {
  selectCurrentSkipCount,
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
  textWrap: 'nowrap',
});

const SubtitleName = styled('span', {
  color: '$primaryDimmed',
  textWrap: 'nowrap',
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
  const roll_count = useSelector(
    (state: ReduxState) => state.popText.rollCount
  );
  const skip_count = useSelector(selectCurrentSkipCount);
  const turn_index = useSelector((state: ReduxState) => state.game.turn_index);
  React.useLayoutEffect(() => {
    setCanSkip(false);
    const interval = setTimeout(() => setCanSkip(true), 20 * 1000);
    return () => {
      clearInterval(interval);
      setCanSkip(false);
    };
  }, [roll_count, setCanSkip, turn_index]);
  const connected = useSelector(
    (state: ReduxState) =>
      state.game.players.at(state.game.turn_index)?.connected
  );

  const on = (type: 'skip' | 'kick') => () => {
    if (socket) {
      socket.send(JSON.stringify({ type, id: turn_index }));
    }
  };
  if (victory) return null;
  if (!hasEnoughPlayers) return <Subtitle>Waiting for players...</Subtitle>;
  if (!myTurn) {
    if (!connected || canSkip) {
      if (skip_count >= 4) {
        return (
          <Button className={'Reset'} onClick={on('kick')}>
            Kick
          </Button>
        );
      } else {
        return (
          <Button className={'Reset'} onClick={on('skip')}>
            Skip
          </Button>
        );
      }
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
