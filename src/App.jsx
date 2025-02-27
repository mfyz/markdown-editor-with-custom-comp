import { MDXEditor } from '@mdxeditor/editor'
import {
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  toolbarPlugin,
  BoldItalicUnderlineToggles,
  UndoRedo,
  InsertThematicBreak,
  ListsToggle,
  CreateLink,
  linkPlugin,
  linkDialogPlugin,
  directivesPlugin,
  GenericDirectiveEditor,
  Button,
  usePublisher,
  insertDirective$,
  NestedLexicalEditor
} from '@mdxeditor/editor'
import { useState, useRef, useEffect } from 'react'

import '@mdxeditor/editor/style.css'

// Simple color picker component
const SimpleColorPicker = ({ onSelectColor }) => {
  const colors = [
    'red', 'blue', 'green', 'purple', 'orange', 
    'pink', 'teal', 'brown', 'gray', 'black'
  ];
  
  return (
    <div style={{ 
      padding: '10px', 
      backgroundColor: 'white', 
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)', 
      borderRadius: '4px',
      width: '150px'
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '5px' }}>
        {colors.map(color => (
          <div 
            key={color}
            onClick={() => onSelectColor(color)}
            style={{ 
              backgroundColor: color, 
              width: '20px', 
              height: '20px', 
              borderRadius: '2px',
              cursor: 'pointer',
              border: '1px solid #ddd'
            }}
            title={color}
          />
        ))}
      </div>
    </div>
  );
};

// Simple implementation that renders colored text and allows editing
const ColorDirectiveDescriptor = {
  name: 'color',
  testNode(node) {
    return node.name === 'color'
  },
  attributes: ['color'],
  hasChildren: true,
  Editor: (props) => {
    const [showColorPicker, setShowColorPicker] = useState(false);
    const colorPickerRef = useRef(null);
    const swatchRef = useRef(null);
    const currentColor = props.mdastNode.attributes.color || 'red';
    
    // Close color picker when clicking outside
    useEffect(() => {
      if (!showColorPicker) return;
      
      const handleClickOutside = (event) => {
        if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
          setShowColorPicker(false);
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [showColorPicker]);
    
    const handleColorChange = (newColor) => {
      console.log('Changing color from', currentColor, 'to', newColor);
      
      // Update the color attribute in the directive
      if (props.updateAttributes) {
        props.updateAttributes({ color: newColor });
      }
      
      setShowColorPicker(false);
    };
    
    // Create a color swatch button that appears next to the text
    const ColorSwatch = () => (
      <button
        ref={swatchRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          console.log('Opening color picker for', props.mdastNode);
          setShowColorPicker(true);
        }}
        style={{
          width: '16px',
          height: '16px',
          backgroundColor: currentColor,
          border: '1px solid #ccc',
          borderRadius: '3px',
          cursor: 'pointer',
          padding: 0,
          marginLeft: '4px',
          verticalAlign: 'middle',
          display: 'inline-block',
          position: 'relative'
        }}
        title="Change color"
      />
    );
    
    return (
      <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
        <span style={{ color: currentColor }}>
          <GenericDirectiveEditor {...props} />
        </span>
        <ColorSwatch />
        
        {showColorPicker && (
          <div 
            ref={colorPickerRef}
            style={{ 
              position: 'absolute',
              top: '100%',
              left: '0',
              zIndex: 100,
              marginTop: '5px'
            }}
          >
            <SimpleColorPicker onSelectColor={handleColorChange} />
          </div>
        )}
      </span>
    )
  }
}

const ButtonDirectiveDescriptor = {
  name: 'button',
  testNode(node) {
    return node.name === 'button'
  },
  attributes: [],
  hasChildren: true,
  Editor: GenericDirectiveEditor
}

// Toolbar button for inserting colored text
const ColorButton = () => {
  const insertDirective = usePublisher(insertDirective$)
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorPickerRef = useRef(null);

  // Close color picker when clicking outside
  useEffect(() => {
    if (!showColorPicker) return;
    
    const handleClickOutside = (event) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
        setShowColorPicker(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showColorPicker]);

  const handleColorSelect = (color) => {
    console.log('Color selected for new text:', color);
    
    insertDirective({
      name: 'color',
      type: 'textDirective',
      attributes: { color },
      children: [{ type: 'text', value: 'Colored text' }]
    });
    
    setShowColorPicker(false);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <Button
        onClick={() => {
          console.log('Color button clicked');
          setShowColorPicker(!showColorPicker);
        }}
      >
        Color
      </Button>
      
      {showColorPicker && (
        <div 
          ref={colorPickerRef}
          style={{ 
            position: 'absolute', 
            top: '100%', 
            left: '0', 
            zIndex: 100,
            marginTop: '5px'
          }}
        >
          <SimpleColorPicker onSelectColor={handleColorSelect} />
        </div>
      )}
    </div>
  );
};

function App() {
  const initialContent = `# Heading 1

Culpa est ad incididunt minim nulla. Ad incididunt minim nulla consequat.

## Heading 2
### Heading 3
> Block quote
- List item 1
- List item 2
- [link](https://link.com)

[link](https://link.com){class=inline-button}

:color[red text]{color=red}

:color[Red text]{color=red} testing :color[Blue text]{color=#48bbff}

:button[My button]{https://google.com}

Another example: :button[My blue button]{https://google.com color=blue}

Inline html <span style="color: red;">red text inline</span> with  another text.

Inline html button <a href="https://google.com" class="inline-button">button</a> with  another text.

<div style="background: red">
  Content
</div>

Dolor sit amet...
End`

  const [editorMarkdown, setEditorMarkdown] = useState(initialContent)
  const [displayMarkdown, setDisplayMarkdown] = useState(initialContent)
  const editorRef = useRef(null)

  const handleGetOutput = () => {
    // Get the current content from the editor
    if (editorRef.current) {
      const currentContent = editorRef.current.getMarkdown()
      setDisplayMarkdown(currentContent)
    }
  }

  const handleEditorChange = (content) => {
    setEditorMarkdown(content)
  }

  return (
    <div style={{ width: '800px', margin: '0 40px', padding: '20px' }}>
      <h1>Markdown Editor</h1>
      <div style={{ border: '1px solid #ccc', borderRadius: '4px', marginTop: '20px' }}>
        <MDXEditor 
          ref={editorRef}
          markdown={editorMarkdown}
          onChange={handleEditorChange}
          plugins={[
            directivesPlugin({ directiveDescriptors: [
              ColorDirectiveDescriptor,
              ButtonDirectiveDescriptor
            ] }),
            headingsPlugin(),
            listsPlugin(),
            quotePlugin(),
            thematicBreakPlugin(),
            markdownShortcutPlugin(),
            linkPlugin(),
            linkDialogPlugin(),
            toolbarPlugin({
              toolbarContents: () => (
                <>
                  <UndoRedo />
                  <BoldItalicUnderlineToggles />
                  <ListsToggle />
                  <CreateLink />
                  <InsertThematicBreak />
                  <ColorButton />
                </>
              )
            })
          ]}
          style={{ padding: '20px' }}
        />
      </div>

      <div style={{ marginTop: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <h2 style={{ margin: 0 }}>Output</h2>
          <button 
            onClick={handleGetOutput}
            style={{
              padding: '8px 16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#45a049'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#4CAF50'}
          >
            Get Output
          </button>
        </div>
        <pre
          style={{
            backgroundColor: '#f5f5f5',
            padding: '20px',
            borderRadius: '4px',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word'
          }}
        >
          {displayMarkdown}
        </pre>
      </div>
    </div>
  )
}

export default App
