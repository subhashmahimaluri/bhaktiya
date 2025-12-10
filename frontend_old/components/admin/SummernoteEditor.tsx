'use client';

import { useSession } from 'next-auth/react';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

interface SummernoteEditorProps {
  data?: string;
  onChange?: (data: string) => void;
  onReady?: (editor: any) => void;
  id?: string;
}

export interface SummernoteEditorRef {
  getData: () => string;
  setData: (data: string) => void;
  insertImage: (url: string) => void;
}

const SummernoteEditor = forwardRef<SummernoteEditorRef, SummernoteEditorProps>(
  ({ data = '', onChange, onReady, id }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const editorInstance = useRef<any>(null);
    const { data: session } = useSession();

    useImperativeHandle(ref, () => ({
      getData: () => {
        if (editorInstance.current && typeof window !== 'undefined') {
          const $ = (window as any).$;
          // @ts-ignore - Summernote plugin extends jQuery at runtime
          return $(textareaRef.current).summernote('code');
        }
        return data || '';
      },
      setData: (newData: string) => {
        if (editorInstance.current && typeof window !== 'undefined') {
          const $ = (window as any).$;
          // @ts-ignore - Summernote plugin extends jQuery at runtime
          $(textareaRef.current).summernote('code', newData);
        }
      },
      insertImage: (url: string) => {
        if (editorInstance.current && typeof window !== 'undefined') {
          const $ = (window as any).$;
          // @ts-ignore - Summernote plugin extends jQuery at runtime
          $(textareaRef.current).summernote('insertImage', url);
        }
      },
    }));

    useEffect(() => {
      // Only run on client side
      if (typeof window === 'undefined') return;

      const initializeSummernote = async () => {
        // Dynamically import CSS
        await import('summernote/dist/summernote-lite.css');

        // Dynamically import jQuery and Summernote
        const jQuery = (await import('jquery')).default;
        (window as any).$ = jQuery;
        (window as any).jQuery = jQuery;

        // Import Summernote
        await import('summernote/dist/summernote-lite');

        const $ = jQuery;

        if (textareaRef.current) {
          // @ts-ignore - Summernote plugin extends jQuery at runtime
          $(textareaRef.current).summernote({
            height: 400,
            toolbar: [
              ['style', ['style']],
              ['font', ['bold', 'italic', 'underline', 'clear']],
              ['fontname', ['fontname']],
              ['color', ['color']],
              ['para', ['ul', 'ol', 'paragraph']],
              ['table', ['table']],
              ['insert', ['link', 'picture', 'video']],
              ['view', ['fullscreen', 'codeview', 'help']], // codeview is the HTML toggle!
            ],
            callbacks: {
              onChange: (contents: string) => {
                if (onChange) {
                  onChange(contents);
                }
              },
              onInit: () => {
                editorInstance.current = textareaRef.current;
                if (data) {
                  // @ts-ignore - Summernote plugin extends jQuery at runtime
                  $(textareaRef.current).summernote('code', data);
                }
                if (onReady) {
                  onReady(textareaRef.current);
                }
              },
              onImageUpload: async (files: File[]) => {
                // Custom image upload handler
                for (const file of files) {
                  const formData = new FormData();
                  formData.append('file', file);

                  try {
                    const response = await fetch(
                      `${process.env.NEXT_PUBLIC_BACKEND_REST_URL || 'http://localhost:4000'}/rest/media/upload`,
                      {
                        method: 'POST',
                        headers: {
                          ...((session as any)?.accessToken
                            ? { Authorization: `Bearer ${(session as any).accessToken}` }
                            : {}),
                        },
                        body: formData,
                      }
                    );

                    const result = await response.json();
                    if (result.id && result.url) {
                      // @ts-ignore - Summernote plugin extends jQuery at runtime
                      $(textareaRef.current).summernote('insertImage', result.url);
                    }
                  } catch (error) {
                    console.error('Image upload failed:', error);
                  }
                }
              },
            },
          });
        }
      };

      initializeSummernote();

      // Cleanup
      return () => {
        if (textareaRef.current && typeof window !== 'undefined') {
          const $ = (window as any).$;
          if ($ && $(textareaRef.current).data('summernote')) {
            // @ts-ignore - Summernote plugin extends jQuery at runtime
            $(textareaRef.current).summernote('destroy');
          }
        }
      };
    }, []);

    // Update content when data prop changes
    useEffect(() => {
      if (editorInstance.current && typeof window !== 'undefined') {
        const $ = (window as any).$;
        // @ts-ignore - Summernote plugin extends jQuery at runtime
        const currentCode = $(textareaRef.current).summernote('code');
        if (currentCode !== data) {
          // @ts-ignore - Summernote plugin extends jQuery at runtime
          $(textareaRef.current).summernote('code', data);
        }
      }
    }, [data]);

    return <textarea ref={textareaRef} id={id} style={{ display: 'none' }} />;
  }
);

SummernoteEditor.displayName = 'SummernoteEditor';

export default SummernoteEditor;
