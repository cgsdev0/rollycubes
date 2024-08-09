import { useSelector } from 'react-redux';
import { styled } from 'stitches.config';
import { ReduxState } from '../store';
import { usePopperTooltip } from 'react-popper-tooltip';

import React from 'react';
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
        width={15}
        height={15}
        src={badge?.image_url}
        alt={badge?.description}
      />
    </>
  );
};
