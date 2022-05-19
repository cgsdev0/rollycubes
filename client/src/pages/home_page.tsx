import React from "react";
import { Link, RouteComponentProps } from "react-router-dom";

type Props = RouteComponentProps;

interface Game {
  last_updated: number;
  host_name: string;
  code: string;
  player_count: number;
}
interface State {
  pressed: boolean;
  games: Game[];
  hasData: boolean;
}
class HomePage extends React.Component<Props, State> {
  amIMounted: boolean = false;
  constructor(props: Props) {
    super(props);
    this.state = { pressed: false, games: [], hasData: false };
  }
  componentDidMount() {
    this.fetchGameList();
    this.amIMounted = true;
  }
  componentWillUnmount() {
    this.amIMounted = false;
  }
  fetchGameList = async () => {
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
      this.setState({ games, hasData: true });
    } finally {
      if (this.amIMounted) {
        setTimeout(this.fetchGameList, 2000);
      }
    }
  };
  onStart = (priv: boolean) => async () => {
    this.setState({ pressed: true });
    const result = await window.fetch(`/create${priv ? "" : "?public"}`);
    if (!result.ok) {
      this.setState({ pressed: false });
    } else {
      const dest = await result.text();
      this.props.history.push(`/room/${dest}`);
    }
  };
  render() {
    return (
      <div>
        <h1>Rolly Cubes HAI</h1>
        <p>the one where you roll some dice</p>
        <button onClick={this.onStart(false)} disabled={this.state.pressed}>
          New Public Game
        </button>
        <button onClick={this.onStart(true)} disabled={this.state.pressed}>
          New Private Game
        </button>
        <h2>Public Lobbies</h2>
        {this.state.games.length ? (
          <table className="lobby-table">
            <tbody>
              <tr>
                <th className="host">Host</th>
                <th>Players</th>
                <th>Join</th>
                <th>Spectate</th>
              </tr>
              {this.state.games.map((game) => (
                <tr key={game.code}>
                  <td className="host">{game.host_name || "unknown"}</td>
                  <td>{game.player_count} / 8</td>
                  <td>
                    <Link to={`/room/${game.code}`}>Link</Link>
                  </td>
                  <td>
                    <Link to={`/spectate/${game.code}`}>Spectate</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>
            {!this.state.hasData ? "Loading..." : "No public lobbies found"}
          </p>
        )}
      </div>
    );
  }
}

export default HomePage;
