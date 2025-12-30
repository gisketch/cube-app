export const CUBE_COLORS = {
  WHITE: '#FFFFFF',
  YELLOW: '#FFEB3B',
  GREEN: '#4CAF50',
  BLUE: '#2196F3',
  RED: '#F44336',
  ORANGE: '#FF9800',
} as const

export const CROSS_COLOR_MAP: Record<string, { name: string; color: string }> = {
  W: { name: 'White', color: CUBE_COLORS.WHITE },
  Y: { name: 'Yellow', color: CUBE_COLORS.YELLOW },
  G: { name: 'Green', color: CUBE_COLORS.GREEN },
  B: { name: 'Blue', color: CUBE_COLORS.BLUE },
  R: { name: 'Red', color: CUBE_COLORS.RED },
  O: { name: 'Orange', color: CUBE_COLORS.ORANGE },
}

export const PHASE_COLORS = {
  cross: '#3B82F6',
  f2l1: '#10B981',
  f2l2: '#14B8A6',
  f2l3: '#06B6D4',
  f2l4: '#0EA5E9',
  oll: '#F59E0B',
  pll: '#EF4444',
} as const

export const PHASE_COLORS_BY_NAME: Record<string, string> = {
  Cross: PHASE_COLORS.cross,
  'F2L 1': PHASE_COLORS.f2l1,
  'F2L 2': PHASE_COLORS.f2l2,
  'F2L 3': PHASE_COLORS.f2l3,
  'F2L 4': PHASE_COLORS.f2l4,
  OLL: PHASE_COLORS.oll,
  PLL: PHASE_COLORS.pll,
}

export const CALIBRATION_SEQUENCE_TIMEOUT = 800
export const GYRO_SAMPLE_INTERVAL = 50
export const PAUSE_THRESHOLD = 500
export const EXECUTION_THRESHOLD = 300
export const TPS_WINDOW = 1000
export const MAX_DIVERGENCE = 10

export const IDEAL_CFOP_SPLITS = {
  cross: 12,
  f2l: 50,
  oll: 13,
  pll: 25,
} as const
