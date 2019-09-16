import React from 'react';
import { RouteComponentProps } from 'react-router-dom';

interface Props {
    route: RouteComponentProps;
}

interface State {
    pressed: boolean;
}
class HomePage extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { pressed: false };
    }
    componentDidMount() {
        if (!document.cookie.includes("_session")) {
            this.props.route.history.replace("/", { redirect: this.props.route.history.location.pathname });
        }
    }
    onStart = async () => {
        this.setState({ pressed: true });
        const result = await window.fetch('/create');
        if(!result.ok) {
        this.setState({ pressed: false });
        }
        else {
            const dest = await result.text();
            this.props.route.history.push(`/room/${dest}`);
        }
    }
    render() {
        if (!document.cookie.includes("_session")) {
            return null;
        }
        return (
            <div>
                <h1>Dice Game</h1>
                <p>the one where you roll some dice</p>
                <button onClick={this.onStart} disabled={this.state.pressed}>Start New Game</button>
            </div>);
    }
}

export default (a: RouteComponentProps) => (<HomePage route={a} />);
