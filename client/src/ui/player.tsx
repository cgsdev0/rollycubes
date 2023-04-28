import { connect, useSelector } from 'react-redux';
import { css, styled } from 'stitches.config';
import {
  selectIsSpectator,
  selectSelfIndex,
  selectTurnIndex,
} from '../selectors/game_selectors';
import { ReduxState } from '../store';
import {
  Achievement,
  AchievementData,
  Player,
  UserData,
} from '../types/store_types';
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
  borderWidth: 2,
  borderStyle: 'solid',
  borderColor: '$gray900',
  borderRadius: 8,
  padding: 12,
  p: {
    fontSize: 14,
    color: '$gray400',
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
  color: '$gray400',
});
const StyledTooltip = styled('div', {
  backgroundColor: '$gray700',
  padding: 12,
  maxWidth: 400,
  minWidth: 310,
  zIndex: 10,
  borderRadius: 16,
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

const playerRow = css({
  display: 'flex',
  justifyContent: 'space-between',
  minHeight: 36,
  '&.highlight': {
    backgroundColor: '$brandFaded',
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

const kick = css({
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  height: '100%',
  position: 'absolute',
  top: 0,
  left: 5,
});

const PlayerComponent = (props: Props) => {
  const { data } = useGetUserByIdQuery(props.player.user_id!, {
    skip: !Boolean(props.player.user_id),
  });

  const onKick = () => {
    const { player, n } = props;
    const e = window.confirm(`Are you sure you want to kick ${player.name}?`);
    if (e && props.socket) {
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
        {player.connected || props.isSpectator ? null : (
          <span className={kick()} onClick={onKick}>
            <KickIcon />
          </span>
        )}
      </div>
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

  const join_date = new Date(props.data?.createdDate || 0)
    .toDateString()
    .split(' ');
  join_date.shift();

  return React.useMemo(
    () => (
      <>
        <h1>
          <Avatar imageUrl={imageUrl} size={80} />
          <div>
            <p>{player.name || `User${n + 1}`}</p>
            <p>Player since {join_date.join(' ')}</p>
          </div>
        </h1>
        <CardBody>
          {/*<p>
          Doubles: {doubles} / {rolls} rolls ({doubles_rate}%)
        </p>*/}
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
            {props.data?.achievements
              ?.filter((ach) => ach.unlocked)
              .map((ach) => {
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
          </Achievements>
        </CardBody>
      </>
    ),
    [data]
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
