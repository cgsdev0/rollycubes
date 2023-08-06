import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { keyframes, css, styled } from 'stitches.config';
import { ReduxState } from 'store';
import { Button } from '../ui/buttons/button';
import OnboardPage from './onboard_page';
import itsBoatsLogo from '/itsboats.png';

interface Game {
  last_updated: number;
  host_name: string;
  code: string;
  player_count: number;
}

type NavFn = ReturnType<typeof useNavigate>;

const scaleUp = keyframes({
  '0%': { height: 0 },
  '100%': { height: 46 },
});
const ButtonRow = styled('div', {
  display: 'flex',
  overflow: 'hidden',
  '& button': {
    textTransform: 'uppercase',
    borderRadius: 100,
    height: 46,
    letterSpacing: '0.16em',
    fontSize: 16,
    fontFamily: 'Amiko',
  },
  '& button:first-child': {
    backgroundColor: '$good',
    color: 'white',
  },
  animation: scaleUp(),
  animationDuration: '0.2s',
});
const StartButton = styled('button', {
  backgroundColor: '$good',
  flexBasis: 'initial',
  color: 'white',
  textTransform: 'uppercase',
  borderRadius: 100,
  height: 56,
  letterSpacing: '0.16em',
  fontSize: 16,
  paddingTop: 2,
  fontFamily: 'Amiko',
  // '&:hover': {
  //   backgroundColor: 'blue',
  // },
  // '&:active': {
  //   backgroundColor: 'red',
  // },
});

const content = css({
  '@bp1': {
    width: 576,
  },
  tr: {
    '@bp0': {
      '& th:last-child,td:last-child': {
        textAlign: 'right',
      },
    },
  },
  display: 'flex',
  flexDirection: 'column',

  '@bp0': {
    overflowY: 'auto',
  },
});

const hostNameCol = css({
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  maxWidth: 210,
});
const playerCountCol = css({
  width: 120,
});
const tableWrapper = css({
  '@bp1': {
    overflowY: 'auto',
  },
  display: 'flex',
});
const gameInfoPanel = css({
  borderRadius: 16,
  backgroundColor: '$gray900',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  '@bp1': {
    gap: 115,
    width: 240,
  },
  padding: 48,
});

const LogoImg = styled('img', {
  '@bp0': {
    display: 'none',
  },
});

const hideMobile = css({
  '@bp0': {
    display: 'none',
  },
});

const hideDesktop = css({
  '@bp1': {
    display: 'none',
  },
});

const HomePage = () => {
  const [pressed, setPressed] = React.useState(false);
  const [hasData, setHasData] = React.useState(false);
  const [games, setGames] = React.useState<Game[]>([]);

  const navigate = useNavigate();

  const updateGameList = (data) => {
    const games = data.rooms
      .filter((game: Game) => game.player_count)
      .sort((a: Game, b: Game) => {
        if (a.player_count === b.player_count) {
          // how should we break ties
          return b.last_updated > a.last_updated;
        }
        // move full lobbies to the bottom
        if (b.player_count === 8 && a.player_count !== 8) {
          return -1;
        }
        // default: sort by player count
        return b.player_count - a.player_count;
      });
    setGames(games);
    setHasData(true);
  };

  const onStart = (priv: boolean) => async () => {
    navigate(`/onboard`);
    if (pressed) return;
    setPressed(true);
    const result = await window.fetch(`/create?public`);
    if (!result.ok) {
      setPressed(false);
    } else {
      const dest = await result.text();
      navigate(`/room/${dest}`, { replace: true });
    }
  };

  React.useEffect(() => {
    let shouldConnect = true;
    let ws = null;

    let conjunctionJunction = () => {
        if (!shouldConnect) {
            return null;
        }

        let portString = '';
        if (window.location.port !== '80') {
          portString = `:${window.location.port}`;
        }

        const innerWs = new WebSocket(
          `${window.location.protocol.endsWith('s:') ? 'wss' : 'ws'}://${
            window.location.hostname
          }${portString}/ws/list`);

        innerWs.onopen = (e) => {
          console.log("ws open");
        };

        innerWs.onmessage = (e) => {
            console.log("ws message");
            try {
                const list = JSON.parse(e.data);
                updateGameList(list);
            } catch (e) {
                console.error(e);
            }
        };

        innerWs.onclose = (e) => {
          console.log(`on close - ${(!shouldConnect) ? "not " : " "}reconnecting`);
          if (shouldConnect) {
            ws = conjunctionJunction();
          }
        };

        return innerWs;
    };

    ws = conjunctionJunction();

    return () => {
        shouldConnect = false;
        ws.close();
    };
  }, []);

  const dispatch = useDispatch();

  const setShowLogin = React.useCallback(
    (show: boolean) => {
      dispatch({ type: 'SET_SHOW_LOGIN', show });
    },
    [dispatch]
  );
  const showLogin = useSelector(
    (state: ReduxState) => state.settings.showLogin
  );

  if (showLogin) {
    return <OnboardPage onBoard={() => setShowLogin(false)} />;
  }
  return (
    <>
      <div className={content()}>
        <h1>Rolly Cubes</h1>
        {games.length ? (
          <div className={tableWrapper()}>
            <table className="lobby-table">
              <tbody>
                <tr>
                  <th className="host">Host</th>
                  <th className={hideMobile()} colSpan={3}>
                    Players
                  </th>
                  <th className={hideDesktop()}>Players</th>
                </tr>
                {games.map((game) => (
                  <TableRow game={game} key={game.code} navigate={navigate} />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>{!hasData ? 'Loading...' : 'No public lobbies found'}</p>
        )}
      </div>
      <div className={gameInfoPanel()}>
        <LogoImg src={itsBoatsLogo} />
        <StartButton onClick={onStart(false)} disabled={pressed}>
          New Game
        </StartButton>
      </div>
    </>
  );
};

const TableRow = ({ game, navigate }: { game: Game; navigate: NavFn }) => {
  const [expanded, setExpanded] = React.useState(false);
  return (
    <>
      <tr
        className={hideDesktop()}
        onClick={() => {
          setExpanded((e) => !e);
        }}
      >
        <td className={hostNameCol()}>{game.host_name || 'unknown'}</td>
        <td className={playerCountCol()}>{game.player_count} / 8</td>
      </tr>
      {expanded ? (
        <tr>
          <td colSpan={2}>
            <ButtonRow>
              <Button onClick={() => navigate(`/room/${game.code}`)}>
                Join
              </Button>
              <Button onClick={() => navigate(`/spectate/${game.code}`)}>
                Watch
              </Button>
            </ButtonRow>
          </td>
        </tr>
      ) : null}
      <tr className={hideMobile()}>
        <td className={hostNameCol()}>{game.host_name || 'unknown'}</td>
        <td className={playerCountCol()}>{game.player_count} / 8</td>
        <td>
          <Link to={`/room/${game.code}`}>Join →</Link>
        </td>
        <td>
          <Link to={`/spectate/${game.code}`}>Watch →</Link>
        </td>
      </tr>
    </>
  );
};
export default HomePage;
