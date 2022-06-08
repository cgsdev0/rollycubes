import React from "react";
import { connect, DispatchProp } from "react-redux";
import { ReduxState } from "../store";

interface Props {
  connected: boolean;
}

const ConnBanner: React.FC<Props & DispatchProp> = ({ connected }) => {
  const banner_timer = React.useRef<any>(null);
  const [showBanner, setShowBanner] = React.useState(false);
  React.useEffect(() => {
    if (!connected) {
      banner_timer.current = setTimeout(() => {
        setShowBanner(true);
      }, 6000);
    } else {
      clearTimeout(banner_timer.current);
      setShowBanner(false);
    }
  }, [connected]);
  return (
    <div className={`connBannerWrapper${showBanner ? " connBannerOpen" : ""}`}>
      <div className={`connBanner${showBanner ? "" : " connBannerHidden"}`}>
        Reconnecting...
      </div>
    </div>
  );
};

const mapStateToProps = (state: ReduxState) => {
  return {
    connected: state.connection.connected,
  };
};

const ConnectedConnBanner = connect(mapStateToProps)(ConnBanner);

export default ConnectedConnBanner;
