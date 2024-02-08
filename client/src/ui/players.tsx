import React from 'react';
import { connect, useSelector } from 'react-redux';
import { selectPlayers } from '../selectors/game_selectors';
import { ReduxState } from '../store';
import PlayerComponent from './player';
import { GameState } from '../reducers/game';
import { Player } from '../types/api';
import { css, styled } from 'stitches.config';
import { useLocation, useNavigate } from 'react-router';

interface Props {
  players: GameState['players'];
}

const playerPanel = css({
  borderRadius: 16,
  backgroundColor: '$gray900',
  display: 'flex',
  flexDirection: 'column',
  '@bp0': {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  gap: 2,
  height: '100%',
  '@bp1': {
    boxShadow: '$cutoutTop, $cutoutBottom, $cutoutBorder',
    width: 336,
    overflow: 'hidden',
  },
  paddingTop: 22,
  paddingBottom: 30,
});

const Join = styled('a', {
  paddingLeft: 44,
  marginTop: 16,
  fontFamily: 'Amiko',
  textTransform: 'none',
  fontSize: 20,
  letterSpacing: 'initial',
  cursor: 'pointer',
  color: '$gray500',
  '&:hover': {
    paddingLeft: 44,
    marginTop: 16,
    fontFamily: 'Amiko',
    textTransform: 'none',
    fontSize: 20,
    letterSpacing: 'initial',
    textDecoration: 'underline',
    cursor: 'pointer',
  },
});
const Players: React.FC<Props> = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const socket = useSelector((state: ReduxState) => state.connection.socket);
  const spectating = useSelector(
    (state: ReduxState) => state.game.self_index === undefined
  );
  return (
    <div className={playerPanel()}>
      {props.players.map((player: Player, i: number) => (
        <PlayerComponent key={`${i}${player.name}`} n={i} player={player} />
      ))}
      {spectating && props.players.length < 8 ? (
        <Join
          onClick={() => {
            navigate(location.pathname.replace('spectate/', 'room/'), {
              replace: true,
            });
            // if (socket) {
            //   socket.close();
            // }
          }}
        >
          Join the game &rarr;
        </Join>
      ) : null}
    </div>
  );
};

const mapStateToProps = (state: ReduxState) => {
  return {
    players: selectPlayers(state),
  };
};

export default connect(mapStateToProps)(Players);
