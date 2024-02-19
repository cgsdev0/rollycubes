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

interface Props {
  player: Player;
  n: number;
  self_index?: number;
  turn_index: number;
  socket?: WebSocket;
  isSpectator: boolean;
}

const ADJUST_FOR_STUPID_FONT = -5;

const AchievementTooltip = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  whiteSpace: 'nowrap',
  backgroundColor: '$gray800',
  // borderWidth: 2,
  // borderStyle: 'solid',
  // borderColor: '$gray900',
  borderRadius: 8,
  padding: 12,
  boxShadow:
    'rgba(255, 255, 255, 0.15) 0px 2px 0px 0px inset, rgba(0, 0, 0, 0.2) 0px 3px 0px 0px, $elevation',
  p: {
    fontSize: 14,
    color: '$primaryDimmed',
  },
  header: {
    fontWeight: 'bold',
  },
});
const CardBody = styled('div', {});
const Achievements = styled('div', {
  display: 'grid',
  gridTemplateColumns: 'repeat( auto-fill, 50px)',
  gap: 2,
  justifyContent: 'center',
});
const RecordDiv = styled('div', {
  fontSize: 16,
});
const Histograms = styled('div', {
  display: 'flex',
  justifyContent: 'space-evenly',
  marginBottom: 20,
  gap: 4,
});
const Histogram = styled('div', {
  display: 'flex',
  border: '1px solid black',
  justifyContent: 'space-evenly',
  backgroundColor: '$gray800',
  borderRadius: 4,
  overflow: 'hidden',
  height: 50,
  width: '100%',
  gap: 1,
});
const Records = styled('div', {
  display: 'flex',
  justifyContent: 'space-evenly',
  marginBottom: 20,
});
const Good = styled('span', {
  color: '$good',
});
const Bad = styled('span', {
  color: '$bad',
});
const Neutral = styled('span', {
  letterSpacing: -1,
  color: '$primaryDimmed',
});
const StyledTooltip = styled('div', {
  backgroundColor: '$gray700',
  padding: 12,
  maxWidth: 400,
  minWidth: 310,
  zIndex: 10,
  borderRadius: 16,
  boxShadow:
    'rgba(255, 255, 255, 0.15) 0px 2px 0px 0px inset, rgba(0, 0, 0, 0.2) 0px 3px 0px 0px, $elevation',
  h1: {
    p: {
      textAlign: 'left',
    },
    '@bp0': {
      gap: 8,
    },
    fontFamily: 'Amiko',
    marginBottom: 8,
    fontSize: 32,
    display: 'flex',
    alignItems: 'center',
    'p:last-child': {
      fontSize: 14,
      fontWeight: 'normal',
    },
  },
});
const playerName = css({
  textWrap: 'nowrap',
  overflow: 'hidden',
  height: '100%',
  width: '100%',
  alignItems: 'center',
  display: 'flex',
  marginBottom: ADJUST_FOR_STUPID_FONT,
  '@bp0': {
    display: 'none',
  },
});

const kick = css({
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  height: '100%',
  position: 'absolute',
  top: 0,
  left: 5,
});

const playerRow = css({
  display: 'flex',
  justifyContent: 'space-between',
  minHeight: 36,
  '&.highlight': {
    backgroundColor: '$brandFaded',
    boxShadow: '0px 0px 3px 3px $brand, 0px 0px 12px 6px $brand inset',
    '@bp1': {
      paddingLeft: 70,
      paddingRight: 70,
      marginLeft: -40,
      marginRight: -40,
      borderRadius: 4,
    },
    [`& .${kick}`]: {
      left: 45,
    },
  },
  '@bp0': {
    flexDirection: 'column',
    alignItems: 'center',
    padding: 8,
    borderRadius: 16,
  },
  '@bp1': {
    lineHeight: 0,
    paddingLeft: 30,
    paddingRight: 30,
    paddingTop: 2,
    paddingBottom: 2,
  },
  position: 'relative',
});

const avatarAndName = css({
  display: 'flex',
  '@bp1': {
    maxWidth: '75%',
  },
  alignItems: 'center',
});

const score = css({
  display: 'flex',
  alignItems: 'center',
  marginBottom: ADJUST_FOR_STUPID_FONT,
});

const PlayerComponent = (props: Props) => {
  const { data } = useGetUserByIdQuery(props.player.user_id!, {
    skip: !Boolean(props.player.user_id),
  });

  const onKick = () => {
    const { n } = props;
    if (props.socket) {
      props.socket.send(JSON.stringify({ type: 'kick', id: n }));
    }
  };

  const [tooltipVisible, setTooltipVisible] = React.useState(false);
  const { getTooltipProps, setTooltipRef, setTriggerRef } = usePopperTooltip({
    visible: tooltipVisible,
    onVisibleChange: setTooltipVisible,
    interactive: true,
    trigger: 'click',
  });

  const { n, player, turn_index } = props;
  const imageUrl = data?.image_url;

  const turnHighlight = turn_index === n ? ' highlight' : '';

  return (
    <>
      {tooltipVisible && (
        <StyledTooltip
          ref={setTooltipRef}
          {...getTooltipProps({ className: 'tooltip-container' })}
        >
          <TooltipContents {...props} data={data} />
        </StyledTooltip>
      )}
      <div
        className={playerRow() + turnHighlight}
        style={{
          zIndex: n,
        }}
      >
        <span className={avatarAndName()}>
          <Avatar
            ref={data ? setTriggerRef : undefined}
            isSignedIn={Boolean(data)}
            disconnected={!player.connected}
            imageUrl={imageUrl}
            n={n}
            crown={player.crowned}
          />
          <span className={playerName()}>{player.name || `User${n + 1}`}</span>
        </span>
        <span className={score()}>{JSON.stringify(player.score)}</span>
        {player.skip_count < 2 ||
        props.isSpectator ||
        n === props.self_index ? null : (
          <span className={kick()} onClick={onKick}>
            <KickIcon />
          </span>
        )}
      </div>
    </>
  );
};

const StyledBar = styled('div', {
  backgroundColor: '$brandFaded',
  width: '100%',
  alignSelf: 'flex-end',
  height: '0%',
  transition: 'height 0.5s',
});
const StyledBarCover = styled('div', {
  backgroundColor: '$gray800',
  width: '100%',
  alignSelf: 'flex-end',
  zIndex: 1000,
});
const BarWrapper = styled('div', {
  height: '100%',
  width: '100%',
  display: 'flex',
});
const HistogramTooltip = styled('div', {});
const Bar = ({
  percent,
  max,
  label,
  header,
}: {
  percent: number;
  max: number;
  label: string;
  header: string;
}) => {
  const [tooltipVisible, setTooltipVisible] = React.useState(false);
  const { getTooltipProps, setTooltipRef, setTriggerRef } = usePopperTooltip({
    visible: tooltipVisible,
    onVisibleChange: setTooltipVisible,
  });
  const [height, setHeight] = React.useState<string | undefined>(undefined);
  React.useEffect(() => {
    setHeight(
      `calc(max(min(${(percent / (max || 1)) * 100}%, calc(100% - 2px)), 2px))`
    );
  }, [height, percent, max]);
  return (
    <>
      {tooltipVisible ? (
        <AchievementTooltip
          ref={setTooltipRef}
          {...getTooltipProps({ className: 'tooltip-container' })}
        >
          <HistogramTooltip>
            <header>{header}</header>
            {label}
          </HistogramTooltip>
        </AchievementTooltip>
      ) : null}
      <BarWrapper ref={setTriggerRef}>
        <StyledBar
          style={{
            height,
          }}
        />
      </BarWrapper>
    </>
  );
};

const TooltipContents = (props: Props & { data?: UserData }) => {
  const { n, player, data } = props;
  const imageUrl = data?.image_url;
  const doubles = data?.stats?.doubles || 0;
  const wins = data?.stats?.wins || 0;
  const games = data?.stats?.games || 0;
  const rolls = data?.stats?.rolls || 0;

  const losses = games - wins;

  const win_rate = Math.floor((wins / (games || 1)) * 1000) / 10;

  const join_date = new Date(props.data?.created_date || 0)
    .toDateString()
    .split(' ');
  join_date.shift();

  const unlocked = props.data?.achievements?.filter((ach) => ach.unlocked);
  let placeholders = 6 - ((unlocked?.length || 6) % 6);
  if (placeholders === 6 && unlocked?.length) {
    placeholders = 0;
  }
  const dice_max = Math.max(...(props.data?.stats?.dice_hist || [1]));
  const sum_max = Math.max(...(props.data?.stats?.sum_hist || [1]));
  const win_max = Math.max(...(props.data?.stats?.win_hist || [1]));
  const { fontSize, ref } = useFitText({ logLevel: 'error' });

  return React.useMemo(
    () => (
      <>
        <h1>
          <Avatar imageUrl={imageUrl} size={80} />
          <div>
            <p
              ref={ref}
              style={{
                fontSize,
                width: '210px',
                opacity: ref.current ? '100%' : '0%',
              }}
            >
              {player.name || `User${n + 1}`}
            </p>
            <p>Player since {join_date.join(' ')}</p>
          </div>
        </h1>
        <CardBody>
          {/*<p>
          Doubles: {doubles} / {rolls} rolls ({doubles_rate}%)
        </p>*/}
          <Histograms>
            <Histogram>
              {props.data?.stats?.dice_hist?.map((v, i) => (
                <Bar
                  key={i}
                  percent={v}
                  max={dice_max}
                  label={`Happened ${v} times`}
                  header={`Rolled a ${i + 1}`}
                />
              ))}
            </Histogram>
            <Histogram>
              {props.data?.stats?.sum_hist?.slice(1).map((v, i) => (
                <Bar
                  key={i}
                  percent={v}
                  max={sum_max}
                  label={`Happened ${v} times`}
                  header={`Sum of ${i + 2}`}
                />
              ))}
            </Histogram>
            <Histogram>
              {props.data?.stats?.win_hist?.map((v, i) => (
                <Bar
                  key={i}
                  percent={v}
                  max={win_max}
                  header={`Won with ${TARGET_SCORES[i]}`}
                  label={`Happened ${v} times`}
                />
              ))}
            </Histogram>
          </Histograms>
          <Records>
            <RecordDiv>
              <p>
                <Good>{wins}</Good> - <Bad>{losses}</Bad>
              </p>
              <p>
                <Neutral>RECORD</Neutral>
              </p>
            </RecordDiv>
            <RecordDiv>
              <p>
                <Good>{doubles}</Good> - <Bad>{rolls - doubles}</Bad>
              </p>
              <p>
                <Neutral>DOUBLES</Neutral>
              </p>
            </RecordDiv>
            <RecordDiv>
              <p>{win_rate}%</p>
              <p>
                <Neutral>WIN RATE</Neutral>
              </p>
            </RecordDiv>
          </Records>
          <Achievements>
            {unlocked?.map((ach) => {
              return (
                <AchievementImg
                  key={ach.id}
                  unlocked={ach.unlocked}
                  progress={ach.progress}
                  rd={ach.rd}
                  rn={ach.rn}
                  id={ach.id}
                />
              );
            })}
            {new Array(placeholders).fill(0).map((_, i) => (
              <AchievementPlaceholder key={i} />
            ))}
          </Achievements>
        </CardBody>
      </>
    ),
    [data, fontSize, ref.current]
  );
};

const defaultAchievementData: AchievementData = {
  description: 'unknown',
  image_url: '//via.placeholder.com/48',
  id: 'unknown',
  name: 'Unknown',
  max_progress: 0,
};
const AImg = styled('img', {
  imageRendering: 'pixelated',
  borderRadius: 4,
  border: '1px solid black',
});

const AchievementPlaceholder = styled('div', {
  borderRadius: 4,
  border: '1px dashed $gray900',
  width: 48,
  height: 48,
});

const AchievementImg = (props: Achievement) => {
  const achievements =
    useSelector((state: ReduxState) => state.auth.achievements) || {};
  const achData = achievements[props.id] || defaultAchievementData;
  const [tooltipVisible, setTooltipVisible] = React.useState(false);
  const { getTooltipProps, setTooltipRef, setTriggerRef } = usePopperTooltip({
    visible: tooltipVisible,
    onVisibleChange: setTooltipVisible,
  });
  const img_url = achData.image_url || '//via.placeholder.com/48';
  const unlock_date = new Date(props.unlocked || 0).toDateString().split(' ');
  unlock_date.shift();
  const rarity = Math.floor(((props.rn || 0) / (props.rd || 1)) * 1000) / 10;
  return React.useMemo(
    () => (
      <>
        {tooltipVisible && (
          <AchievementTooltip
            ref={setTooltipRef}
            {...getTooltipProps({ className: 'tooltip-container' })}
          >
            <AImg
              src={img_url}
              alt={achData.description}
              width={96}
              height={96}
            />
            <div>
              <header>{achData.name}</header>
              <p>{achData.description}</p>
              <p>Unlocked {unlock_date.join(' ')}</p>
              {rarity > 0 ? <p>{rarity}% of users have this</p> : null}
            </div>
          </AchievementTooltip>
        )}
        <AImg
          ref={setTriggerRef}
          width={48}
          height={48}
          alt={achData.description}
          src={img_url}
        />
      </>
    ),
    [tooltipVisible, getTooltipProps]
  );
};

const mapStateToProps = (state: ReduxState) => {
  return {
    self_index: selectSelfIndex(state),
    turn_index: selectTurnIndex(state),
    socket: state.connection.socket,
    isSpectator: selectIsSpectator(state),
  };
};

export default connect(mapStateToProps)(PlayerComponent);
