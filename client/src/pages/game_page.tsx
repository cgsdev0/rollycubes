import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import Connection from '../connection';
import Players from '../ui/players';
import GamePanel from '../ui/game_panel';
import '../App.css';

interface TParams {
    room: string;
}
interface Props {
    route: RouteComponentProps<TParams>;
}

class GamePage extends React.Component<Props> {
    componentDidMount() {
        if (!document.cookie.includes("_session")) {
            this.props.route.history.replace("/", { redirect: this.props.route.history.location.pathname })
        }
    }
    render() {
        if (!document.cookie.includes("_session")) {
            return null;
        }
        return (
        <div className="GamePage">
            <Connection room={this.props.route.match.params.room} history={this.props.route.history} />
            <Players />
            <GamePanel />
        </div>
        );
    }
}

export default (a: RouteComponentProps<TParams>) => (<GamePage route={a} />);
