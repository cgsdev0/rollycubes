import React from 'react';
import { connect } from 'react-redux';
import { ReduxState } from '../../store';
import './buttons.css';

interface Props {
    socket?: WebSocket;
}

class RollButton extends React.Component<Props> {

    onClick = () => {
        if(this.props.socket) {
            this.props.socket.send(JSON.stringify({type: "restart"}));
        }
    }
    render() {
        return (<button className="topButton" onClick={this.onClick}>New Game</button>);
    }
}


const mapStateToProps = (state: ReduxState) => {
    return {
        socket: state.socket,
    }
}

export default connect(mapStateToProps)(RollButton);