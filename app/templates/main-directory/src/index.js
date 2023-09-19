import { flow } from "lodash"
import { map } from "lodash/fp"
const output = document.querySelector("code")

const ary = [1, 2, 3]

const Times2 = map((n) => n * 2)
const Minus1 = map((n) => n - 1)

// output.textContent = map(times2)(ary)
// output.textContent = map(ary, times2)
const func = flow(Times2, Minus1)
output.textContent = func(ary)
