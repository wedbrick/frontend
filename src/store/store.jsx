import { configureStore } from '@reduxjs/toolkit'

// Create a dummy reducer as placeholder
const dummyReducer = (state = {}, action) => state;

export const store = configureStore({
  reducer: {
    // Temporary placeholder reducer
    _placeholder: dummyReducer,
    
    // Keep existing API reducers if you have any
    // [pokemonApi.reducerPath]: pokemonApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
    // .concat(pokemonApi.middleware)  // Keep if using APIs
})

// Only include if using RTK Query features
// setupListeners(store.dispatch)