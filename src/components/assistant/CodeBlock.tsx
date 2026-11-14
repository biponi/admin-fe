import { useEffect, useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useCopyToClipboard } from "../../hooks/use-copy-to-clipboard";
import { cn } from "../../lib/utils";

// Fine-grained shiki import — only these grammars ship in the lazy chunk
const LANGS = ["json", "typescript", "tsx", "javascript", "jsx", "bash", "sql", "python", "yaml"] as const;
type Lang = (typeof LANGS)[number];

type Highlighter = {
  codeToHtml: (
    code: string,
    options: {
      lang: string;
      themes: { light: string; dark: string };
      defaultColor: "light" | "dark";
    }
  ) => string;
};

let highlighterPromise: Promise<Highlighter> | null = null;

/** Lazily build a shiki highlighter with the bundled themes (first code block only). */
const getHighlighter = (): Promise<Highlighter> => {
  if (!highlighterPromise) {
    highlighterPromise = import("shiki").then(async (shiki) => {
      const h = await shiki.createHighlighter({
        themes: ["github-light", "github-dark"],
        langs: [...LANGS],
      });
      return {
        codeToHtml: (code, options) => h.codeToHtml(code, options),
      };
    });
    // Don't retry forever on a failed load
    highlighterPromise.catch(() => {
      highlighterPromise = null;
    });
  }
  return highlighterPromise;
};

const normalizeLang = (lang?: string): Lang | "text" => {
  const l = (lang || "").toLowerCase();
  if (l === "ts") return "typescript";
  if (l === "py") return "python";
  if (l === "sh" || l === "shell" || l === "zsh") return "bash";
  if (l === "yml") return "yaml";
  if ((LANGS as readonly string[]).includes(l)) return l as Lang;
  return "text";
};

/** Language label + copy bar shown above fenced code blocks. */
const CodeHeader = ({ language, code }: { language?: string; code: string }) => {
  const { isCopied, copyToClipboard } = useCopyToClipboard();
  return (
    <div className='aui-code-header-root mt-3 flex items-center justify-between rounded-t-xl border border-b-0 border-border/50 bg-muted/50 px-3.5 py-1.5 text-xs'>
      <span className='aui-code-header-language font-medium lowercase text-muted-foreground'>
        {language || "text"}
      </span>
      <button
        type='button'
        className='text-muted-foreground transition-colors hover:text-foreground'
        onClick={() => {
          if (code && !isCopied) copyToClipboard(code);
        }}
        aria-label='Copy code'
      >
        {isCopied ? (
          <CheckIcon className='h-4 w-4 animate-in zoom-in-50 fade-in duration-200 ease-out' />
        ) : (
          <CopyIcon className='h-4 w-4 animate-in zoom-in-75 fade-in duration-150' />
        )}
      </button>
    </div>
  );
};

interface CodeBlockProps {
  code: string;
  language?: string;
  /** Show the language label + copy bar (fenced markdown blocks) */
  withHeader?: boolean;
  className?: string;
}

/**
 * Read-only code block with lazy shiki highlighting. Renders plain <pre>
 * until the highlighter resolves, so streaming and first paint stay cheap.
 * Theme follows the app's dark class via shiki's dual-theme CSS variables.
 */
const CodeBlock = ({ code, language, withHeader, className }: CodeBlockProps) => {
  const lang = normalizeLang(language);
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    if (lang === "text") return;
    let cancelled = false;
    getHighlighter()
      .then((h) => {
        if (cancelled) return;
        setHtml(
          h.codeToHtml(code, {
            lang,
            themes: { light: "github-light", dark: "github-dark" },
            defaultColor: "light",
          })
        );
      })
      .catch(() => {
        // Plain <pre> fallback stays
      });
    return () => {
      cancelled = true;
    };
  }, [code, lang]);

  const body = (
    <>
      {withHeader && <CodeHeader language={language} code={code} />}
      {!html ? (
        <pre
          className={cn(
            "overflow-x-auto rounded-lg bg-muted/50 p-3.5 text-[13px] leading-relaxed",
            withHeader ? "rounded-t-none rounded-b-xl border border-t-0 border-border/50" : "",
            className
          )}
        >
          <code>{code}</code>
        </pre>
      ) : (
        <div
          className={cn(
            "aui-shiki overflow-x-auto rounded-lg text-[13px] leading-relaxed [&_pre]:bg-muted/50 [&_pre]:p-3.5",
            withHeader ? "rounded-t-none rounded-b-xl border border-t-0 border-border/50 [&_pre]:rounded-t-none [&_pre]:border-0 [&_pre]:border-t-0" : "",
            className
          )}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </>
  );

  return withHeader ? <div className='aui-code-block'>{body}</div> : body;
};

export default CodeBlock;
