const vscode = require("vscode");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  const disposable = vscode.commands.registerTextEditorCommand(
    "column-maker.createColumn",
    async (textEditor, edit) => {
      const method = await vscode.window.showQuickPick(
        ["Fixed width", "Margin"],
        { title: "Select a method" }
      );

      const isFixed = method === "Fixed width";

      const savedWidth = parseInt(context.workspaceState.get("width")) || 24;
      const savedMargin = parseInt(context.workspaceState.get("margin")) || 8;

      const input = Number(
        await vscode.window.showInputBox({
          ignoreFocusOut: false,
          title: `Set ${isFixed ? "width" : "margin"}`,
          value: isFixed ? savedWidth : savedMargin,
          valueSelection: undefined,
          validateInput: (value) => {
            const num = Number(value);
            if (Number.isInteger(num) && num >= 1) {
              return "";
            }
            return "Enter a positive number";
          },
        })
      );
      context.workspaceState.update(isFixed ? "width" : "margin", input);

      let longerHandlerPreference = undefined;

      for (const sel of textEditor.selections) {
        const document = textEditor.document;
        const range = sel.isEmpty
          ? document.getWordRangeAtPosition(sel.start) || sel
          : sel;
        const text = document.getText(range);

        let lines = text.split(/\r?\n/);
        const maxWidth = getMaxLineWidth(lines);

        if (isFixed && maxWidth > input) {
          if (!longerHandlerPreference)
            longerHandlerPreference = await vscode.window.showQuickPick(
              ["Omit", "Split with line breaks"],
              {
                title: `There are lines longer than ${input} characters. What do you want to do with them?`,
              }
            );

          if (longerHandlerPreference == "Split with line breaks")
            lines = chunkLines(lines, input).flat();
        }

        await textEditor.edit((editBuilder) =>
          editBuilder.replace(
            range,
            lines
              .map((line) =>
                fillRight(line, isFixed ? input : maxWidth + input)
              )
              .join("\n")
          )
        );
      }
    }
  );

  context.subscriptions.push(disposable);
}

function getMaxLineWidth(lines) {
  return lines.reduce((acc, line) => Math.max(acc, line.length), 0);
}

function chunkLines(lines, size) {
  return lines.map((line) => chunkSubstr(line, size));
}

function chunkSubstr(str, size) {
  if (str.length <= size) return str;

  const numChunks = Math.ceil(str.length / size);
  const chunks = new Array(numChunks);

  for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
    chunks[i] = str.substr(o, size);
  }

  return chunks;
}

function fillRight(str, width) {
  if (str.length >= width) return str;
  return (
    str +
    Array(Math.max(width - str.length, 0))
      .fill(" ")
      .join("")
  );
}

module.exports = {
  activate,
};
