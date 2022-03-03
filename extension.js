const vscode = require("vscode");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  let disposable = vscode.commands.registerCommand(
    "column-maker.setColumnWidth",
    async function () {
      const savedWidth = context.workspaceState.get("columnWidth") || "0";
      const width = await vscode.window.showInputBox({
        ignoreFocusOut: false,
        title: "Set column width",
        value: savedWidth,
        valueSelection: undefined,
        validateInput: function (value) {
          const num = Number(value);
          if (Number.isInteger(num) && num >= 0) {
            return "";
          }
          return "Enter an integer greater or equal to zero";
        },
      });
      context.workspaceState.update("columnWidth", width);
    }
  );

  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand(
    "column-maker.setColumnMargin",
    async function () {
      const savedMargin = context.workspaceState.get("columnMargin") || "8";
      const margin = await vscode.window.showInputBox({
        ignoreFocusOut: false,
        title: "Set column margin",
        value: savedMargin,
        valueSelection: undefined,
        validateInput: function (value) {
          const num = Number(value);
          if (Number.isInteger(num) && num >= 0) {
            return "";
          }
          return "Enter an integer greater or equal to zero";
        },
      });
      context.workspaceState.update("columnMargin", margin);
    }
  );

  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand(
    "column-maker.createColumn",
    function () {
      const width = parseInt(context.workspaceState.get("columnWidth")) || 0;
      const margin = parseInt(context.workspaceState.get("columnMargin")) || 8;

      const editor = vscode.window.activeTextEditor;

      if (editor) {
        const document = editor.document;
        editor.edit(async function (editBuilder) {
          editor.selections.forEach((sel) => {
            const range = sel.isEmpty
              ? document.getWordRangeAtPosition(sel.start) || sel
              : sel;
            let text = document.getText(range);

            const maxWidth = getMaxLineWidth(text);
            editBuilder.replace(
              range,
              addSpaceSinceWidth(text, Math.max(width, maxWidth + margin))
            );
          });
        });
      }
    }
  );

  context.subscriptions.push(disposable);
}

function getMaxLineWidth(str) {
  return str.split("\n").reduce((acc, curr) => Math.max(acc, curr.length), 0);
}

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

module.exports = {
  activate,
};
