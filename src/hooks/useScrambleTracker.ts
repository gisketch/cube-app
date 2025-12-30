import { useCallback, useReducer } from 'react'
import {
  parseScramble,
  parseMove,
  getInverseMove,
  combineMove,
  isSameFace,
  type ParsedMove,
} from '@/lib/move-utils'

export interface ScrambleMoveState {
  move: ParsedMove
  originalMove: ParsedMove
  status: 'pending' | 'current' | 'completed' | 'recovery'
  wasModified?: boolean
}

export type ScrambleStatus = 'idle' | 'scrambling' | 'diverged' | 'completed' | 'solving' | 'solved'

export interface ScrambleTrackerState {
  status: ScrambleStatus
  originalScramble: string
  moves: ScrambleMoveState[]
  currentIndex: number
  recoveryMoves: ParsedMove[]
  divergedMoves: ParsedMove[]
  isSolved: boolean
  solutionMoves: string[]
}

type Action =
  | { type: 'SET_SCRAMBLE'; scramble: string }
  | { type: 'PERFORM_MOVE'; move: string }
  | { type: 'RESET' }
  | { type: 'SET_SOLVED'; isSolved: boolean }
  | { type: 'START_SOLVING' }

const MAX_DIVERGENCE = 10

function createInitialState(): ScrambleTrackerState {
  return {
    status: 'idle',
    originalScramble: '',
    moves: [],
    currentIndex: 0,
    recoveryMoves: [],
    divergedMoves: [],
    isSolved: true,
    solutionMoves: [],
  }
}

function reducer(state: ScrambleTrackerState, action: Action): ScrambleTrackerState {
  switch (action.type) {
    case 'SET_SCRAMBLE': {
      const parsed = parseScramble(action.scramble)
      if (parsed.length === 0) {
        return { ...createInitialState(), isSolved: state.isSolved }
      }

      const moves: ScrambleMoveState[] = parsed.map((move, i) => ({
        move,
        originalMove: move,
        status: i === 0 ? 'current' : 'pending',
      }))

      return {
        status: 'scrambling',
        originalScramble: action.scramble,
        moves,
        currentIndex: 0,
        recoveryMoves: [],
        divergedMoves: [],
        isSolved: false,
        solutionMoves: [],
      }
    }

    case 'START_SOLVING': {
      if (state.status !== 'completed') return state
      return {
        ...state,
        status: 'solving',
        solutionMoves: [],
      }
    }

    case 'PERFORM_MOVE': {
      const parsedMove = parseMove(action.move)
      if (!parsedMove) return state

      if (state.status === 'solving') {
        return {
          ...state,
          solutionMoves: [...state.solutionMoves, action.move],
        }
      }

      if (state.status === 'idle' || state.status === 'completed') {
        return state
      }

      if (state.status === 'diverged') {
        if (state.recoveryMoves.length === 0) return state

        const expectedRecovery = state.recoveryMoves[0]

        if (isSameFace(parsedMove, expectedRecovery)) {
          const remaining = combineMove(expectedRecovery, parsedMove)

          if (remaining === null) {
            const newRecoveryMoves = state.recoveryMoves.slice(1)

            if (newRecoveryMoves.length === 0) {
              const newMoves = state.moves.map((m, i) => ({
                ...m,
                status:
                  i < state.currentIndex
                    ? 'completed'
                    : i === state.currentIndex
                      ? 'current'
                      : 'pending',
              })) as ScrambleMoveState[]

              return {
                ...state,
                status: 'scrambling',
                recoveryMoves: [],
                divergedMoves: [],
                moves: newMoves,
              }
            }

            return {
              ...state,
              recoveryMoves: newRecoveryMoves,
            }
          } else {
            return {
              ...state,
              recoveryMoves: [remaining, ...state.recoveryMoves.slice(1)],
            }
          }
        } else {
          const newDiverged = [...state.divergedMoves, parsedMove]

          if (newDiverged.length > MAX_DIVERGENCE) {
            return {
              ...state,
              divergedMoves: newDiverged,
            }
          }

          const recovery = getInverseMove(parsedMove)
          return {
            ...state,
            divergedMoves: newDiverged,
            recoveryMoves: [recovery, ...state.recoveryMoves],
          }
        }
      }

      const currentMoveState = state.moves[state.currentIndex]
      if (!currentMoveState) return state

      const expectedMove = currentMoveState.move

      if (isSameFace(parsedMove, expectedMove)) {
        const remaining = combineMove(expectedMove, parsedMove)

        if (remaining === null) {
          const newMoves = [...state.moves]
          newMoves[state.currentIndex] = {
            move: currentMoveState.originalMove,
            originalMove: currentMoveState.originalMove,
            status: 'completed',
            wasModified: false,
          }

          const newIndex = state.currentIndex + 1

          if (newIndex >= state.moves.length) {
            return {
              ...state,
              status: 'completed',
              moves: newMoves,
              currentIndex: newIndex,
            }
          }

          newMoves[newIndex] = { ...newMoves[newIndex], status: 'current' }

          return {
            ...state,
            moves: newMoves,
            currentIndex: newIndex,
          }
        } else {
          const newMoves = [...state.moves]
          newMoves[state.currentIndex] = {
            move: remaining,
            originalMove: currentMoveState.originalMove,
            status: 'current',
            wasModified: true,
          }

          return {
            ...state,
            moves: newMoves,
          }
        }
      } else {
        const recovery = getInverseMove(parsedMove)

        return {
          ...state,
          status: 'diverged',
          divergedMoves: [parsedMove],
          recoveryMoves: [recovery],
        }
      }
    }

    case 'SET_SOLVED': {
      return {
        ...state,
        isSolved: action.isSolved,
      }
    }

    case 'RESET': {
      return createInitialState()
    }

    default:
      return state
  }
}

export function useScrambleTracker() {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState)

  const setScramble = useCallback((scramble: string) => {
    dispatch({ type: 'SET_SCRAMBLE', scramble })
  }, [])

  const performMove = useCallback((move: string) => {
    dispatch({ type: 'PERFORM_MOVE', move })
  }, [])

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  const setSolved = useCallback((isSolved: boolean) => {
    dispatch({ type: 'SET_SOLVED', isSolved })
  }, [])

  const startSolving = useCallback(() => {
    dispatch({ type: 'START_SOLVING' })
  }, [])

  const shouldReset = state.status === 'diverged' && state.divergedMoves.length > MAX_DIVERGENCE

  return {
    state,
    setScramble,
    performMove,
    reset,
    setSolved,
    startSolving,
    shouldReset,
  }
}
