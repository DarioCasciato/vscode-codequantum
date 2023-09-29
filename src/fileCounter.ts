import { TextDocument } from 'vscode';

// The countFileLines function counts the number of lines in a file.
export function countFileLines(document: TextDocument)
{
    return document.lineCount;
}