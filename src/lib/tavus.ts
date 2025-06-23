// Tavus AI Video Agent Integration
export interface TavusConfig {
  apiKey: string;
  baseUrl: string;
  enabled: boolean;
}

export interface VideoPresenterRequest {
  videoTitle: string;
  videoDescription: string;
  channelName: string;
  duration: string;
  views: string;
  additionalContext?: {
    tags?: string[];
    category?: string;
    language?: string;
  };
}

export interface TavusVideoResponse {
  videoId: string;
  videoUrl: string;
  status: 'generating' | 'ready' | 'failed';
  duration: number;
  thumbnailUrl?: string;
  transcript?: string;
}

export interface PresenterPersona {
  id: string;
  name: string;
  description: string;
  avatarUrl: string;
  voiceStyle: 'professional' | 'casual' | 'enthusiastic' | 'educational';
  personality: string;
}

class TavusClient {
  private config: TavusConfig;
  private presenter: PresenterPersona = {
    id: 'sophia-host',
    name: 'Sophia',
    description: 'Your friendly AI video host who introduces and explains content',
    avatarUrl: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
    voiceStyle: 'professional',
    personality: 'warm, engaging, and knowledgeable'
  };

  constructor(config: TavusConfig) {
    this.config = config;
  }

  /**
   * Generate AI presenter video for a given video
   */
  async generatePresenterVideo(request: VideoPresenterRequest): Promise<TavusVideoResponse> {
    if (!this.config.enabled) {
      return this.simulatePresenterVideo(request);
    }

    const script = this.generatePresenterScript(request);

    try {
      const response = await fetch(`${this.config.baseUrl}/videos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          script,
          persona_id: this.presenter.id,
          background: 'studio', // Clean studio background
          voice_settings: {
            style: this.presenter.voiceStyle,
            speed: 1.0,
            pitch: 0.0
          },
          video_settings: {
            resolution: '1080p',
            format: 'mp4',
            duration_limit: 60 // Max 60 seconds for intro
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Tavus API error: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        videoId: result.video_id,
        videoUrl: result.download_url || result.stream_url,
        status: result.status,
        duration: result.duration || 30,
        thumbnailUrl: result.thumbnail_url,
        transcript: script
      };
    } catch (error) {
      console.error('Tavus API error:', error);
      console.warn('Falling back to simulated presenter video');
      return this.simulatePresenterVideo(request);
    }
  }

  /**
   * Generate presenter script based on video metadata
   */
  private generatePresenterScript(request: VideoPresenterRequest): string {
    const { videoTitle, videoDescription, channelName, duration, views } = request;
    
    // Create a warm, engaging script from Sophia
    let script = `Hi there! I'm Sophia, your AI video host. `;
    script += `I'm excited to introduce "${videoTitle}" from ${channelName}. `;
    
    if (videoDescription && videoDescription.length > 20) {
      const keyTopics = this.extractKeyTopics(videoDescription);
      script += `In this ${duration} video, you'll discover ${keyTopics}. `;
    } else {
      script += `This ${duration} video has some amazing content waiting for you. `;
    }
    
    script += `With ${views}, it's clearly resonating with viewers. `;
    script += `I think you're going to love what you're about to see. Let's dive in!`;
    
    return script;
  }

  /**
   * Extract key topics from video description for script generation
   */
  private extractKeyTopics(description: string): string {
    if (!description || description.length < 20) {
      return 'fascinating insights and valuable information';
    }
    
    // Simple keyword extraction
    const keywords = description
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 4 && !['this', 'that', 'with', 'will', 'have', 'been', 'from', 'they', 'were', 'said', 'each', 'which', 'their', 'time', 'would', 'there', 'could', 'other'].includes(word))
      .slice(0, 3)
      .join(', ');
    
    return keywords || 'interesting concepts and valuable insights';
  }

  /**
   * Simulate presenter video generation for demo purposes
   */
  private async simulatePresenterVideo(request: VideoPresenterRequest): Promise<TavusVideoResponse> {
    const script = this.generatePresenterScript(request);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
    
    // Generate mock video ID
    const videoId = `tavus_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    // For demo, we'll use a placeholder video URL
    // In production, this would be the actual Tavus-generated video
    const demoVideoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
    
    return {
      videoId,
      videoUrl: demoVideoUrl,
      status: 'ready',
      duration: 25 + Math.floor(Math.random() * 20), // 25-45 seconds
      thumbnailUrl: this.presenter.avatarUrl,
      transcript: script
    };
  }

  /**
   * Check video generation status
   */
  async checkVideoStatus(videoId: string): Promise<TavusVideoResponse> {
    if (!this.config.enabled) {
      return {
        videoId,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        status: 'ready',
        duration: 30
      };
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/videos/${videoId}`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Tavus status check failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        videoId: result.video_id,
        videoUrl: result.download_url || result.stream_url,
        status: result.status,
        duration: result.duration,
        thumbnailUrl: result.thumbnail_url
      };
    } catch (error) {
      console.error('Tavus status check error:', error);
      throw error;
    }
  }

  /**
   * Get the presenter
   */
  getPresenter(): PresenterPersona {
    return this.presenter;
  }

  /**
   * Check if Tavus is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }
}

// Initialize Tavus client
const tavusConfig: TavusConfig = {
  apiKey: import.meta.env.VITE_TAVUS_API_KEY || 'demo-key',
  baseUrl: import.meta.env.VITE_TAVUS_BASE_URL || 'https://tavusapi.com/v2',
  enabled: import.meta.env.VITE_TAVUS_ENABLED === 'true',
};

export const tavusClient = new TavusClient(tavusConfig);