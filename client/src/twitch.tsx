import React from 'react';
import { css, styled } from 'stitches.config';
import { connect } from 'react-redux';
import { selectAuthService } from './selectors/game_selectors';
import { ReduxState } from './store';
import { Button } from 'ui/buttons/button';

function dec2hex(dec: number) {
  return dec.toString(16).padStart(2, '0');
}

// generateId :: Integer -> String
function generateId(len?: number) {
  var arr = new Uint8Array((len || 40) / 2);
  window.crypto.getRandomValues(arr);
  return Array.from(arr, dec2hex).join('');
}

export const twitchLogin = (intent?: string) => () => {
  if (!intent) {
    localStorage.removeItem('intent');
  } else {
    localStorage.setItem('intent', intent);
  }
  const state = generateId();
  localStorage.setItem('oauth_state', state);
  console.log(localStorage.getItem('oauth_state'));
  const redirect = `${document.location.origin}/twitch_oauth`;
  const TWITCH_CLIENT_ID = '6n8p1p8sg3shbg0mwcfrmgzrwmcwh1';
  document.location =
    `https://id.twitch.tv/oauth2/authorize` +
    `?client_id=${TWITCH_CLIENT_ID}` +
    `&redirect_uri=${redirect}` +
    `&state=${state}` +
    `&response_type=code`;
};

const weird = css({
  position: 'absolute',
  width: '100%',
  top: -80,
  left: 5,
  '& g path': {
    fill: '#9146FF',
  },
});
const TwitchIcon = () => {
  return (
    <svg
      width="64px"
      height="64px"
      viewBox="0 0 256 268"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid"
      className={weird()}
    >
      <g>
        <path d="M17.4579119,0 L0,46.5559188 L0,232.757287 L63.9826001,232.757287 L63.9826001,267.690956 L98.9144853,267.690956 L133.811571,232.757287 L186.171922,232.757287 L256,162.954193 L256,0 L17.4579119,0 Z M40.7166868,23.2632364 L232.73141,23.2632364 L232.73141,151.29179 L191.992415,192.033461 L128,192.033461 L93.11273,226.918947 L93.11273,192.033461 L40.7166868,192.033461 L40.7166868,23.2632364 Z M104.724985,139.668381 L127.999822,139.668381 L127.999822,69.843872 L104.724985,69.843872 L104.724985,139.668381 Z M168.721862,139.668381 L191.992237,139.668381 L191.992237,69.843872 L168.721862,69.843872 L168.721862,139.668381 Z"></path>
      </g>
    </svg>
  );
};
const twitchButton = css({
  height: 42,
  width: '100%',
  cursor: 'pointer',
  backgroundColor: '#9146FF !important',
  color: '#FFFFFF !important',

  '&:active': {
    backgroundColor: '#6903ff !important',
    '& svg g path': {
      fill: '#6903ff !important',
    },
  },
});
export const TwitchButton: React.FC<{
  intent: string;
}> = ({ intent }) => {
  return (
    <>
      <Button onClick={twitchLogin(intent)} className={twitchButton()}>
        Login With Twitch
        <TwitchIcon />
      </Button>
    </>
  );
};
