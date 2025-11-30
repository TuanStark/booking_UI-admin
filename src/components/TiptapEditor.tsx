import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { Button } from './ui/button';
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    List,
    ListOrdered,
    Quote,
    Heading1,
    Heading2,
    Undo,
    Redo,
} from 'lucide-react';
import { useEffect } from 'react';

interface TiptapEditorProps {
    value: string;
    onChange: (value: string) => void;
}

const TiptapEditor = ({ value, onChange }: TiptapEditorProps) => {
    const editor = useEditor({
        extensions: [StarterKit, Underline],
        content: value,
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4 max-w-none',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    useEffect(() => {
        if (!editor) return;

        // Only update content if the editor is empty and value is provided
        // This handles the initial data load for editing
        if (editor.isEmpty && value && value !== '<p></p>') {
            editor.commands.setContent(value);
        }
    }, [value, editor]);

    if (!editor) {
        return null;
    }

    return (
        <div className="border rounded-md bg-background">
            <div className="border-b p-2 flex flex-wrap gap-1 bg-muted/50">
                <Button
                    variant={editor.isActive('bold') ? 'default' : 'ghost'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }}
                    title="Bold"
                >
                    <Bold className="h-4 w-4" />
                </Button>
                <Button
                    variant={editor.isActive('italic') ? 'default' : 'ghost'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }}
                    title="Italic"
                >
                    <Italic className="h-4 w-4" />
                </Button>
                <Button
                    variant={editor.isActive('underline') ? 'default' : 'ghost'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleUnderline().run(); }}
                    title="Underline"
                >
                    <UnderlineIcon className="h-4 w-4" />
                </Button>
                <Button
                    variant={editor.isActive('strike') ? 'default' : 'ghost'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleStrike().run(); }}
                    title="Strikethrough"
                >
                    <Strikethrough className="h-4 w-4" />
                </Button>
                <div className="w-px h-6 bg-border mx-1 self-center" />
                <Button
                    variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 1 }).run(); }}
                    title="Heading 1"
                >
                    <Heading1 className="h-4 w-4" />
                </Button>
                <Button
                    variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 2 }).run(); }}
                    title="Heading 2"
                >
                    <Heading2 className="h-4 w-4" />
                </Button>
                <div className="w-px h-6 bg-border mx-1 self-center" />
                <Button
                    variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run(); }}
                    title="Bullet List"
                >
                    <List className="h-4 w-4" />
                </Button>
                <Button
                    variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run(); }}
                    title="Ordered List"
                >
                    <ListOrdered className="h-4 w-4" />
                </Button>
                <Button
                    variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBlockquote().run(); }}
                    title="Blockquote"
                >
                    <Quote className="h-4 w-4" />
                </Button>
                <div className="w-px h-6 bg-border mx-1 self-center" />
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => { e.preventDefault(); editor.chain().focus().undo().run(); }}
                    disabled={!editor.can().undo()}
                    title="Undo"
                >
                    <Undo className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => { e.preventDefault(); editor.chain().focus().redo().run(); }}
                    disabled={!editor.can().redo()}
                    title="Redo"
                >
                    <Redo className="h-4 w-4" />
                </Button>
            </div>
            <EditorContent editor={editor} />
        </div>
    );
};

export default TiptapEditor;
