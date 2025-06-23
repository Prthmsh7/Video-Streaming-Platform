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
  private presenters: PresenterPersona[] = [
    {
      id: 'alex-tech',
      name: 'Alex',
      description: 'Tech-savvy presenter perfect for technical content',
      avatarUrl: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
      voiceStyle: 'professional',
      personality: 'analytical, clear, and engaging'
    },
    {
      id: 'maya-creative',
      name: 'Maya',
      description: 'Creative and energetic presenter for entertainment content',
      avatarUrl: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
      voiceStyle: 'enthusiastic',
      personality: 'vibrant, creative, and inspiring'
    },
    {
      id: 'david-educator',
      name: 'David',
      description: 'Educational presenter ideal for tutorials and learning content',
      avatarUrl: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2',
      voiceStyle: 'educational',
      personality: 'patient, thorough, and encouraging'
    }
  ];

  constructor(config: TavusConfig) {
    this.config = config;
  }

  /**
   * Generate AI presenter video for a given video
   */
  async generatePresenterVideo(request: VideoPresenterRequest, presenterId?: string): Promise<TavusVideoResponse> {
    if (!this.config.enabled) {
      return this.simulatePresenterVideo(request, presenterId);
    }

    const selectedPresenter = this.getPresenter(presenterId);
    const script = this.generatePresenterScript(request, selectedPresenter);

    try {
      const response = await fetch(`${this.config.baseUrl}/videos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          script,
          persona_id: selectedPresenter.id,
          background: 'studio', // Clean studio background
          voice_settings: {
            style: selectedPresenter.voiceStyle,
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
      return this.simulatePresenterVideo(request, presenterId);
    }
  }

  /**
   * Generate presenter script based on video metadata
   */
  private generatePresenterScript(request: VideoPresenterRequest, presenter: PresenterPersona): string {
    const { videoTitle, videoDescription, channelName, duration, views } = request;
    
    // Create a personalized script based on the presenter's personality
    let script = '';
    
    switch (presenter.voiceStyle) {
      case 'professional':
        script = `Hello! I'm ${presenter.name}, and I'm excited to introduce today's featured content. `;
        script += `We have "${videoTitle}" from ${channelName}. `;
        if (videoDescription) {
          script += `This ${duration} video explores ${this.extractKeyTopics(videoDescription)}. `;
        }
        script += `With ${views}, it's clearly resonating with viewers. Let's dive in and see what makes this content special!`;
        break;
        
      case 'enthusiastic':
        script = `Hey there! ${presenter.name} here, and wow, do I have something amazing to share with you! `;
        script += `"${videoTitle}" by ${channelName} is absolutely incredible! `;
        if (videoDescription) {
          script += `In just ${duration}, you'll discover ${this.extractKeyTopics(videoDescription)}. `;
        }
        script += `${views} people have already experienced this - and trust me, you don't want to miss out! Ready? Let's go!`;
        break;
        
      case 'educational':
        script = `Welcome, learners! I'm ${presenter.name}, your guide for today's educational journey. `;
        script += `Today we're exploring "${videoTitle}" created by ${channelName}. `;
        if (videoDescription) {
          script += `Over the next ${duration}, we'll cover ${this.extractKeyTopics(videoDescription)}. `;
        }
        script += `This content has helped ${views} learners already. Let's begin this learning adventure together!`;
        break;
        
      default:
        script = `Hi! I'm ${presenter.name}. Today's video is "${videoTitle}" from ${channelName}. `;
        if (videoDescription) {
          script += `In ${duration}, you'll learn about ${this.extractKeyTopics(videoDescription)}. `;
        }
        script += `Join ${views} others who've watched this content. Let's get started!`;
    }
    
    return script;
  }

  /**
   * Extract key topics from video description for script generation
   */
  private extractKeyTopics(description: string): string {
    if (!description || description.length < 20) {
      return 'fascinating topics and insights';
    }
    
    // Simple keyword extraction (in a real app, you might use NLP)
    const keywords = description
      .toLowerCase()
      .split(/[.,!?;:\s]+/)
      .filter(word => word.length > 4)
      .slice(0, 3)
      .join(', ');
    
    return keywords || 'interesting concepts and ideas';
  }

  /**
   * Get presenter by ID or select default
   */
  private getPresenter(presenterId?: string): PresenterPersona {
    if (presenterId) {
      const presenter = this.presenters.find(p => p.id === presenterId);
      if (presenter) return presenter;
    }
    
    // Default to first presenter
    return this.presenters[0];
  }

  /**
   * Simulate presenter video generation for demo purposes
   */
  private async simulatePresenterVideo(request: VideoPresenterRequest, presenterId?: string): Promise<TavusVideoResponse> {
    const selectedPresenter = this.getPresenter(presenterId);
    const script = this.generatePresenterScript(request, selectedPresenter);
    
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
      thumbnailUrl: selectedPresenter.avatarUrl,
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
   * Get available presenters
   */
  getPresenters(): PresenterPersona[] {
    return this.presenters;
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

// Utility function to determine best presenter for content
export const selectPresenterForContent = (videoTitle: string, description: string): string => {
  const content = (videoTitle + ' ' + description).toLowerCase();
  
  if (content.includes('tutorial') || content.includes('learn') || content.includes('education') || content.includes('how to')) {
    return 'david-educator';
  }
  
  if (content.includes('creative') || content.includes('art') || content.includes('design') || content.includes('music')) {
    return 'maya-creative';
  }
  
  if (content.includes('tech') || content.includes('programming') || content.includes('code') || content.includes('development')) {
    return 'alex-tech';
  }
  
  // Default to professional presenter
  return 'alex-tech';
};