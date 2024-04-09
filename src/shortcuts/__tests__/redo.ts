import importText from '../../action-creators/importText'
import { HOME_TOKEN } from '../../constants'
import childIdsToThoughts from '../../selectors/childIdsToThoughts'
import exportContext from '../../selectors/exportContext'
import { createTestStore } from '../../test-helpers/createTestStore'
import { editThoughtByContextActionCreator as editThought } from '../../test-helpers/editThoughtByContext'
import { setCursorFirstMatchActionCreator as setCursor } from '../../test-helpers/setCursorFirstMatch'

it('redo thought change', () => {
  const store = createTestStore()

  store.dispatch([
    importText({
      text: `
        - a
        - b`,
    }),
    { type: 'cursorUp' },
    editThought(['a'], 'aa'),
    { type: 'undoAction' },
  ])

  const exportedBeforeRedo = exportContext(store.getState(), [HOME_TOKEN], 'text/plain')

  const expectedOutputAfterUndo = `- ${HOME_TOKEN}
  - a
  - b`

  expect(exportedBeforeRedo).toEqual(expectedOutputAfterUndo)

  // redo thought change
  store.dispatch({ type: 'redoAction' })

  const exportedAfterRedo = exportContext(store.getState(), [HOME_TOKEN], 'text/plain')

  const expectedOutputAfterRedo = `- ${HOME_TOKEN}
  - aa
  - b`

  expect(exportedAfterRedo).toEqual(expectedOutputAfterRedo)
})

it('group contiguous navigation actions preceding a thought change on redo', () => {
  const store = createTestStore()

  store.dispatch([
    importText({
      text: `
        - a
        - b
        - c`,
    }),
    setCursor(['c']),
    { type: 'cursorUp' },
    { type: 'indent' },
    { type: 'cursorUp' },
    editThought(['a'], 'arizona'),
    setCursor(['arizona', 'b']),
    { type: 'cursorBack' },
    { type: 'cursorUp' },
    { type: 'cursorDown' },

    editThought(['arizona', 'b'], 'boston'),
    { type: 'cursorDown' },
    { type: 'undoAction' },
    { type: 'undoAction' },
    // redo all actions preceding a thoughtchange as a single operation
    { type: 'redoAction' },
  ])

  const cursorAfterFirstRedo = childIdsToThoughts(store.getState(), store.getState().cursor!)
  expect(cursorAfterFirstRedo).toMatchObject([{ value: 'arizona', rank: 0 }])

  store.dispatch({ type: 'redoAction' })
  const state = store.getState()
  const cursorAfterSecondRedo = childIdsToThoughts(store.getState(), store.getState().cursor!)
  expect(cursorAfterSecondRedo).toMatchObject([{ value: 'arizona' }, { value: 'boston' }])

  const exportedAfterRedo = exportContext(state, [HOME_TOKEN], 'text/plain')
  const expectedOutputAfterRedo = `- ${HOME_TOKEN}
  - arizona
    - boston
  - c`

  expect(exportedAfterRedo).toEqual(expectedOutputAfterRedo)
})

it('redo contiguous changes', () => {
  const store = createTestStore()

  store.dispatch([
    importText({
      text: `
        - A
        - B`,
    }),
    editThought(['A'], 'Atlantic'),
    editThought(['Atlantic'], 'Atlantic '),
    editThought(['Atlantic '], 'Atlantic City'),
    { type: 'undoAction' },
  ])

  const exportedBeforeRedo = exportContext(store.getState(), [HOME_TOKEN], 'text/plain')

  const expectedOutputBeforeRedo = `- ${HOME_TOKEN}
  - A
  - B`

  expect(exportedBeforeRedo).toEqual(expectedOutputBeforeRedo)

  store.dispatch({
    type: 'redoAction',
  })

  const exportedAfterRedo = exportContext(store.getState(), [HOME_TOKEN], 'text/plain')

  const expectedOutputAfterRedo = `- ${HOME_TOKEN}
  - Atlantic City
  - B`

  expect(exportedAfterRedo).toEqual(expectedOutputAfterRedo)
})
