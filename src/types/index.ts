import * as fs from 'fs';

// Must be synchronized with readdir-enhanced
export interface Entry extends fs.Stats {
	path: string;
	depth: number;
}

export type EntryItem = string | Entry;

export type Pattern = string;
export type PatternRe = RegExp;
export type PatternsGroup = Record<string, Pattern[]>;
