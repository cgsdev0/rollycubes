import jwt_decode from 'jwt-decode';
import React from 'react';
import { Store } from 'redux';
import { NavigateFunction } from 'react-router-dom';
import { ReduxState } from './store';
import { Location } from 'react-router-dom';
import { endpoints, optimisticUpdates } from 'api/auth';
import { connect } from 'react-redux';
import { selectCurrentDiceType } from 'selectors/game_selectors';

interface Props {
  room: string;
  mode: string;
  navigate: NavigateFunction;
  location: Location;
  authToken?: string | null;
}

export interface DecodedUserJWT {
  display_name: string;
  exp: number;
  iat: number;
  user_id: string;
}

class Connection extends React.Component<Props & { store: Store<ReduxState> }> {
  websocket?: WebSocket;
  timer?: any;

  onClose = (_: CloseEvent) => {
    console.error('Socket closed, reconnecting...');
    this.props.store.dispatch({ type: 'socket_close' });
    this.timer = setTimeout(this.openSocket, 5000);
  };

  onOpen = (_: Event) => {
    // toast(
    // Achievement({
    // description: "hey there's some text about the achievement",
    // name: "Getting Started",
    // image_url: "https://via.placeholder.com/64/0000FF/808080",
    // achievement_id: "fake_test"
    // })
    // );
    console.log('Socket opened to room', this.props.room);
    this.props.store.dispatch({ type: 'socket_open' });
    const name = localStorage.getItem('name');
    if (this.websocket && this.props.authToken && this.props.mode === 'room') {
      // test
      this.websocket.send(
        JSON.stringify({
          type: 'authenticate',
          access_token: this.props.authToken,
        })
      );
    } else if (this.websocket && name) {
      this.websocket.send(JSON.stringify({ type: 'update_name', name }));
    }
    //this.websocket!.send(JSON.stringify({ type: "roll", n: 0, msg: "Hello world!" }))
  };

  onMessage = (e: MessageEvent) => {
    if (e.data === 'cookie') {
      this.props.navigate('/', { replace: true });
      if (this.websocket) this.websocket.close();
      return;
    }
    const data: any = JSON.parse(e.data);
    if (!data) {
      console.error('empty action from server');
    } else if ('error' in data) {
      if (data.error === 'already connected') {
        if (this.websocket) this.websocket.close();
        this.props.navigate(`/multiple-tabs`, { replace: true });
      }
      console.error(data || data.error);
    } else if (data.type === 'redirect') {
      const pathParts = this.props.location.pathname.split('/');
      this.props.navigate(`/${pathParts[1]}/${data.room}`, { replace: true });
    } else if (data.type === 'refetch_player') {
      this.props.store.dispatch(
        endpoints.getUserById.initiate(data.user_id, {
          forceRefetch: true,
        }) as any
      );
    } else {
      if (data.type === 'roll') {
        document.dispatchEvent(
          new CustomEvent<any>('roll', {
            detail: {
              rolls: data.rolls,
              turn_index: this.props.store.getState().game.turn_index,
              dice_type: selectCurrentDiceType(this.props.store.getState()),
            },
          })
        );
      }
      this.props.store.dispatch(data);
      optimisticUpdates(data, this.props.store);
    }
  };

  onError = (e: any) => {
    console.error('oh god why', e);
  };
  openSocket = () => {
    if (
      !this.websocket ||
      this.websocket.readyState === WebSocket.CLOSED ||
      this.websocket.readyState === WebSocket.CLOSING
    ) {
      let portString = '';
      if (window.location.port !== '80') {
        portString = `:${window.location.port}`;
      }
      let userIdStr = '';
      if (this.props.authToken && this.props.mode === 'room') {
        const decoded: DecodedUserJWT = jwt_decode(this.props.authToken);
        userIdStr = '?userId=' + decoded.user_id;
      }
      this.websocket = new WebSocket(
        `${window.location.protocol.endsWith('s:') ? 'wss' : 'ws'}://${
          window.location.hostname
        }${portString}/ws/${this.props.mode}/${this.props.room}${userIdStr}`
      );
      this.websocket.addEventListener('close', this.onClose);
      this.websocket.addEventListener('open', this.onOpen);
      this.websocket.addEventListener('message', this.onMessage);
      this.websocket.addEventListener('error', this.onError);
      this.props.store.dispatch({ type: 'WEBSOCKET', socket: this.websocket });
    }
  };

  componentDidMount() {
    this.openSocket();
  }

  componentDidUpdate(prev: Props) {
    if (prev.room !== this.props.room) {
      if (this.websocket) {
        this.websocket.close();
      }
      this.openSocket();
    }
  }

  componentWillUnmount() {
    this.props.store.dispatch({ type: 'WEBSOCKET', socket: undefined });
    if (this.websocket) {
      if (this.timer) {
        clearTimeout(this.timer);
      }
      this.websocket.removeEventListener('close', this.onClose);
      this.websocket.removeEventListener('open', this.onOpen);
      this.websocket.removeEventListener('message', this.onMessage);
      this.websocket.close();
    }
  }

  render() {
    return null;
  }
}

const mapStateToProps = (state: ReduxState) => {
  return {
    authToken: state.auth.authToken,
  };
};
export default connect(mapStateToProps)(Connection);
