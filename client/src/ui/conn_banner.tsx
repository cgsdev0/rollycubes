import React from "react";
import { Transition } from "react-transition-group";
import { connect, DispatchProp } from "react-redux";
import { ReduxState } from "../store";

interface Props {
  connected: boolean;
}

const ConnBanner: React.FC<Props & DispatchProp> = ({ connected }) => {
  const ref = React.useRef<any>();
  return (
    <Transition
      in={!connected}
      timeout={{ enter: 6000, exit: 0 }}
      nodeRef={ref}
      appear
    >
      {(state) => (
        <div className={`connBannerWrapper connBanner-${state}`} ref={ref}>
          <div className={`connBanner`}>Reconnecting...</div>
        </div>
      )}
    </Transition>
  );
};

const mapStateToProps = (state: ReduxState) => {
  return {
    connected: state.connection.connected,
  };
};

const ConnectedConnBanner = connect(mapStateToProps)(ConnBanner);

export default ConnectedConnBanner;
