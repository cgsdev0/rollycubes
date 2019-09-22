import React from 'react';
import { connect } from 'react-redux';
import { getAddSubButtonClassSelector } from '../../selectors/game_selectors';
import { ReduxState } from '../../store';
import './buttons.css';

interface OwnProps {
    n?: number;
}

interface StateProps {
    socket?: WebSocket;
    addClass: string;
    subClass: string;
}

type Props = OwnProps & StateProps;

class AddSubButton extends React.Component<Props> {

    onClick = (a: string) => {
        const { n, socket } = this.props;
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
        const { addClass, subClass } = this.props;
        return (
        <React.Fragment>
            <button onClick={this.onAdd} className={`Add${addClass}`}>+</button>
            <button onClick={this.onSub} className={`Subtract${subClass}`}>-</button>
        </React.Fragment>
            );
    }
}


const mapStateToProps = (state: ReduxState, ownProps: OwnProps): StateProps => {
    console.warn(ownProps);
    return {
        socket: state.socket,
        addClass: getAddSubButtonClassSelector(typeof ownProps.n === "number" ? ownProps.n + 1 : "add")(state),
        subClass: getAddSubButtonClassSelector(typeof ownProps.n === "number" ? -(ownProps.n + 1) : "sub")(state),
    }
}

export default connect(mapStateToProps)(AddSubButton);