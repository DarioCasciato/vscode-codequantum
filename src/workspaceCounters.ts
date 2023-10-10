// The countLinesInFolder function counts the number of lines in a folder.
// The getLineCountInWorkspace function counts the number of lines in the current workspace.

import { workspace, window } from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { allowedExtensions } from './languages';
import { countFileLines } from './fileCounter';
import ignore from 'ignore';


function getGitIgnoreRules(folderPath: string) {
    const gitIgnorePath = path.join(folderPath, '.gitignore');
    const ig = ignore();

    if (fs.existsSync(gitIgnorePath)) {
        const gitIgnoreContent = fs.readFileSync(gitIgnorePath, 'utf-8');
        ig.add(gitIgnoreContent);
    }

    return ig;
}



// The countLinesInFolder function counts the number of lines in a folder.
export function countLinesInFolder(folderPath: string): number {
    let totalLines = 0;
    const ig = getGitIgnoreRules(folderPath);

    const files = fs.readdirSync(folderPath);
    for (const file of files) {
        const filePath = path.join(folderPath, file); // Use path.join for more reliable path joining

        if (ig.ignores(file)) { // Check if the file/folder should be ignored
            continue;
        }

        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
            totalLines += countLinesInFolder(filePath);
        } else if (stats.isFile()) {
            const ext = path.extname(file);

            if (allowedExtensions.includes(ext)) {
                const content = fs.readFileSync(filePath, 'utf-8');
                const lines = content.split('\n').length;
                // if file is not the active file, add lines to total
                if(window.activeTextEditor)
                {
                    if(window.activeTextEditor.document.fileName !== filePath)
                    {
                        totalLines += lines;
                    }
                }
                else
                {
                    totalLines += lines;
                }
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

    return totalLines;
}