import * as vscode from 'vscode';
import { StatusBarAlignment, StatusBarItem, window, workspace } from 'vscode';
import { countFileLines } from './fileCounter';
import { getLineCountInWorkspace } from './workspaceCounters';

let statusBarItem: StatusBarItem;

// updates the status bar item
function updateStatusBar(codeLinesFile: number, codeLinesWorkspace: number): void
{
    if (!statusBarItem)
    {
        statusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 101);
    }

    statusBarItem.text = `F: ${codeLinesFile} | W: ${codeLinesWorkspace}`;
    statusBarItem.tooltip = `File lines: ${codeLinesFile} | Workspace lines: ${codeLinesWorkspace}`;
    statusBarItem.show();
    console.log('Updating status bar');
}

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext)
{
    console.log('Activating extension');

    if (window.activeTextEditor)
    {
        updateStatusBar(
            countFileLines(window.activeTextEditor.document),
            getLineCountInWorkspace()
        );
    }
    else
    {
        updateStatusBar(0, getLineCountInWorkspace());
    }
    statusBarItem.show();

    // bind to onChangeActiveTextEditor event to update the status bar item
    workspace.onDidChangeTextDocument(event =>
    {
        updateStatusBar(
			countFileLines(event.document),
			getLineCountInWorkspace()
		);
    });

}

// This method is called when your extension is deactivated
export function deactivate()
{
    if (statusBarItem)
    {
        statusBarItem.dispose();
    }
}