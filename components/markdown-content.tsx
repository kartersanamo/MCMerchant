import ReactMarkdown from "react-markdown";

const proseClasses =
  "prose-description text-gray-300 [&_a]:text-brand-400 [&_a]:hover:underline [&_h1]:text-lg [&_h1]:font-semibold [&_h1]:text-gray-100 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-gray-100 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-gray-100 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_pre]:rounded-lg [&_pre]:bg-gray-950 [&_pre]:p-4 [&_pre]:overflow-x-auto [&_code]:rounded [&_code]:bg-gray-800 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-sm [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-600 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-400";

export function MarkdownContent({ content }: { content: string }) {
  return (
    <div className={`text-sm ${proseClasses}`}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
