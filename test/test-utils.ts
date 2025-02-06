export type ExpectedSpiedFnArgs<TFnName extends string> = {
  calledFnName: TFnName
  calledWith?: unknown
  calledTimes: number
}

// TODO: ts-refactor => improve
export function testSpiedFn<TFnName extends string>(
  spyFn: () => void,
  spyFnName: TFnName,
  expectedFnArgs: ExpectedSpiedFnArgs<TFnName> | undefined = undefined,
): void {
  if (spyFnName === expectedFnArgs?.calledFnName) {
    expect(spyFn).toHaveBeenCalledTimes(expectedFnArgs.calledTimes)
    if ('calledWith' in expectedFnArgs) {
      expect(spyFn).toHaveBeenCalledWith(expectedFnArgs.calledWith)
    } else {
      expect(spyFn).toHaveBeenCalledWith()
    }
  }
}
