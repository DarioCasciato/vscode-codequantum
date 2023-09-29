import * as vscode from 'vscode';
import { StatusBarAlignment, StatusBarItem, window, workspace } from 'vscode';
import { countFileLines } from './fileCounter';
import { getLineCountInWorkspace } from './workspaceCounters';

let statusBarItem: StatusBarItem;

function getStatusBarAlignment(): StatusBarAlignment
{
    let alignmentSetting = vscode.workspace.getConfiguration('codequantum').get<string>('statusBarAlignment');
    return alignmentSetting === 'left' ? StatusBarAlignment.Left : StatusBarAlignment.Right;
}

// updates the status bar item
function updateStatusBar(codeLinesFile: number, codeLinesWorkspace: number): void
{
    if (!statusBarItem)
    {
        let alignment = getStatusBarAlignment();

        if (alignment == StatusBarAlignment.Left)
            statusBarItem = window.createStatusBarItem(alignment, 500);
        else
            statusBarItem = window.createStatusBarItem(alignment, 101);
    }

    statusBarItem.text = `F: ${codeLinesFile} | W: ${codeLinesWorkspace}`;
    statusBarItem.tooltip = `File lines: ${codeLinesFile} | Workspace lines: ${codeLinesWorkspace}`;
    statusBarItem.show();
}

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext)
{
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

    console.log('CodeQuantum is now active!');


    // bind to onDidChangeTextDocument event to update the status bar item
    workspace.onDidChangeTextDocument(event =>
    {
        updateStatusBar(
			countFileLines(event.document),
			getLineCountInWorkspace()
		);
    });

    // bind to onChangeActiveTextEditor event to update the status bar item
    window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            updateStatusBar(countFileLines(editor.document), getLineCountInWorkspace());
        }
    });

    // Listen for Configuration Changes
    workspace.onDidChangeConfiguration(event =>
        {
            if (event.affectsConfiguration('codequantum.statusBarAlignment'))
            {
                let alignment = getStatusBarAlignment();

                if (statusBarItem) statusBarItem.dispose();

                if (alignment == StatusBarAlignment.Left)
                    statusBarItem = window.createStatusBarItem(alignment, 500);
                else
                    statusBarItem = window.createStatusBarItem(alignment, 101);

                if(window.activeTextEditor)
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
            }
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