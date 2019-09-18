import React from 'react';
import { connect } from 'react-redux';
import { ReduxState } from '../../store';

interface Props {
    socket?: WebSocket;
    n?: number;
}

class AddSubButton extends React.Component<Props> {

    onClick = (a: string) => {
        const { n, socket } = this.props;
        console.log("n = ", n);
        if(socket) {
            if(n === undefined) {
                socket.send(JSON.stringify({ type: a }));
            }
            else {
                socket.send(JSON.stringify({ type: `${a}_nth`, n }))
            }
        }
    }
    onAdd = () => {
        this.onClick("add");
    }
    onSub = () => {
        this.onClick("sub");
    }

    render() {
        return (
        <React.Fragment>
            <button onClick={this.onAdd}>+</button>
            <button onClick={this.onSub}>-</button>
        </React.Fragment>
            );
    }
}


const mapStateToProps = (state: ReduxState) => {
    return {
        socket: state.socket,
    }
}

export default connect(mapStateToProps)(AddSubButton);