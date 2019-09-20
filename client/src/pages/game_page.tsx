import React, { FormEvent } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import Connection from '../connection';
import Players from '../ui/players';
import GamePanel from '../ui/game_panel';
import '../App.css';
import { connect } from 'react-redux';
import { ReduxState } from '../store';

interface TParams {
    room: string;
}
interface Props {
    route: RouteComponentProps<TParams>;
    socket?: WebSocket;
    chat: string[];
}

class GamePage extends React.Component<Props> {
    inputRef: React.RefObject<HTMLInputElement>;
    constructor(props: Props) {
        super(props);
        this.inputRef = React.createRef();
    }
    componentDidMount() {
        if (!document.cookie.includes("_session")) {
            this.props.route.history.replace("/", { redirect: this.props.route.history.location.pathname })
        }
    }

    sendChat = (e: FormEvent) => {
        if (this.props.socket) {
            if (this.inputRef.current && this.inputRef.current.value) {
                this.props.socket.send(JSON.stringify({ type: "chat", msg: this.inputRef.current.value }));
                this.inputRef.current.value = "";
            }
        }
        e.preventDefault();
    }

    render() {
        const { route } = this.props;
        const { location } = route;
        const { hash } = location;

        const rulesSel = !hash || hash === "#rules";
        const chatSel = hash === "#chat";
        const minimized = !rulesSel && !chatSel;

        if (!document.cookie.includes("_session")) {
            return null;
        }
        return (
            <div className="GamePage">
                <Connection room={this.props.route.match.params.room} history={this.props.route.history} />
                <div id="PlayerChatWrapper">
                    <Players />
                    <ul className="TabHeader">
                        <a className={rulesSel ? "selected" : ""} href="#rules"><li>Rules</li></a>
                        <a className={chatSel ? "selected" : ""} href="#chat"><li>Chat</li></a>
                        <a className={minimized ? "selected" : ""} href="#minimized"><li>Minimize</li></a>
                    </ul>
                    <div className={`TabContainer Rules ${hash && hash !== "#rules" ? " HideMobile" : ""}`}>
                        <h2 className="HideMobile">Rules</h2>
                        <p>Each roll, you may add or subtract the total value shown on the dice from your score.</p>
                        <p>Winning Scores:</p>
                        <ul>
                            <li>33</li>
                            <li>66, 67</li>
                            <li>98, 99, 100</li>
                        </ul>
                        <p>Additional Rules:</p>
                        <ul>
                            <li>If you roll doubles, you <strong>must</strong> roll again.</li>
                            <li>If you match a player's score, they are <strong>reset</strong> to 0.</li>
                            <li>If you roll a seven, you may <strong>split</strong> the dice into 2 rolls.</li>
                        </ul>
                    </div>
                    <div className={`TabContainer Chat ${hash !== "#chat" ? " HideMobile" : ""}`}>
                        <form onSubmit={this.sendChat}>
                            <input ref={this.inputRef} maxLength={400} placeholder="Type a message..."></input>
                            <button type="submit">Send</button>
                        </form>
                        <div className="Messages">
                            {this.props.chat.map((msg, i) => <p key={i}>{msg}</p>)}
                        </div>
                    </div>
                </div>
                <GamePanel />
            </div>
        );
    }
}

const mapStateToProps = (state: ReduxState) => {
    return {
        socket: state.socket,
        chat: state.chat,
    }
}

const ConnectedGamePage = connect(mapStateToProps)(GamePage);

export default (a: RouteComponentProps<TParams>) => (<ConnectedGamePage route={a} />);
