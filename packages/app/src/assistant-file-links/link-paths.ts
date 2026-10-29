import { buildAbsoluteExplorerPath } from "@/utils/explorer-paths";
import { isHomeRelativePath, normalizeInlinePathTarget, type InlinePathTarget } from "./parse";

export interface FileLinkPaths {
  /** Relative to the workspace, or absolute for a file outside it. */
  relative: string;
  absolute: string;
}

/** The copyable and revealable paths for a resolved file link. */
export function fileLinkPaths(target: InlinePathTarget, workspaceRoot: string): FileLinkPaths {
  // Only the daemon's machine knows what `~` is; desktop expands it on reveal.
  if (isHomeRelativePath(target.path)) {
    return { relative: target.path, absolute: target.path };
  }
  const relative = normalizeInlinePathTarget(target.path, workspaceRoot)?.file ?? target.path;
  return { relative, absolute: buildAbsoluteExplorerPath({ workspaceRoot, entryPath: relative }) };
}
