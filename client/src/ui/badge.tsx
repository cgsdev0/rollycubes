import { connect, useSelector } from 'react-redux';
import { css, styled } from 'stitches.config';
import useFitText from 'use-fit-text';
import {
  selectIsSpectator,
  selectSelfIndex,
  selectTurnIndex,
} from '../selectors/game_selectors';
import { ReduxState } from '../store';
import { TARGET_SCORES } from '../constants';
import { Achievement, AchievementData, Player, UserData } from '../types/api';
import Avatar from './avatar';
import { usePopperTooltip } from 'react-popper-tooltip';

// TODO: remove
import { KickIcon } from './icons/kick';
import React from 'react';
import { useGetUserByIdQuery } from 'api/auth';
import { AchievementTooltip } from './player';

const BImg = styled('img', {
  imageRendering: 'pixelated',
});

const HistogramTooltip = styled('div', {
  lineHeight: 'initial',
  fontSize: 16,
});

export const BadgeImg = (props: { id: string; click?: boolean }) => {
  const [tooltipVisible, setTooltipVisible] = React.useState(false);
  const { getTooltipProps, setTooltipRef, setTriggerRef } = usePopperTooltip({
    visible: tooltipVisible,
    onVisibleChange: setTooltipVisible,
    trigger: props.click ? 'click' : undefined,
  });
  const badges = useSelector((state: ReduxState) => state.auth.badges) || {};
  const badge = badges[props.id];
  return (
    <>
      {tooltipVisible ? (
        <AchievementTooltip
          ref={setTooltipRef}
          {...getTooltipProps({ className: 'tooltip-container' })}
        >
          <HistogramTooltip>
            <header>{badge?.name}</header>
            <p>{badge?.description}</p>
          </HistogramTooltip>
        </AchievementTooltip>
      ) : null}
      <BImg
        ref={setTriggerRef}
        width={16}
        height={16}
        src={badge?.image_url}
        alt={badge?.description}
      />
    </>
  );
};
