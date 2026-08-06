declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | [number, number, number, number];
    filename?: string;
    image?: { type: string; quality: number };
    html2canvas?: { scale?: number; useCORS?: boolean; letterRendering?: boolean };
    jsPDF?: { unit?: string; format?: string; orientation?: string };
  }

  interface Html2PdfInstance {
    from(element: HTMLElement): Html2PdfInstance;
    set(opt: Html2PdfOptions): Html2PdfInstance;
    save(): Promise<void>;
  }

  interface Html2PdfStatic {
    (element?: HTMLElement): Html2PdfInstance;
  }

  const html2pdf: Html2PdfStatic;
  export default html2pdf;
}
