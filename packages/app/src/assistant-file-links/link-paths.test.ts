import { describe, expect, it } from "vitest";
import { fileLinkPaths } from "./link-paths";

const WORKSPACE = "/Users/test/project";

describe("fileLinkPaths", () => {
  it("makes a resolved absolute path inside the workspace relative", () => {
    expect(fileLinkPaths({ raw: "dumm.md", path: `${WORKSPACE}/docs/dumm.md` }, WORKSPACE)).toEqual(
      { relative: "docs/dumm.md", absolute: `${WORKSPACE}/docs/dumm.md` },
    );
  });

  it("anchors a workspace-relative path at the workspace root", () => {
    expect(
      fileLinkPaths({ raw: "src/app.ts:12", path: "src/app.ts", lineStart: 12 }, WORKSPACE),
    ).toEqual({ relative: "src/app.ts", absolute: `${WORKSPACE}/src/app.ts` });
  });

  it("keeps a file outside the workspace absolute", () => {
    expect(fileLinkPaths({ raw: "/tmp/outside.txt", path: "/tmp/outside.txt" }, WORKSPACE)).toEqual(
      { relative: "/tmp/outside.txt", absolute: "/tmp/outside.txt" },
    );
  });
});
