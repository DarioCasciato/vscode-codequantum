// The countLinesInFolder function counts the number of lines in a folder.
// The getLineCountInWorkspace function counts the number of lines in the current workspace.

import { workspace, window } from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { allowedExtensions } from './languages';
import { countFileLines } from './fileCounter';

// The countLinesInFolder function counts the number of lines in a folder.
export function countLinesInFolder(folderPath: string): number
{
    let totalLines = 0;

    const files = fs.readdirSync(folderPath);
    for (const file of files)
    {
        const filePath = `${folderPath}/${file}`;
        const stats = fs.statSync(filePath);

        if (stats.isDirectory())
        {
            totalLines += countLinesInFolder(filePath);
        }
        else if (stats.isFile())
        {
            const ext = path.extname(file);

            if (allowedExtensions.includes(ext))
            {
                const content = fs.readFileSync(filePath, 'utf-8');
                const lines = content.split('\n').length;
                totalLines += lines;
            }
        }
    }

  return totalLines;
}

// The getLineCountInWorkspace function counts the number of lines in the current workspace.
export function getLineCountInWorkspace(): number
{
    const workspaceFolders = workspace.workspaceFolders;
    if (!workspaceFolders)
    {
        return 0;
    }

    let totalLines = 0;
    for (const folder of workspaceFolders)
    {
        const folderPath = folder.uri.fsPath;
        totalLines += countLinesInFolder(folderPath);
    }

    if (window.activeTextEditor)
    {
        totalLines += countFileLines(window.activeTextEditor.document);
    }

    console.log('Counting workspace lines');
    return totalLines;
}