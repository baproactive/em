import { store } from '../store'

// util
import {
  equalThoughtRanked,
  equalThoughtSorted,
  getSortPreference,
  isFunction,
  meta,
  pathToContext,
} from '../util'

import getThoughtsRanked from '../selectors/getThoughtsRanked'
import getThoughtsSorted from '../selectors/getThoughtsSorted'

/** Gets thoughts's next sibling with its rank. */
export const nextSibling = (value, context, rank) => {
  const state = store.getState()
  const { showHiddenThoughts } = state
  const sortPreference = getSortPreference(meta(pathToContext(context)))
  const siblings = (sortPreference === 'Alphabetical' ? getThoughtsSorted : getThoughtsRanked)(state, context)
  const notHidden = child => !isFunction(child.value) && !meta(context.concat(child.value)).hidden
  const siblingsFiltered = showHiddenThoughts ? siblings : siblings.filter(notHidden)
  const i = siblingsFiltered.findIndex(child => sortPreference === 'Alphabetical' ? equalThoughtSorted(child, { value }) :
    equalThoughtRanked(child, { value, rank }))
  return siblingsFiltered[i + 1]
}
