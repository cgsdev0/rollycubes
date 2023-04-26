import React from 'react'
import { connect } from 'react-redux'
import { selectPlayersAndUserData } from '../selectors/game_selectors'
import { ReduxState } from '../store'
import PlayerComponent from './player'
import { GameState } from '../reducers/game'
import { Player } from '../types/store_types'
import { css } from 'stitches.config'

interface Props {
  players: GameState['players']
}

const playerPanel = css({
  borderRadius: 16,
  backgroundColor: '#151515',
  display: 'flex',
  flexDirection: 'column',
  '@bp0': {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  gap: 2,
  height: '100%',
  '@bp1': {
    width: 336,
  },
  paddingTop: 30,
  paddingBottom: 30,
})

const Players: React.FC<Props> = (props) => {
  return (
    <div className={playerPanel()}>
      {props.players.map((player: Player, i: number) => (
        <PlayerComponent key={`${i}${player.name}`} n={i} player={player} />
      ))}
    </div>
  )
}

const mapStateToProps = (state: ReduxState) => {
  return {
    players: selectPlayersAndUserData(state),
  }
}

export default connect(mapStateToProps)(Players)
