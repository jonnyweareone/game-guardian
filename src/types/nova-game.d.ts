// Type declarations for Nova Game SDK
declare global {
  interface Window {
    NovaGame?: {
      init: (config: { bearerToken: string }) => void;
      levelComplete: (data: any) => void;
      projectSubmit: (data: any) => void;
      bookPageRead: (data: any) => void;
    };
  }
}

export {};