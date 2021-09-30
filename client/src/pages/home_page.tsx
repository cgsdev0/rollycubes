import React from "react";
import { RouteComponentProps } from "react-router-dom";

interface Props {
  route: RouteComponentProps;
}

interface Game {
  lastUpdated: number;
  hostName: string;
  code: string;
  playerCount: number;
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
    if (!document.cookie.includes("_session")) {
      this.props.route.history.replace("/", {
        redirect: this.props.route.history.location.pathname,
      });
    }
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
      const games = allGames
        .filter((game: Game) => game.playerCount)
        .sort((a: Game, b: Game) => {
          if (a.playerCount === b.playerCount) {
            // how should we break ties
            return b.lastUpdated > a.lastUpdated;
          }
          // move full lobbies to the bottom
          if (b.playerCount === 8 && a.playerCount !== 8) {
            return -1;
          }
          // default: sort by player count
          return b.playerCount - a.playerCount;
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
      this.props.route.history.push(`/room/${dest}`);
    }
  };
  render() {
    if (!document.cookie.includes("_session")) {
      return null;
    }
    return (
      <div>
        <h1>Dice Game</h1>
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
            <tr>
              <th className="host">Host</th>
              <th>Players</th>
              <th>Join</th>
              <th>Spectate</th>
            </tr>
            {this.state.games.map((game) => (
              <tr key={game.code}>
                <td className="host">{game.hostName || "unknown"}</td>
                <td>{game.playerCount} / 8</td>
                <td>
                  <a href={`/room/${game.code}`}>Link</a>
                </td>
                <td>
                  <a href={`/spectate/${game.code}`}>Spectate</a>
                </td>
              </tr>
            ))}
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

export default (a: RouteComponentProps) => <HomePage route={a} />;
