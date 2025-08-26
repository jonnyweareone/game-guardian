import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Search, Copy, Download, FileText, Folder, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';

// Token and expiry configuration
const CODE_SHARE_TOKEN = 'ggshare_3Kzfd7PzYV8FQd2uG1sNcR9wLXhAqM5t';
const CODE_SHARE_EXPIRES_AT = new Date('2025-01-29T00:00:00Z'); // 72 hours from now

// Import all safe source files at build time
const sourceFiles = import.meta.glob([
  '/src/**/*.{ts,tsx,js,jsx,json,css,md}',
  '/supabase/functions/**/index.ts',
  '/supabase/config.toml',
  '/supabase/migrations/**/*.sql',
  '/package.json',
  '/tsconfig*.json',
  '/tailwind.config.ts',
  '/vite.config.ts',
  '/README.md',
  '/LICENSE',
  '/.env',
  '/components.json',
  '/postcss.config.js'
], { 
  as: 'raw',
  eager: true 
});

interface FileNode {
  name: string;
  path: string;
  content?: string;
  children?: { [key: string]: FileNode };
  isDirectory: boolean;
}

function buildFileTree(files: Record<string, string>): FileNode {
  const root: FileNode = { name: 'root', path: '', isDirectory: true, children: {} };
  
  Object.entries(files).forEach(([path, content]) => {
    const parts = path.replace(/^\//, '').split('/');
    let current = root;
    
    parts.forEach((part, index) => {
      if (!current.children) current.children = {};
      
      if (index === parts.length - 1) {
        // File
        current.children[part] = {
          name: part,
          path,
          content: content as string,
          isDirectory: false
        };
      } else {
        // Directory
        if (!current.children[part]) {
          current.children[part] = {
            name: part,
            path: parts.slice(0, index + 1).join('/'),
            isDirectory: true,
            children: {}
          };
        }
        current = current.children[part];
      }
    });
  });
  
  return root;
}

function FileTreeNode({ node, onFileSelect, expandedDirs, onToggleDir }: {
  node: FileNode;
  onFileSelect: (file: FileNode) => void;
  expandedDirs: Set<string>;
  onToggleDir: (path: string) => void;
}) {
  if (node.isDirectory) {
    const isExpanded = expandedDirs.has(node.path);
    const children = Object.values(node.children || {}).sort((a, b) => {
      if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    return (
      <div>
        <div 
          className="flex items-center gap-2 px-2 py-1 hover:bg-muted/50 cursor-pointer rounded text-sm"
          onClick={() => onToggleDir(node.path)}
        >
          {isExpanded ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
          <span className="text-muted-foreground">{node.name}</span>
        </div>
        {isExpanded && (
          <div className="ml-4 border-l border-border pl-2">
            {children.map(child => (
              <FileTreeNode 
                key={child.path} 
                node={child} 
                onFileSelect={onFileSelect}
                expandedDirs={expandedDirs}
                onToggleDir={onToggleDir}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className="flex items-center gap-2 px-2 py-1 hover:bg-muted/50 cursor-pointer rounded text-sm"
      onClick={() => onFileSelect(node)}
    >
      <FileText className="w-4 h-4" />
      <span>{node.name}</span>
    </div>
  );
}

export default function CodeShare() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set(['', 'src']));

  // Access control
  const token = searchParams.get('token');
  const now = new Date();

  if (token !== CODE_SHARE_TOKEN || now > CODE_SHARE_EXPIRES_AT) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-muted-foreground mb-4">404</h1>
          <p className="text-muted-foreground">Page not found</p>
        </div>
      </div>
    );
  }

  const fileTree = useMemo(() => buildFileTree(sourceFiles as Record<string, string>), []);
  
  const allFiles = useMemo(() => {
    const files: FileNode[] = [];
    const traverse = (node: FileNode) => {
      if (!node.isDirectory) {
        files.push(node);
      }
      if (node.children) {
        Object.values(node.children).forEach(traverse);
      }
    };
    if (fileTree.children) {
      Object.values(fileTree.children).forEach(traverse);
    }
    return files;
  }, [fileTree]);

  const filteredFiles = useMemo(() => {
    if (!searchQuery) return allFiles;
    return allFiles.filter(file => 
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.path.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allFiles, searchQuery]);

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success('Copied to clipboard');
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const downloadAsZip = async () => {
    try {
      // Create a simple text file with all source code
      let allContent = '';
      allFiles.forEach(file => {
        if (file.content) {
          allContent += `\n\n=== ${file.path} ===\n\n${file.content}`;
        }
      });
      
      const blob = new Blob([allContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'project-source.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Download started');
    } catch (err) {
      toast.error('Download failed');
    }
  };

  const toggleDir = (path: string) => {
    setExpandedDirs(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Code Share</h1>
              <p className="text-sm text-muted-foreground">
                Temporary read-only access • Expires {CODE_SHARE_EXPIRES_AT.toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={downloadAsZip}>
                <Download className="w-4 h-4 mr-2" />
                Download TXT
              </Button>
              <Badge variant="secondary">{allFiles.length} files</Badge>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
          {/* File Tree */}
          <div className="col-span-4">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Files</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-300px)]">
                  <div className="p-4">
                    {searchQuery ? (
                      <div className="space-y-1">
                        {filteredFiles.map(file => (
                          <div 
                            key={file.path}
                            className="flex items-center gap-2 px-2 py-1 hover:bg-muted/50 cursor-pointer rounded text-sm"
                            onClick={() => setSelectedFile(file)}
                          >
                            <FileText className="w-4 h-4" />
                            <span className="text-xs text-muted-foreground">{file.path}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div>
                        {fileTree.children && Object.values(fileTree.children).map(child => (
                          <FileTreeNode 
                            key={child.path} 
                            node={child} 
                            onFileSelect={setSelectedFile}
                            expandedDirs={expandedDirs}
                            onToggleDir={toggleDir}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* File Content */}
          <div className="col-span-8">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {selectedFile ? selectedFile.path : 'Select a file'}
                  </CardTitle>
                  {selectedFile && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => selectedFile.content && copyToClipboard(selectedFile.content)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-300px)]">
                  {selectedFile?.content ? (
                    <pre className="p-4 text-sm bg-muted/30 overflow-x-auto">
                      <code>{selectedFile.content}</code>
                    </pre>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Select a file from the tree to view its contents</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}