export type DataDogSeriesPayload = {
  metric: string
  points: {
    timestamp: number
    value: string | number | undefined
  }[]
  resources: {
    name: string
    type: string
  }[];
  source_type_name: string
  tags: string[]
  type: number
  unit: string
}

export type SonarComponentMetric = {
  component: {
    key: string
    name: string
    qualifier: string
    measures: SonarComponentMeasures[]
  }
}

export type SonarComponentMeasures = {
  metric: string
  periods?: {
    index: number
    value: string | number | undefined
    bestValue: boolean
  }[] | undefined
  period?: {
    index: number
    value: string | number | undefined
    bestValue: boolean
  } | undefined
  value?: string | number | undefined
  bestValue: boolean | undefined
}