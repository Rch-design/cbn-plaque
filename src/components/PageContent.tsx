/** Renders admin page content: ## h2, ### h3, paragraphs */
export default function PageContent({ content }: { content: string }) {
  if (!content.trim()) {
    return <p className="text-gray-400">İçerik bulunamadı.</p>;
  }

  const blocks = content.split(/\n\n+/);

  return (
    <div className="space-y-5 text-gray-700 leading-relaxed">
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={i} className="text-lg font-bold text-gray-900">
              {trimmed.slice(4)}
            </h3>
          );
        }

        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={i} className="text-xl font-extrabold text-gray-900 sm:text-2xl">
              {trimmed.slice(3)}
            </h2>
          );
        }

        if (trimmed.startsWith('- ')) {
          const items = trimmed.split('\n').filter((l) => l.startsWith('- '));
          return (
            <ul key={i} className="list-inside list-disc space-y-1 pl-1">
              {items.map((item, j) => (
                <li key={j}>{item.slice(2)}</li>
              ))}
            </ul>
          );
        }

        return (
          <p key={i} className="text-gray-700">
            {trimmed}
          </p>
        );
      })}
    </div>
  );
}
