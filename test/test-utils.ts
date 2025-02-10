import { isUndefined } from "../src/utils"

export type ExpectedSpiedFnArgs<TFnName extends string> = {
  calledFnName: TFnName
  calledWith?: unknown
  calledTimes: number
}

export function testSpiedFn(
  spyFn: () => void,
  calledTimes: number,
  calledWith: unknown
): void {
  expect(spyFn).toHaveBeenCalledTimes(calledTimes)
  if (!isUndefined(calledWith)) {
    expect(spyFn).toHaveBeenCalledWith(calledWith)
  } else {
    expect(spyFn).toHaveBeenCalledWith()
  }
}
