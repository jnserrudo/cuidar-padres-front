import type { ReactNode } from "react";

const parseInline = (text: string) => {
  const parts: ReactNode[] = [];
  const pattern = /(\*\*.+?\*\*|https?:\/\/[^\s)]+|"(?:[^"\\]|\\.)+"|“[^”]+”)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const pushText = (value: string) => {
    if (!value) return;
    parts.push(value);
  };

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      pushText(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      const content = token.slice(2, -2);
      parts.push(<strong key={`bold-${match.index}-${content}`}>{content}</strong>);
    } else if (token.startsWith("http")) {
      parts.push(
        <a
          key={`link-${match.index}-${token}`}
          href={token}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-[color:var(--color-terracotta)] underline"
        >
          {token}
        </a>
      );
    } else if (
      (token.startsWith('"') && token.endsWith('"')) ||
      (token.startsWith("“") && token.endsWith("”"))
    ) {
      parts.push(<em key={`quote-${match.index}-${token}`}>{token}</em>);
    } else {
      pushText(token);
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    pushText(text.slice(lastIndex));
  }

  return parts.length ? parts : [text];
};

export const renderAnnouncementBody = (body: string) => {
  const lines = body.split(/\r?\n/);
  const blocks: ReactNode[] = [];
  let listItems: string[] = [];
  let paragraphLines: string[] = [];

  const flushParagraph = () => {
    if (!paragraphLines.length) return;
    const text = paragraphLines.join(" ").trim();
    if (text) {
      blocks.push(
        <p key={`p-${blocks.length}`} className="text-sm leading-7 text-slate-700">
          {parseInline(text)}
        </p>
      );
    }
    paragraphLines = [];
  };

  const flushList = () => {
    if (!listItems.length) return;
    const items = listItems;
    blocks.push(
      <ul key={`ul-${blocks.length}`} className="space-y-2 pl-5 text-sm text-slate-700">
        {items.map((item, index) => (
          <li key={`${item}-${index}`} className="list-disc">
            {parseInline(item)}
          </li>
        ))}
      </ul>
    );
    listItems = [];
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line) {
      flushList();
      flushParagraph();
      return;
    }

    const listMatch = line.match(/^[-*]\s+(.*)$/);
    if (listMatch) {
      flushParagraph();
      listItems.push(listMatch[1]);
      return;
    }

    flushList();
    paragraphLines.push(line);
  });

  flushList();
  flushParagraph();

  return <div className="space-y-4">{blocks}</div>;
};
