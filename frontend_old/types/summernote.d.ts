declare module 'summernote/dist/summernote-lite.css';
declare module 'summernote/dist/summernote-lite';

// Extend jQuery to include Summernote methods
declare global {
  interface JQuery {
    summernote(options?: any): JQuery;
    summernote(method: string, ...args: any[]): any;
  }
}
