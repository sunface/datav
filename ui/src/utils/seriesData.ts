import { first, last } from "lodash"
import { SeriesData } from "types/seriesData"
import { ValueCalculationType } from "types/value"

export const calcValueOnSeriesData = (series: SeriesData, calc: ValueCalculationType):number => {
    const values = series.fields[1].values
    if (!calc) {
        return last(values)
    }

   return calcValueOnArray(values, calc)
}

export const calcValueOnArray = (values: number[], calc: ValueCalculationType):number => {

    switch (calc) {
        case ValueCalculationType.Average:
            return values.reduce((a, b) => a + b, 0) / values.length
        case ValueCalculationType.Min:
            return Math.min(...values)
        case ValueCalculationType.Max:
            return Math.max(...values)
        case ValueCalculationType.Sum:
            return values.reduce((a, b) => a + b, 0)
        case ValueCalculationType.Last:
            return last(values)
        case ValueCalculationType.First:
            return first(values)
        case ValueCalculationType.Count:
            return values.length
        default:
            return last(values)
    }
}