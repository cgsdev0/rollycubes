import React from "react";
import { css, styled } from "stitches.config";
import { connect, DispatchProp } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { Link, useNavigate  } from "react-router-dom";
import { getCsrf } from "../auth";
import { selectAuthService } from "../selectors/game_selectors";
import { ReduxState } from "../store";
import { TwitchButton } from "../twitch";

interface Props {
  intent?: string;
  onBoard?(): void;
  authService: string;
  authToken?: string | null;
}

const UsernameInput = styled("input", {
  width: "calc(100% - 26px)",
  fontFamily: "Amiko",
  fontSize: 18,
  marginTop: 8,
  borderRadius: 6,
  backgroundColor: "$gray700",
  color: "$primary",
  "&:focus": {
    outline: "none",
  },
  border: 0,
  padding: 10,
  paddingLeft: 16,
});
const content = css({
  width: "100%",
  display: "flex",
  flexDirection: "column",
});
const verticalDivider = css({
  backgroundColor: "$gray500",
  width: 2,
  height: 64,
});
const divider = css({
  color: "$gray500",
  height:"100%",
  display: "flex",
  flexDirection: "column",
  gap: 16,
  justifyContent: "center",
  alignItems: "center",
  padding: "0px 64px",
});
const InnerSection = styled('div', {
width: 270,
position: "relative",
  color: "$gray500",
"& p": {
    fontFamily: "Caveat",
    fontSize: 28,
position: "absolute",
width: "100%",
textAlign: "center",
marginTop: 20,
}
});
const Section = styled('div', {
  width: "100%",
  justifyContent: "center",
  alignItems: "center",
  display: "flex",
});
const buttonContainer = css({
  width: "100%",
  display: "flex",
  flexDirection: "row",
  height: "100%",
});

const guestText = css({
color: "white",
cursor: "pointer",
"&:hover": {
color: "#55dfa0",
textDecoration: "underline",
}
});
const OnboardPage: React.FC<DispatchProp & Props> = (props) => {
  const [username, setUsername] = React.useState<string>(
   localStorage.getItem("name") || ""
  );

  const navigate = useNavigate();
  const [ pressed, setPressed ] = React.useState(false);

  const { authToken, authService, dispatch } = props;

  const onStart = async () => {
    if(pressed) return;
    localStorage.setItem("name", username);
    if (props.onBoard) {
      props.onBoard();
      return;
    }
    setPressed(true);
    const result = await window.fetch(`/create?public`);
    if (!result.ok) {
      setPressed(false);
    } else {
      const dest = await result.text();
      navigate(`/room/${dest}`, { replace: true });
    }
  }


  React.useEffect(() => {
    (async function() {
      if (authToken) {
        const result = await window.fetch(`/create?public`);
      const dest = await result.text();
      navigate(`/room/${dest}`,{ replace: true } );
      }
    })();
  }, []);
   if (authToken)
   return null;
  //   return (
  //     <Navigate to="/home" replace state={{ redirect: location.pathname }} />
  //   );

  return (
    <div className={content()}>
      <h1>Rolly Cubes</h1>
      <div className={buttonContainer()}>
      <Section>
      <InnerSection>
      <TwitchButton intent={props.intent || "start"} />
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
      <form onSubmit={username ? (e) => { e.preventDefault(); onStart() } : undefined} >
      <UsernameInput type="text" placeholder="Enter a name..." onChange={(e) => setUsername(e.target.value)} value={username}/>
      </form>
      <p className={username ? guestText() : ""} onClick={username ? onStart : undefined}>Play as a guest</p>
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
