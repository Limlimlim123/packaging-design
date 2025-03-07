import { configureStore } from '@reduxjs/toolkit'
import designReducer from '@/store/designSlice'
import editorReducer from '@/store/editorSlice'

export const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      design: designReducer,
      editor: editorReducer
    },
    preloadedState
  })
}