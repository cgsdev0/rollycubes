import React from 'react'
import { connect, DispatchProp } from 'react-redux'
import { selectAuthService } from '../selectors/game_selectors'
import { ReduxState } from '../store'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'

interface Props {
  authService: string
  authToken?: string | null
}

const TwitchOAuthPage: React.FC<DispatchProp & Props> = ({
  authService,
  dispatch,
  authToken,
}) => {
  React.useEffect(() => {
    ;(async () => {
      const hash = window.location.hash.replace('#', '')
      const params = new URLSearchParams(hash)
      const twitch_access_token = params.get('access_token')
      console.log({ twitch_access_token })
      const resp = await window.fetch(
        authService + 'twitch_login_or_register',
        {
          mode: 'cors',
          credentials: 'include',
          body: JSON.stringify({ twitch_access_token }),
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
        }
      )
      const { access_token } = await resp.json()
      if (access_token) {
        dispatch({ type: 'AUTHENTICATE', access_token })
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const navigate = useNavigate()
  React.useEffect(() => {
    ;(async function () {
      if (authToken) {
        const intent = localStorage.getItem('intent')
        if (intent) localStorage.removeItem('intent')
        if (intent == 'start') {
          const result = await window.fetch(`/create?public`)
          if (!result.ok) {
            navigate('/home', { replace: true })
          } else {
            const dest = await result.text()
            navigate(`/room/${dest}`, { replace: true })
          }
        } else if (intent) {
          console.warn('INTENT FOUND', { intent })
          navigate(`/${intent}`, { replace: true })
        } else {
          navigate('/home', { replace: true })
        }
      }
    })()
  }, [authToken, navigate])
  return null
}

const mapStateToProps = (state: ReduxState) => {
  return {
    authService: selectAuthService(state),
    authToken: state.auth.authToken,
  }
}

const ConnectedTwitchOAuthPage = connect(mapStateToProps)(TwitchOAuthPage)
export default ConnectedTwitchOAuthPage
