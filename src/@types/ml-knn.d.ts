declare module 'ml-knn' {
    export default class KNN {
        constructor(dataset: number[][], labels: number[])
        predict(dataset: number[][]): number[]
    }
}
