// FilCDN integration for Filecoin storage
export interface FilCDNConfig {
  apiKey: string;
  baseUrl: string;
}

export interface UploadResponse {
  cid: string;
  url: string;
  size: number;
  filename: string;
}

export interface RetrieveResponse {
  url: string;
  cid: string;
  metadata?: {
    filename: string;
    size: number;
    contentType: string;
  };
}

class FilCDNClient {
  private config: FilCDNConfig;

  constructor(config: FilCDNConfig) {
    this.config = config;
  }

  /**
   * Upload a file to FilCDN/Filecoin storage
   */
  async uploadFile(file: File, options?: { 
    filename?: string;
    metadata?: Record<string, any>;
  }): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (options?.filename) {
      formData.append('filename', options.filename);
    }
    
    if (options?.metadata) {
      formData.append('metadata', JSON.stringify(options.metadata));
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`FilCDN upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        cid: result.cid,
        url: result.url || `${this.config.baseUrl}/retrieve/${result.cid}`,
        size: result.size || file.size,
        filename: result.filename || file.name,
      };
    } catch (error) {
      console.error('FilCDN upload error:', error);
      throw new Error(`Failed to upload to FilCDN: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieve a file from FilCDN using CID
   */
  async retrieveFile(cid: string): Promise<RetrieveResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}/retrieve/${cid}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`FilCDN retrieve failed: ${response.statusText}`);
      }

      const metadata = {
        filename: response.headers.get('x-filename') || 'unknown',
        size: parseInt(response.headers.get('content-length') || '0'),
        contentType: response.headers.get('content-type') || 'application/octet-stream',
      };

      return {
        url: response.url,
        cid,
        metadata,
      };
    } catch (error) {
      console.error('FilCDN retrieve error:', error);
      throw new Error(`Failed to retrieve from FilCDN: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get streaming URL for video content
   */
  getStreamingUrl(cid: string): string {
    return `${this.config.baseUrl}/stream/${cid}`;
  }

  /**
   * Get thumbnail URL
   */
  getThumbnailUrl(cid: string): string {
    return `${this.config.baseUrl}/thumbnail/${cid}`;
  }

  /**
   * Check if content exists in FilCDN
   */
  async contentExists(cid: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/exists/${cid}`, {
        method: 'HEAD',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Initialize FilCDN client
const filcdnConfig: FilCDNConfig = {
  apiKey: import.meta.env.VITE_FILCDN_API_KEY || 'demo-key',
  baseUrl: import.meta.env.VITE_FILCDN_BASE_URL || 'https://api.filcdn.io/v1',
};

export const filcdnClient = new FilCDNClient(filcdnConfig);

// Utility functions for video processing
export const generateVideoMetadata = (file: File, duration: number) => ({
  filename: file.name,
  size: file.size,
  type: file.type,
  duration,
  uploadedAt: new Date().toISOString(),
  platform: 'Sillycon',
});

export const createFilecoinDeal = async (cid: string, metadata: any) => {
  // This would integrate with Filecoin deal-making APIs
  // For hackathon purposes, we'll simulate this
  console.log(`Creating Filecoin deal for CID: ${cid}`, metadata);
  return {
    dealId: `deal_${Date.now()}`,
    cid,
    status: 'pending',
    provider: 'f01234',
    price: '0.001 FIL',
  };
};