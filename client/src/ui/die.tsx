import React from 'react';
import { DieRoll, ReduxState } from '../store';
import { connect } from 'react-redux';
import { selectShouldShowSplitButtons } from '../selectors/game_selectors';
import AddSubButton from './buttons/add_sub_button';

interface Props {
    roll: DieRoll;
    n: number;
    buttons: boolean;
}
class Die extends React.Component<Props> {
    render() {
        const { roll, buttons, n } = this.props;
        return (<div>{roll.value} | {JSON.stringify(roll.used)} | {buttons && !roll.used ? <AddSubButton n={n} /> : null}</div>);
    }
}

const mapStateToProps = (state: ReduxState) => {
    return {
        buttons: selectShouldShowSplitButtons(state),
    }
}

export default connect(mapStateToProps)(Die);