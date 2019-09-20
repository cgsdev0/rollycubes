import React from 'react';
import { RouteComponentProps } from 'react-router-dom';

interface TParams {
    room: string;
}
interface Props {
    route: RouteComponentProps<TParams>;
}

const waitFor = (delay: number) => new Promise(resolve => setTimeout(resolve, delay));


class CookiePage extends React.Component<Props> {
    redirect = () => {
        const state = this.props.route.history.location.state;
        if(state && state.redirect) {
            this.props.route.history.replace(state.redirect);
        }
        else {
            this.props.route.history.replace("/home");
        }
    }
    async componentDidMount() {
        if(document.cookie.includes("_session")) {
            this.redirect();
        }
        else {
            let result = await window.fetch("/cookie");
            while(!result || !result.ok) {
                await waitFor(1000);
                result = await window.fetch("/cookie");
            }
            this.redirect();
        }
    }
    render() {
        return null;
    }
}

export default (a: RouteComponentProps<TParams>) => (<CookiePage route={a} />);
