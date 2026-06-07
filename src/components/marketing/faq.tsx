export function FAQ({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <div className="w-full space-y-2">
      {items.map((item, index) => (
        <details
          key={index}
          className="group rounded-lg border px-4 py-2 open:bg-muted/30"
        >
          <summary className="cursor-pointer font-medium text-sm py-2 list-none flex justify-between items-center">
            {item.question}
            <span className="text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <p className="pb-3 text-sm text-muted-foreground">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
