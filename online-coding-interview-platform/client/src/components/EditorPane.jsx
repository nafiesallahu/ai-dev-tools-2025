import Editor from '@monaco-editor/react';

export default function EditorPane({ value, language, onChange }) {
  return (
    <div className="editor">
      <Editor
        height="70vh"
        value={value}
        language={language}
        theme="vs-dark"
        onChange={(next) => onChange(next ?? '')}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          automaticLayout: true,
        }}
      />
    </div>
  );
}


