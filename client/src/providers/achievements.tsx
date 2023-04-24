import { useGetAchievementListQuery } from 'api/auth'
import React from 'react'
import { useDispatch } from 'react-redux'

export const AchievementProvider: React.FC<{}> = ({ children }) => {
  const { isLoading, data, error } = useGetAchievementListQuery()
  const dispatch = useDispatch()

  React.useEffect(() => {
    if (isLoading) return
    if (error) {
      console.error(error)
    } else if (data) {
      dispatch({ type: 'GOT_ACHIEVEMENTS', achievements: data })
    }
  }, [isLoading, data, error])

  if (isLoading) return null
  return <>{children}</>
}
