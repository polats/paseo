import { useCallback, type ReactElement } from "react";
import * as Clipboard from "expo-clipboard";
import { useTranslation } from "react-i18next";
import { FileActionsContextMenuContent } from "@/components/file-actions-menu";
import { useToast } from "@/contexts/toast-context";
import { useIsLocalDaemon } from "@/hooks/use-is-local-daemon";
import { openDesktopTarget, useDesktopOpenTargets } from "@/workspace/desktop-open-targets";
import { fileLinkPaths, type FileLinkPaths } from "./link-paths";
import { useAssistantFileLinkResolverContext } from "./provider";
import type { AssistantFileLinkSource } from "./resolver";
import type { UseFileLinkResult } from "./use-file-link";

/**
 * Right-click menu for a file link in an agent message. It reuses the file
 * explorer's actions, so the link offers the same Reveal in Finder the tree does.
 */
export function FileLinkContextMenuContent({
  link,
  source,
}: {
  link: UseFileLinkResult;
  source: AssistantFileLinkSource;
}): ReactElement | null {
  const { t } = useTranslation();
  const toast = useToast();
  const { configRef } = useAssistantFileLinkResolverContext();
  const { serverId = "", workspaceRoot = "" } = configRef.current;
  const isLocalDaemon = useIsLocalDaemon(serverId);
  const { targets } = useDesktopOpenTargets({ isLocalExecution: isLocalDaemon });
  const fileManagerTarget = targets.find((target) => target.kind === "file-manager");

  // Copy and reveal need the path itself, which a bare filename only gets
  // after the daemon finds it.
  const resolvePaths = useCallback(async (): Promise<FileLinkPaths | null> => {
    const target = await link.resolveTarget();
    if (!target) {
      toast.error(t("common.errors.noFileFound", { token: source.text ?? source.href }));
      return null;
    }
    return fileLinkPaths(target, workspaceRoot);
  }, [link, source, t, toast, workspaceRoot]);

  const handleOpenFile = useCallback(() => link.open(source, "preferred"), [link, source]);
  const handleOpenToSide = useCallback(() => link.open(source, "side"), [link, source]);
  const handleCopyPath = useCallback(async () => {
    const paths = await resolvePaths();
    if (paths) await Clipboard.setStringAsync(paths.absolute);
  }, [resolvePaths]);
  const handleCopyRelativePath = useCallback(async () => {
    const paths = await resolvePaths();
    if (paths) await Clipboard.setStringAsync(paths.relative);
  }, [resolvePaths]);
  const handleReveal = useCallback(async () => {
    if (!fileManagerTarget) return;
    const paths = await resolvePaths();
    if (!paths) return;
    try {
      await openDesktopTarget({
        editorId: fileManagerTarget.id,
        workspacePath: workspaceRoot,
        filePath: paths.absolute,
      });
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : t("workspace.fileExplorer.errors.revealFailed"),
      );
    }
  }, [fileManagerTarget, resolvePaths, t, toast, workspaceRoot]);

  return (
    <FileActionsContextMenuContent
      fileKind="file"
      onOpenFile={handleOpenFile}
      onOpenToSide={handleOpenToSide}
      onCopyPath={handleCopyPath}
      onCopyRelativePath={handleCopyRelativePath}
      onReveal={fileManagerTarget ? handleReveal : undefined}
      revealTargetName={fileManagerTarget?.label}
      testIDPrefix="assistant-file-link"
    />
  );
}
