import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { css } from "stitches.config";
import { Button } from "../ui/buttons/button";

interface Game {
  last_updated: number;
  host_name: string;
  code: string;
  player_count: number;
}

const content = css({
  width: 576,
  display: "flex",
  flexDirection: "column",
});

const hostNameCol = css({
  textOverflow: "ellipsis",
  overflow: "hidden",
  maxWidth: 210,
});
const playerCountCol = css({
  width: 120,
});
const tableWrapper = css({
  overflowY: "auto",
  display: "flex",
});
const gameInfoPanel = css({
  borderRadius: 16,
  backgroundColor: "#151515",
  display: "flex",
  flexDirection: "column",
  width: 240,
  padding: 48,
});

const HomePage = () => {
  const [pressed, setPressed] = React.useState(false);
  const [hasData, setHasData] = React.useState(false);
  const [games, setGames] = React.useState<Game[]>([]);

  const navigate = useNavigate();

  const fetchGameList = async () => {
    try {
      const data = await window.fetch("/list");
      const allGames = await data.json();
      const games = allGames.rooms
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
    } catch (e) {
      console.error(e);
    }
  };
  const onStart = (priv: boolean) => async () => {
    navigate(`/onboard`);
  };

  React.useEffect(() => {
    const interval = setInterval(fetchGameList, 2000);
    fetchGameList();
    return () => clearInterval(interval);
  }, []);

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
                  <th colSpan={3}>Players</th>
                </tr>
                {games.map((game) => (
                  <tr key={game.code}>
                    <td className={hostNameCol()}>
                      {game.host_name || "unknown"}
                    </td>
                    <td className={playerCountCol()}>
                      {game.player_count} / 8
                    </td>
                    <td>
                      <Link to={`/room/${game.code}`}>Join →</Link>
                    </td>
                    <td>
                      <Link to={`/spectate/${game.code}`}>Watch →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>{!hasData ? "Loading..." : "No public lobbies found"}</p>
        )}
      </div>
      <div className={gameInfoPanel()}>
        <Button onClick={onStart(false)} disabled={pressed}>
          Start Game
        </Button>
      </div>
    </>
  );
};

export default HomePage;
