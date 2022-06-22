function addSpaceSinceWidth(str, width) {
  return str
    .split("\n")
    .map(
      (line) =>
        line +
        Array(Math.max(width - line.length, 0))
          .fill(" ")
          .join("")
    )
    .join("\n");
}

let str = "this\n is\n a test";
console.log(str);