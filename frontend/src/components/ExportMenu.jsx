import { Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { toast } from "sonner";

const ExportMenu = ({ editor, title }) => {
  const exportAsText = () => {
    const text = editor.getText();
    const blob = new Blob([text], { type: 'text/plain' });
    downloadFile(blob, `${title}.txt`);
    toast.success("Exported as TXT");
  };

  const exportAsMarkdown = () => {
    let markdown = '';
    const json = editor.getJSON();
    
    const processNode = (node) => {
      if (node.type === 'heading') {
        const level = node.attrs?.level || 1;
        const prefix = '#'.repeat(level);
        const text = node.content?.map(n => n.text || '').join('') || '';
        markdown += `${prefix} ${text}\n\n`;
      } else if (node.type === 'paragraph') {
        let text = '';
        node.content?.forEach(n => {
          if (n.type === 'text') {
            let formattedText = n.text || '';
            if (n.marks) {
              n.marks.forEach(mark => {
                if (mark.type === 'bold') formattedText = `**${formattedText}**`;
                if (mark.type === 'italic') formattedText = `*${formattedText}*`;
                if (mark.type === 'strike') formattedText = `~~${formattedText}~~`;
              });
            }
            text += formattedText;
          }
        });
        markdown += `${text}\n\n`;
      } else if (node.type === 'bulletList') {
        node.content?.forEach(item => {
          const text = item.content?.[0]?.content?.map(n => n.text || '').join('') || '';
          markdown += `- ${text}\n`;
        });
        markdown += '\n';
      } else if (node.type === 'orderedList') {
        node.content?.forEach((item, index) => {
          const text = item.content?.[0]?.content?.map(n => n.text || '').join('') || '';
          markdown += `${index + 1}. ${text}\n`;
        });
        markdown += '\n';
      }
    };
    
    json.content?.forEach(processNode);
    
    const blob = new Blob([markdown], { type: 'text/markdown' });
    downloadFile(blob, `${title}.md`);
    toast.success("Exported as Markdown");
  };

  const exportAsHTML = () => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      line-height: 1.7;
    }
    h1, h2, h3 { margin-top: 1.5rem; margin-bottom: 0.5rem; }
    p { margin: 0.5rem 0; }
  </style>
</head>
<body>
  ${editor.getHTML()}
</body>
</html>`;
    
    const blob = new Blob([html], { type: 'text/html' });
    downloadFile(blob, `${title}.html`);
    toast.success("Exported as HTML");
  };

  const exportAsPDF = () => {
    try {
      const originalTitle = document.title;
      // Change title temporarily so the default saved PDF filename is correct
      document.title = title;
      
      window.print();
      
      // Restore original title
      document.title = originalTitle;

      toast.success("Exported as PDF");
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error("Failed to open print dialog");
    }
  };

  const downloadFile = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          data-testid="export-menu-button"
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem data-testid="export-txt" onClick={exportAsText}>
          Export as TXT
        </DropdownMenuItem>
        <DropdownMenuItem data-testid="export-md" onClick={exportAsMarkdown}>
          Export as Markdown
        </DropdownMenuItem>
        <DropdownMenuItem data-testid="export-html" onClick={exportAsHTML}>
          Export as HTML
        </DropdownMenuItem>
        <DropdownMenuItem data-testid="export-pdf" onClick={exportAsPDF}>
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportMenu;