import * as vscode from 'vscode';
import { StatusBarAlignment, StatusBarItem, window, workspace } from 'vscode';
import { countFileLines } from './fileCounter';
import { getLineCountInWorkspace } from './workspaceCounters';

let statusBarItem: StatusBarItem;

// Get the status bar alignment from the configuration
function getStatusBarAlignment(): StatusBarAlignment {
    let alignmentSetting = vscode.workspace.getConfiguration('codequantum').get<string>('statusBarAlignment') ?? 'right';
    return alignmentSetting === 'left' ? StatusBarAlignment.Left : StatusBarAlignment.Right;
}

// Update the status bar item with the file and workspace line counts
function updateStatusBar(codeLinesFile: number, codeLinesWorkspace: number): void {
    if (!statusBarItem) {
        let alignment = getStatusBarAlignment();
        statusBarItem = window.createStatusBarItem(alignment, alignment === StatusBarAlignment.Left ? 500 : 101);
    }

    statusBarItem.text = `F: ${codeLinesFile} | W: ${codeLinesWorkspace}`;
    statusBarItem.tooltip = `File lines: ${codeLinesFile} | Workspace lines: ${codeLinesWorkspace}`;
    statusBarItem.show();
}


// Called when the extension is activated
export function activate(context: vscode.ExtensionContext)
{
    let workspaceLineCount = getLineCountInWorkspace();

    // Update the status bar
    function updateEditorLines()
    {
        let activeEditor = window.activeTextEditor;
        workspaceLineCount = getLineCountInWorkspace();
        if (activeEditor)
        {
            updateStatusBar(
                countFileLines(activeEditor.document),
                (workspaceLineCount + countFileLines(activeEditor.document))
            );
        }
        else
        {
            updateStatusBar(0, workspaceLineCount);
        }
    }

    // Update the status bar for the active editor
    updateEditorLines();

    console.log('CodeQuantum is now active!');

    // Update the status bar when the active editor changes
    workspace.onDidChangeTextDocument(event =>
    {
        updateStatusBar(
            countFileLines(event.document),
            workspaceLineCount + countFileLines(event.document)
        );
    });

    // Update the status bar when a new file is created, deleted, or renamed
    workspace.onDidCreateFiles(event =>
    {
        updateEditorLines();
    });
    workspace.onDidDeleteFiles(event =>
    {
        updateEditorLines();
    });
    workspace.onDidRenameFiles(event =>
    {
        updateEditorLines();
    });

    // Update the status bar when a file is saved
    workspace.onDidSaveTextDocument(event =>
    {
        updateEditorLines();
    });

    window.onDidChangeActiveTextEditor(event =>
    {
        updateEditorLines();
    });

    // Update the status bar when the configuration changes
    workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration('codequantum.statusBarAlignment'))
        {
            let alignment = getStatusBarAlignment();

            if (statusBarItem)
            {
                statusBarItem.dispose();
            }

            if (alignment == StatusBarAlignment.Left)
            {
                statusBarItem = window.createStatusBarItem(alignment, 500);
            }
            else
            {
                statusBarItem = window.createStatusBarItem(alignment, 101);
            }

            updateEditorLines();
        }
    });
}


// Called when the extension is deactivated
export function deactivate()
{
    statusBarItem?.dispose();
}