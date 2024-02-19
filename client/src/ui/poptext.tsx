import React from 'react';
import { connect } from 'react-redux';
import { styled, keyframes } from 'stitches.config';
import {
  selectLatestPopText,
  selectCrownedPlayer,
} from '../selectors/game_selectors';
import { ReduxState } from '../store';
import { useDispatch } from 'react-redux';

interface Props {
  latestPopText?: { text: string; color: string; id: number };
  crownedPlayer: ReturnType<typeof selectCrownedPlayer>;
}

const popTextAnim = keyframes({
  '0%': { opacity: 0, marginTop: 0 },
  '8%': { opacity: 1, marginTop: 0 },
  '40%': { opacity: 1, marginTop: 0 },
  '100%': { opacity: 0, marginTop: -200 },
});

const PopTextContainer = styled('div', {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  zIndex: 600,
  touchAction: 'none',
  pointerEvents: 'none',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  h6: {
    fontSize: 96,
    animation: `${popTextAnim} 1.4s ease-out forwards`,
    fontWeight: 'bold',
    textShadow:
      '3px 3px 0 $poptext, -3px 3px 0 $poptext, -3px -3px 0 $poptext, 3px -3px 0 $poptext',
  },
});

const PopupText = ({
  text,
  player,
}: {
  text: NonNullable<Props['latestPopText']>;
  player: ReturnType<typeof selectCrownedPlayer>;
}) => {
  return (
    <h6 style={{ color: text.color }} key={text.id}>
      {text.text.replace('{winner}', player?.name || 'Someone')}
    </h6>
  );
};
const UnconnectedPopText: React.FC<Props> = ({
  latestPopText,
  crownedPlayer,
}) => {
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (latestPopText) {
      // queue up a removal
      const timeout = setTimeout(() => dispatch({ type: 'POP_NEXT' }), 1500);
      return () => clearTimeout(timeout);
    }
  }, [latestPopText]);

  return (
    <PopTextContainer id="pop-text-container">
      {latestPopText && (
        <PopupText text={latestPopText} player={crownedPlayer} />
      )}

      {/* <ConnBanner /> */}
    </PopTextContainer>
  );
};

const mapStateToProps = (state: ReduxState) => {
  return {
    latestPopText: selectLatestPopText(state),
    crownedPlayer: selectCrownedPlayer(state),
  };
};

export const PopText = connect(mapStateToProps)(UnconnectedPopText);
