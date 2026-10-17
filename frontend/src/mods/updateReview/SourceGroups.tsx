import { useLingui } from '@lingui/react/macro'
import { Typography } from '@mui/material'
import type { ComponentProps } from 'react'
import type { Update } from '../../../bindings/github.com/Rethunk-Tech/mortar/internal/problems/models.ts'
import { space } from '../../theme/density.ts'
import { readsImplicit } from '../installReason.ts'
import { entryOf } from '../lookup.ts'
import { useMods } from '../store.ts'
import { groupBySource } from './groups.ts'
import { ReviewList } from './ReviewList.tsx'

/** The same-source updates, one headed list per reporting source, then the updates of implicit mods as Libraries. */
export function SourceGroups(props: ComponentProps<typeof ReviewList>) {
  const { t } = useLingui()
  const all = useMods((s) => s.mods)
  const library = (u: Update) =>
    readsImplicit(
      entryOf(props.profile, u.key)?.implicit,
      all.find((m) => m.key === u.key && m.id === u.id) ?? { key: u.key, id: u.id },
      all,
    )
  const libraries = props.list.filter(library)
  const heading = (text: string) => (
    <Typography sx={{ px: space.pad, pt: space.pad, fontWeight: 600 }}>{text}</Typography>
  )
  return (
    <>
      {groupBySource(props.list.filter((u) => !library(u))).map((g) => {
        const name = g.name || t`Other`
        return (
          <div key={g.name}>
            {heading(t`${name} (${g.list.length})`)}
            <ReviewList {...props} list={g.list} />
          </div>
        )
      })}
      {libraries.length > 0 ? (
        <div>
          {heading(t`Libraries (${libraries.length})`)}
          <ReviewList {...props} list={libraries} />
        </div>
      ) : null}
    </>
  )
}
