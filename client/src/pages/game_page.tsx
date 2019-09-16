import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import Connection from '../connection';
import Dice from '../ui/dice';
import GamePanel from '../ui/game_panel';


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
        <React.Fragment>
            <Connection room={this.props.route.match.params.room} history={this.props.route.history} />
            <Dice />
            <GamePanel />
        </React.Fragment>
        );
    }
}

export default (a: RouteComponentProps<TParams>) => (<GamePage route={a} />);
