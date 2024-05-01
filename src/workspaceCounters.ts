// The countLinesInFolder function counts the number of lines in a folder.
// The getLineCountInWorkspace function counts the number of lines in the current workspace.

import { workspace, window } from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { allowedExtensions } from './languages';
import { countFileLines } from './fileCounter';
import ignore from 'ignore';
import { minimatch } from 'minimatch';


function getGitIgnoreRules(folderPath: string) {
    const gitIgnorePath = path.join(folderPath, '.gitignore');
    const ig = ignore();

    if (fs.existsSync(gitIgnorePath)) {
        const gitIgnoreContent = fs.readFileSync(gitIgnorePath, 'utf-8');
        ig.add(gitIgnoreContent);
    }

    return ig;
}

// Function to get the current configuration for 'codequantum'
function getConfiguration() {
    // This will fetch the settings from the workspace configuration
    const config = workspace.getConfiguration('codequantum');
    const excludePatterns = config.get<string[]>('excludePatterns', []);
    return {
        excludePatterns
    };
}


// The countLinesInFolder function counts the number of lines in a folder.
export function countLinesInFolder(folderPath: string, baseFolderPath?: string): number {
    let totalLines = 0;
    const ig = getGitIgnoreRules(baseFolderPath || folderPath);
    const config = getConfiguration();  // Fetch workspace configuration

    const files = fs.readdirSync(folderPath);
    for (const file of files) {
        const filePath = path.join(folderPath, file);
        const relativePath = baseFolderPath ? path.relative(baseFolderPath, filePath) : file;

        // Check against .gitignore rules and exclude patterns from the workspace settings
        if (ig.ignores(relativePath) || config.excludePatterns.some(pattern => minimatch(relativePath, pattern))) {
            continue;
        }

        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            totalLines += countLinesInFolder(filePath, baseFolderPath || folderPath);
        } else if (stats.isFile()) {
            const ext = path.extname(file);
            if (allowedExtensions.includes(ext)) {
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

    return totalLines;
}