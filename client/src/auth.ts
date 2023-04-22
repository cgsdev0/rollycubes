export const getCsrf = async (authService: string) => {
  return ''
  const csrf = await window.fetch(authService + 'csrf', {
    mode: 'cors',
    credentials: 'include',
  })
  const { csrfToken } = await csrf.json()
  return csrfToken
}
