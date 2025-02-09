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
import { useState, useRef } from 'react'

import '@mdxeditor/editor/style.css'

const ColorDirectiveDescriptor = {
  name: 'color',
  testNode(node) {
    return node.name === 'color'
  },
  attributes: ['color'],
  // used by the generic editor to determine whether or not to render a nested editor.
  hasChildren: true,
  // Editor: GenericDirectiveEditor
  Editor: (props) => {
    return (
      <>
        <span
          style={{ color: props.mdastNode.attributes.color }}
        >
          {/* {props.mdastNode.children[0].value} */}
          <GenericDirectiveEditor {...props}/>
        </span>
        
        {/* <NestedLexicalEditor
          block
          getContent={(node) => node.children}
          getUpdatedMdastNode={(mdastNode, children) => {
            return { ...mdastNode, children }
          }}
        /> */}
      </>
    )
  }
}

const ButtonDirectiveDescriptor = {
  name: 'button',
  testNode(node) {
    return node.name === 'button'
  },
  attributes: [],
  // used by the generic editor to determine whether or not to render a nested editor.
  hasChildren: true,
  Editor: GenericDirectiveEditor
  // Editor: (props) => {
  //   return (
  //     <div style={{ border: '1px solid red', padding: 8, margin: 8 }}>
  //       <NestedLexicalEditor
  //         block
  //         getContent={(node) => node.children}
  //         getUpdatedMdastNode={(mdastNode, children) => {
  //           return { ...mdastNode, children }
  //         }}
  //       />
  //     </div>
  //   )
  // }
}

const ColorButton = () => {
  // grab the insertDirective action (a.k.a. publisher) from the 
  // state management system of the directivesPlugin
  const insertDirective = usePublisher(insertDirective$)

  return (
    <Button
      onClick={() => {
        insertDirective({
          name: 'color',
          type: 'textDirective',
          attributes: { color },
          children: []
        })
      }}
    >
      Color
    </Button>
  )
}
const ColorButton2 = () => {
  // grab the insertDirective action (a.k.a. publisher) from the 
  // state management system of the directivesPlugin
  const insertDirective = usePublisher(insertDirective$)

  return (
    <Button
      onClick={() => {
        // $createGenericHTMLNode(
        //     "span",
        //     "mdxJsxTextElement",
        //     mdastNode.attributes as MdxJsxAttribute[]
        //   )
        // );
        insertDirective({
          name: 'color',
          type: 'textDirective',
          attributes: { color },
          children: []
        })
      }}
    >
      Color
    </Button>
  )
}

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

:color[Red text]{color=red} :color[Blue text]{color=#48bbff}

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
                  <ColorButton2 />
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
