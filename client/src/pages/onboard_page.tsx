import React from 'react';
import { css, styled } from 'stitches.config';
import { connect, DispatchProp } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectAuthService } from '../selectors/game_selectors';
import { ReduxState } from '../store';
import { TwitchButton } from '../twitch';
import { rewriteHostname } from 'connection';

interface Props {
  intent?: string;
  onBoard?(): void;
  authService: string;
  authToken?: string | null;
}

const UsernameInput = styled('input', {
  width: 'calc(100% - 26px)',
  fontFamily: 'Amiko',
  fontSize: 18,
  marginTop: 8,
  borderRadius: 6,
  backgroundColor: '$gray700',
  color: '$primary',
  '&:focus': {
    outline: 'none',
  },
  border: 0,
  padding: 10,
  paddingLeft: 16,
});
const content = css({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
});
const verticalDivider = css({
  backgroundColor: '$gray500',
  width: 2,
  height: 64,
  '@bp0': {
    width: 64,
    height: 2,
  },
});
const divider = css({
  color: '$gray500',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '@bp0': {
    flexDirection: 'row',
  },
  gap: 16,
  justifyContent: 'center',
  alignItems: 'center',
  padding: '0px 64px',
});
const InnerSection = styled('div', {
  width: 270,
  position: 'relative',
  color: '$gray500',
  '& p': {
    fontFamily: 'Caveat',
    fontSize: 28,
    textAlign: 'center',
    '@bp1': {
      position: 'absolute',
      width: '100%',
      marginTop: 20,
    },
  },
});
const Section = styled('div', {
  width: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  display: 'flex',
});
const buttonContainer = css({
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  height: '100%',
  '@bp0': {
    marginTop: 100,
    flexDirection: 'column',
    height: '40vh',
    justifyContent: 'space-between',
  },
});

const guestTextDisabled = css({
  color: '$primaryDimmed',
});
const guestText = css({
  '&::after': {
    content: '  →',
  },
  color: '$primary',
  cursor: 'pointer',
  '&:hover': {
    color: '#55dfa0',
    textDecoration: 'underline',
  },
});
const OnboardPage: React.FC<DispatchProp & Props> = (props) => {
  const [username, setUsername] = React.useState<string>(
    localStorage.getItem('name') || ''
  );

  const navigate = useNavigate();

  const { authToken, authService, dispatch } = props;

  const onStart = async () => {
    localStorage.setItem('name', username);
    if (props.onBoard) {
      props.onBoard();
      return;
    }
  };

  React.useEffect(() => {
    (async function () {
      if (authToken) {
        const result = await window.fetch(
          window.location.protocol + '//' + rewriteHostname() + `/create?public`
        );
        const dest = await result.text();
        navigate(`/room/${dest}`, { replace: true });
      }
    })();
  }, []);
  if (authToken) return null;
  //   return (
  //     <Navigate to="/home" replace state={{ redirect: location.pathname }} />
  //   );

  return (
    <div className={content()}>
      <h1>Rolly Cubes</h1>
      <div className={buttonContainer()}>
        <Section>
          <InnerSection>
            <TwitchButton intent={props.intent || ''} />
            <p>Earn achievements</p>
          </InnerSection>
        </Section>
        <div className={divider()}>
          <div className={verticalDivider()}></div>
          or
          <div className={verticalDivider()}></div>
        </div>
        <Section>
          <InnerSection>
            <form
              onSubmit={
                username
                  ? (e) => {
                      e.preventDefault();
                      onStart();
                    }
                  : undefined
              }
            >
              <UsernameInput
                type="text"
                placeholder="Enter a name..."
                onChange={(e) => setUsername(e.target.value)}
                value={username}
              />
            </form>
            <p
              className={username ? guestText() : guestTextDisabled()}
              onClick={username ? onStart : undefined}
            >
              Play as a guest
            </p>
          </InnerSection>
        </Section>
      </div>
    </div>
  );
};

const mapStateToProps = (state: ReduxState) => {
  return {
    authService: selectAuthService(state),
    authToken: state.auth.authToken,
  };
};

const ConnectedOnboardPage = connect(mapStateToProps)(OnboardPage);
export default ConnectedOnboardPage;
