interface ILimitParameters {
    value: number;
    min: number;
    max: number;
}

function limit(parameters: ILimitParameters): number {
    const { value, min, max } = parameters;
    let result: number = value;
    result = Math.min(result, max);
    result = Math.max(result, min);

    return result;
}

export { limit };
