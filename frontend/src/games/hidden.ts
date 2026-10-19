interface Listed {
  id: string
}

/** The games the list shows: all of them while hidden ones are shown, else those not hidden. */
function listedGames<G extends Listed>(
  games: G[],
  hidden: readonly string[] | null | undefined,
  showHidden: boolean,
): G[] {
  return showHidden || !hidden?.length ? games : games.filter((g) => !hidden.includes(g.id))
}

export { listedGames }
