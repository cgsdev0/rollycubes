import React from 'react';
import { Transition } from 'react-transition-group';
import { connect, DispatchProp } from 'react-redux';
import { ReduxState } from '../store';
import { css, styled } from 'stitches.config';

interface Props {
  connected: boolean;
}

// TODO: use a blowtorch to burn all of this garbage CSS
const Wrapper = styled('div', {
  backgroundColor: '#e44c4d',
  '@bp1': {
    position: 'absolute',
    width: 'calc(100% - 46px)',
    left: 0,
    top: 24,
    marginLeft: 23,
    overflow: 'hidden',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  paddingTop: 4,
  '& div': {
    textAlign: 'center',
  },
  '@bp0': {
    position: 'relative',
    marginLeft: -20,
    marginRight: -20,
  },
});

const show = css({
  transition: 'height 500ms ease-out',
  height: 30,
});

const exiting = css({
  opacity: 0,
  height: 30,
  transition: 'opacity 250ms linear',
});

const hide = css({
  opacity: 0,
  height: 0,
  transition: 'opacity 250ms linear',
});

const ConnBannerC: React.FC<Props & DispatchProp> = ({ connected }) => {
  return (
    <Transition in={!connected} timeout={{ enter: 6000, exit: 250 }} appear>
      {(state) => (
        (
          <Wrapper
            className={
              state === 'entered'
                ? show()
                : state === 'exiting'
                ? exiting()
                : hide()
            }
          >
            <div>Reconnecting...</div>
          </Wrapper>
        )
      )}
    </Transition>
  );
};

const mapStateToProps = (state: ReduxState) => {
  return {
    connected: state.connection.connected,
  };
};

const ConnectedConnBanner = connect(mapStateToProps)(ConnBannerC);

export const ConnBanner = ConnectedConnBanner;
