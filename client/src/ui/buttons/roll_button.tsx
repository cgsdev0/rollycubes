import React from 'react';
import { connect } from 'react-redux';
import { ReduxState } from '../../store';

interface Props {
    socket?: WebSocket;
}

class RollButton extends React.Component<Props> {

    onClick = () => {
        if(this.props.socket) {
            this.props.socket.send(JSON.stringify({type: "roll"}));
        }
    }
    render() {
        return (<button onClick={this.onClick}>Roll</button>);
    }
}


const mapStateToProps = (state: ReduxState) => {
    return {
        socket: state.socket,
    }
}

export default connect(mapStateToProps)(RollButton);