import { describe, expect, test } from "bun:test"
import { formatElapsed } from "../src/format"

describe("formatElapsed (compact)", () => {
  test("clamps negatives to zero", () => {
    expect(formatElapsed(-5000)).toBe("0s")
  })

  test("seconds", () => {
    expect(formatElapsed(0)).toBe("0s")
    expect(formatElapsed(999)).toBe("0s")
    expect(formatElapsed(45_000)).toBe("45s")
  })

  test("minutes", () => {
    expect(formatElapsed(60_000)).toBe("1m")
    expect(formatElapsed(90_000)).toBe("1m 30s")
    expect(formatElapsed(3_599_000)).toBe("59m 59s")
  })

  test("hours", () => {
    expect(formatElapsed(3_600_000)).toBe("1h 0m")
    expect(formatElapsed(7_830_000)).toBe("2h 10m")
  })
})

describe("formatElapsed (full)", () => {
  test("clamps negatives to zero", () => {
    expect(formatElapsed(-5000, "full")).toBe("0:00")
  })

  test("seconds", () => {
    expect(formatElapsed(0, "full")).toBe("0:00")
    expect(formatElapsed(9_000, "full")).toBe("0:09")
    expect(formatElapsed(59_000, "full")).toBe("0:59")
  })

  test("minutes", () => {
    expect(formatElapsed(60_000, "full")).toBe("1:00")
    expect(formatElapsed(90_000, "full")).toBe("1:30")
    expect(formatElapsed(3_599_000, "full")).toBe("59:59")
  })

  test("hours", () => {
    expect(formatElapsed(3_600_000, "full")).toBe("1:00:00")
    expect(formatElapsed(3_661_000, "full")).toBe("1:01:01")
    expect(formatElapsed(36_721_000, "full")).toBe("10:12:01")
  })
})
