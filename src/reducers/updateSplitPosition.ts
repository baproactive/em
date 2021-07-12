import _ from 'lodash'
import { State } from '../types'

/** Updates the position of the Split View splitter. */
const updateSplitPosition = (state: State, { value }: { value: number }) => ({
  ...state,
  splitPosition: value,
})

export default _.curryRight(updateSplitPosition)
