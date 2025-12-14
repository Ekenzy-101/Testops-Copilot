import {
  copyToClipboard,
  parseDefects,
  parseTestCases,
  unwrapMarkdownCodeFence,
  wrapInMarkdownCodeFence,
} from "./helpers";

describe("Helpers", () => {
  describe("copyToClipboard", () => {
    it("should not copy to clipboard if navigator does not exist", async () => {
      await expect(copyToClipboard("test", "en")).resolves.toBe(false);
    });

    it("should copy to clipboard if navigator exist", async () => {
      Object.defineProperty(window.navigator, "clipboard", {
        value: {
          readText: async () => "test",
          writeText: async (value: string) => console.log(value),
        },
        configurable: true,
      });
      await expect(copyToClipboard("test", "en")).resolves.toBe(true);
      await expect(navigator.clipboard.readText()).resolves.toBe("test");
    });
  });

  describe("parseDefects", () => {
    it("parses a single defect line", () => {
      const input = "D1|Login fails|High|Auth|bug,ui";
      const result = parseDefects(input);
      expect(result).toEqual([
        {
          id: "D1",
          title: "Login fails",
          severity: "High",
          area: "Auth",
          tags: ["bug", "ui"],
          component: "",
          description: "",
        },
      ]);
    });

    it("parses multiple defect lines", () => {
      const input = `
      D1|Login fails|High|Auth|bug
      D2|Crash on load|Critical|Core|crash, regression
    `;
      const result = parseDefects(input);
      expect(result).toHaveLength(2);
      expect(result[1].id).toBe("D2");
      expect(result[1].tags).toEqual(["crash", "regression"]);
    });

    it("trims whitespace from all fields", () => {
      const input = " D1 |  Login fails  | High | Auth | bug , ui ";
      const result = parseDefects(input);
      expect(result[0]).toMatchObject({
        id: "D1",
        title: "Login fails",
        severity: "High",
        area: "Auth",
        tags: ["bug", "ui"],
      });
    });

    it("handles missing optional fields", () => {
      const input = "D1|Title only";
      const result = parseDefects(input);
      expect(result).toEqual([
        {
          id: "D1",
          title: "Title only",
          severity: "",
          area: "",
          tags: [],
          component: "",
          description: "",
        },
      ]);
    });

    it("returns empty tags array when tags are missing", () => {
      const input = "D1|Login fails|High|Auth|";
      const result = parseDefects(input);
      expect(result[0].tags).toEqual([]);
    });

    it("filters out empty lines", () => {
      const input = "\n\nD1|Login fails|High|Auth|bug\n\n";
      const result = parseDefects(input);
      expect(result).toHaveLength(1);
    });

    it("filters out records without a title", () => {
      const input = "D1||High|Auth|bug";
      const result = parseDefects(input);
      expect(result).toEqual([]);
    });

    it("returns empty array for empty input", () => {
      expect(parseDefects("")).toEqual([]);
    });
  });

  describe("parseTestCases", () => {
    it("splits test cases by separator lines", () => {
      const input = `
      Test case 1
      step A
      # -----
      Test case 2
      step B
    `;
      const result = parseTestCases(input);

      expect(result).toHaveLength(2);
      expect(result[0]).toContain("Test case 1");
      expect(result[1]).toContain("Test case 2");
    });

    it("handles multiple separators", () => {
      const input = `
      TC1
      # -----
      # -----
      TC2
    `;
      const result = parseTestCases(input);
      expect(result).toHaveLength(2);
    });

    it("filters out empty test cases", () => {
      const input = `
      # -----
      TC1
      # -----
    `;
      const result = parseTestCases(input);
      expect(result).toEqual(["\n      TC1\n"]);
    });

    it("returns single test case when no separator is present", () => {
      const input = "Only one test case";
      const result = parseTestCases(input);
      expect(result).toEqual(["Only one test case"]);
    });

    it("returns empty array for empty input", () => {
      expect(parseTestCases("")).toEqual([]);
    });
  });

  describe("unwrapMarkdownCodeFence", () => {
    it("should unwrap fenced markdown with language", () => {
      const input = `
\`\`\`ts
const a = 1;
\`\`\`
`;
      expect(unwrapMarkdownCodeFence(input)).toBe("const a = 1;");
    });

    it("should unwrap fenced markdown without language", () => {
      const input = `
\`\`\`
hello world
\`\`\`
`;
      expect(unwrapMarkdownCodeFence(input)).toBe("hello world");
    });

    it("should handle trailing spaces in fences", () => {
      const input = `
\`\`\`js   
console.log("ok");
\`\`\`   
`;
      expect(unwrapMarkdownCodeFence(input)).toBe('console.log("ok");');
    });

    it("should handle Windows line endings", () => {
      const input = "\r\n```js\r\nlet x = 1;\r\n```\r\n";
      expect(unwrapMarkdownCodeFence(input)).toBe("let x = 1;");
    });

    it("should return original content if not fenced", () => {
      const input = "plain text";
      expect(unwrapMarkdownCodeFence(input)).toBe(input);
    });

    it("should not unwrap inline code", () => {
      const input = "`inline code`";
      expect(unwrapMarkdownCodeFence(input)).toBe(input);
    });

    it("should not unwrap partial fences", () => {
      const input = "```js\ncode";
      expect(unwrapMarkdownCodeFence(input)).toBe(input);
    });

    it("should preserve inner indentation", () => {
      const input = `
\`\`\`
line one
  line two
\`\`\`
`;
      expect(unwrapMarkdownCodeFence(input)).toBe("line one\n  line two");
    });
  });

  describe("wrapInMarkdownCodeFence", () => {
    it("should return an empty code fence when content is empty", () => {
      expect(wrapInMarkdownCodeFence("")).toBe("```\n```");
    });

    it("should return already fenced content unchanged", () => {
      const content = "```js\nconsole.log('hi')\n```";
      expect(wrapInMarkdownCodeFence(content)).toBe(content);
    });

    it("should wrap valid JSON with json code fence and formats it", () => {
      const content = '{"a":1,"b":2}';
      expect(wrapInMarkdownCodeFence(content)).toBe(
        '```json\n{\n  "a": 1,\n  "b": 2\n}\n```',
      );
    });

    it("should wrap valid YAML with yaml code fence", () => {
      const content = `
a: 1
b: 2
    `;
      expect(wrapInMarkdownCodeFence(content)).toBe(
        "```yaml\na: 1\nb: 2\n\n```",
      );
    });

    it("should wrap Python-like content with python code fence", () => {
      const content = `import package
def foo():
    print("hello", package.run())`;
      expect(wrapInMarkdownCodeFence(content)).toBe(
        '```python\nimport package\ndef foo():\n    print("hello", package.run())\n```',
      );
    });

    it("should fall back to a plain code fence for unknown content", () => {
      const content = "some random text";
      expect(wrapInMarkdownCodeFence(content)).toBe(
        "```\nsome random text\n```",
      );
    });

    it("should not treat invalid JSON as YAML", () => {
      const content = '{"a": }';
      expect(wrapInMarkdownCodeFence(content)).toBe("```yaml\na: null\n\n```");
    });

    it("should not treat invalid YAML as YAML", () => {
      const content = "a: [";
      expect(wrapInMarkdownCodeFence(content)).toBe("```\na: [\n```");
    });
  });
});
