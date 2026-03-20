import { youtube } from '@googleapis/youtube';
import { OAuth2Client } from 'google-auth-library';

/**
 * ============================================
 * YOUTUBE LIVE AGENT
 * Handles live streaming, live classes, and video management
 * ============================================
 */
export class YouTubeLiveAgent {
    constructor(config, decrypt) {
        this.config = config;
        this.decrypt = decrypt;
        this.oauth2Client = null;
        this.youtube = null;

        if (config && config.client_id && config.client_secret) {
            this.oauth2Client = new OAuth2Client(
                this.decrypt(config.client_id),
                this.decrypt(config.client_secret),
                process.env.YOUTUBE_OAUTH_REDIRECT_URI || 'http://localhost:3000/api/youtube/oauth/callback'
            );

            this.oauth2Client.setCredentials({
                refresh_token: this.decrypt(config.access_token)
            });

            this.youtube = youtube({
                version: 'v3',
                auth: this.oauth2Client
            });
        }
    }

    /**
     * Refresh the access token
     */
    async refreshAccessToken() {
        if (!this.oauth2Client) throw new Error('YouTube API not configured');
        try {
            const { credentials } = await this.oauth2Client.refreshAccessToken();
            this.oauth2Client.setCredentials(credentials);
            return credentials;
        } catch (error) {
            console.error('Error refreshing YouTube access token:', error);
            throw error;
        }
    }

    /**
     * Create a live broadcast (scheduled live class)
     */
    async createLiveBroadcast(metadata) {
        if (!this.youtube) throw new Error('YouTube API not configured');

        try {
            await this.refreshAccessToken();

            // Create the broadcast
            const broadcast = await this.youtube.liveBroadcasts.insert({
                part: 'snippet,status,contentDetails',
                requestBody: {
                    snippet: {
                        title: metadata.title || 'HireGo Live Class',
                        description: metadata.description || 'Live learning session',
                        scheduledStartTime: metadata.scheduledStartTime || new Date(Date.now() + 3600000).toISOString(),
                        scheduledEndTime: metadata.scheduledEndTime,
                    },
                    status: {
                        privacyStatus: metadata.privacyStatus || 'unlisted',
                        selfDeclaredMadeForKids: false
                    },
                    contentDetails: {
                        enableAutoStart: true,
                        enableAutoStop: true,
                        enableDvr: true,
                        enableEmbed: true,
                        recordFromStart: true,
                        startWithSlate: false,
                    }
                }
            });

            // Create the stream
            const stream = await this.youtube.liveStreams.insert({
                part: 'snippet,cdn,contentDetails,status',
                requestBody: {
                    snippet: {
                        title: `${metadata.title} Stream`
                    },
                    cdn: {
                        frameRate: '30fps',
                        ingestionType: 'rtmp',
                        resolution: '1080p'
                    },
                    contentDetails: {
                        isReusable: false
                    }
                }
            });

            // Bind the stream to the broadcast
            await this.youtube.liveBroadcasts.bind({
                part: 'id,contentDetails',
                id: broadcast.data.id,
                streamId: stream.data.id
            });

            return {
                broadcastId: broadcast.data.id,
                streamId: stream.data.id,
                watchUrl: `https://www.youtube.com/watch?v=${broadcast.data.id}`,
                embedUrl: `https://www.youtube.com/embed/${broadcast.data.id}`,
                streamKey: stream.data.cdn?.ingestionInfo?.streamName,
                rtmpUrl: stream.data.cdn?.ingestionInfo?.ingestionAddress,
                broadcast: broadcast.data,
                stream: stream.data
            };
        } catch (error) {
            console.error('Failed to create live broadcast:', error);
            throw error;
        }
    }

    /**
     * Get all upcoming live broadcasts
     */
    async getUpcomingBroadcasts() {
        if (!this.youtube) throw new Error('YouTube API not configured');

        try {
            await this.refreshAccessToken();

            const response = await this.youtube.liveBroadcasts.list({
                part: 'snippet,status,contentDetails',
                broadcastStatus: 'upcoming',
                maxResults: 50
            });

            return response.data.items?.map(item => ({
                id: item.id,
                title: item.snippet?.title,
                description: item.snippet?.description,
                scheduledStartTime: item.snippet?.scheduledStartTime,
                scheduledEndTime: item.snippet?.scheduledEndTime,
                thumbnailUrl: item.snippet?.thumbnails?.high?.url,
                watchUrl: `https://www.youtube.com/watch?v=${item.id}`,
                embedUrl: `https://www.youtube.com/embed/${item.id}`,
                status: item.status?.lifeCycleStatus,
                privacyStatus: item.status?.privacyStatus
            })) || [];
        } catch (error) {
            console.error('Failed to get upcoming broadcasts:', error);
            throw error;
        }
    }

    /**
     * Get live broadcasts that are currently active
     */
    async getActiveBroadcasts() {
        if (!this.youtube) throw new Error('YouTube API not configured');

        try {
            await this.refreshAccessToken();

            const response = await this.youtube.liveBroadcasts.list({
                part: 'snippet,status,contentDetails',
                broadcastStatus: 'active',
                maxResults: 50
            });

            return response.data.items?.map(item => ({
                id: item.id,
                title: item.snippet?.title,
                description: item.snippet?.description,
                actualStartTime: item.snippet?.actualStartTime,
                thumbnailUrl: item.snippet?.thumbnails?.high?.url,
                watchUrl: `https://www.youtube.com/watch?v=${item.id}`,
                embedUrl: `https://www.youtube.com/embed/${item.id}`,
                status: item.status?.lifeCycleStatus,
                concurrentViewers: item.contentDetails?.monitorStream?.enableMonitorStream
            })) || [];
        } catch (error) {
            console.error('Failed to get active broadcasts:', error);
            throw error;
        }
    }

    /**
     * Get completed broadcasts (recordings)
     */
    async getCompletedBroadcasts() {
        if (!this.youtube) throw new Error('YouTube API not configured');

        try {
            await this.refreshAccessToken();

            const response = await this.youtube.liveBroadcasts.list({
                part: 'snippet,status,contentDetails',
                broadcastStatus: 'completed',
                maxResults: 50
            });

            return response.data.items?.map(item => ({
                id: item.id,
                title: item.snippet?.title,
                description: item.snippet?.description,
                actualStartTime: item.snippet?.actualStartTime,
                actualEndTime: item.snippet?.actualEndTime,
                thumbnailUrl: item.snippet?.thumbnails?.high?.url,
                watchUrl: `https://www.youtube.com/watch?v=${item.id}`,
                embedUrl: `https://www.youtube.com/embed/${item.id}`,
                status: item.status?.lifeCycleStatus
            })) || [];
        } catch (error) {
            console.error('Failed to get completed broadcasts:', error);
            throw error;
        }
    }

    /**
     * Start a broadcast (go live)
     */
    async startBroadcast(broadcastId) {
        if (!this.youtube) throw new Error('YouTube API not configured');

        try {
            await this.refreshAccessToken();

            const response = await this.youtube.liveBroadcasts.transition({
                part: 'status',
                id: broadcastId,
                broadcastStatus: 'live'
            });

            return {
                success: true,
                status: response.data.status?.lifeCycleStatus
            };
        } catch (error) {
            console.error('Failed to start broadcast:', error);
            throw error;
        }
    }

    /**
     * End a broadcast
     */
    async endBroadcast(broadcastId) {
        if (!this.youtube) throw new Error('YouTube API not configured');

        try {
            await this.refreshAccessToken();

            const response = await this.youtube.liveBroadcasts.transition({
                part: 'status',
                id: broadcastId,
                broadcastStatus: 'complete'
            });

            return {
                success: true,
                status: response.data.status?.lifeCycleStatus
            };
        } catch (error) {
            console.error('Failed to end broadcast:', error);
            throw error;
        }
    }

    /**
     * Get videos from a playlist (for course videos)
     */
    async getPlaylistVideos(playlistId) {
        if (!this.youtube) throw new Error('YouTube API not configured');

        try {
            await this.refreshAccessToken();

            const response = await this.youtube.playlistItems.list({
                part: 'snippet,contentDetails',
                playlistId: playlistId,
                maxResults: 50
            });

            return response.data.items?.map(item => ({
                id: item.contentDetails?.videoId,
                title: item.snippet?.title,
                description: item.snippet?.description,
                thumbnailUrl: item.snippet?.thumbnails?.high?.url,
                position: item.snippet?.position,
                publishedAt: item.snippet?.publishedAt,
                watchUrl: `https://www.youtube.com/watch?v=${item.contentDetails?.videoId}`,
                embedUrl: `https://www.youtube.com/embed/${item.contentDetails?.videoId}`
            })) || [];
        } catch (error) {
            console.error('Failed to get playlist videos:', error);
            throw error;
        }
    }

    /**
     * Create a playlist for a course
     */
    async createPlaylist(title, description, privacyStatus = 'unlisted') {
        if (!this.youtube) throw new Error('YouTube API not configured');

        try {
            await this.refreshAccessToken();

            const response = await this.youtube.playlists.insert({
                part: 'snippet,status',
                requestBody: {
                    snippet: {
                        title: title,
                        description: description
                    },
                    status: {
                        privacyStatus: privacyStatus
                    }
                }
            });

            return {
                playlistId: response.data.id,
                title: response.data.snippet?.title,
                url: `https://www.youtube.com/playlist?list=${response.data.id}`
            };
        } catch (error) {
            console.error('Failed to create playlist:', error);
            throw error;
        }
    }

    /**
     * Add video to playlist
     */
    async addVideoToPlaylist(playlistId, videoId) {
        if (!this.youtube) throw new Error('YouTube API not configured');

        try {
            await this.refreshAccessToken();

            const response = await this.youtube.playlistItems.insert({
                part: 'snippet',
                requestBody: {
                    snippet: {
                        playlistId: playlistId,
                        resourceId: {
                            kind: 'youtube#video',
                            videoId: videoId
                        }
                    }
                }
            });

            return {
                success: true,
                itemId: response.data.id
            };
        } catch (error) {
            console.error('Failed to add video to playlist:', error);
            throw error;
        }
    }

    /**
     * Get channel's uploaded videos
     */
    async getChannelVideos(maxResults = 50) {
        if (!this.youtube) throw new Error('YouTube API not configured');

        try {
            await this.refreshAccessToken();

            // First get the channel's upload playlist
            const channelResponse = await this.youtube.channels.list({
                part: 'contentDetails',
                mine: true
            });

            const uploadsPlaylistId = channelResponse.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

            if (!uploadsPlaylistId) {
                throw new Error('Could not find uploads playlist');
            }

            // Get videos from the uploads playlist
            const response = await this.youtube.playlistItems.list({
                part: 'snippet,contentDetails',
                playlistId: uploadsPlaylistId,
                maxResults: maxResults
            });

            return response.data.items?.map(item => ({
                id: item.contentDetails?.videoId,
                title: item.snippet?.title,
                description: item.snippet?.description,
                thumbnailUrl: item.snippet?.thumbnails?.high?.url,
                publishedAt: item.snippet?.publishedAt,
                watchUrl: `https://www.youtube.com/watch?v=${item.contentDetails?.videoId}`,
                embedUrl: `https://www.youtube.com/embed/${item.contentDetails?.videoId}`
            })) || [];
        } catch (error) {
            console.error('Failed to get channel videos:', error);
            throw error;
        }
    }

    /**
     * Get video details
     */
    async getVideoDetails(videoId) {
        if (!this.youtube) throw new Error('YouTube API not configured');

        try {
            await this.refreshAccessToken();

            const response = await this.youtube.videos.list({
                part: 'snippet,contentDetails,statistics',
                id: videoId
            });

            const video = response.data.items?.[0];
            if (!video) return null;

            return {
                id: video.id,
                title: video.snippet?.title,
                description: video.snippet?.description,
                thumbnailUrl: video.snippet?.thumbnails?.high?.url,
                publishedAt: video.snippet?.publishedAt,
                duration: video.contentDetails?.duration,
                viewCount: video.statistics?.viewCount,
                likeCount: video.statistics?.likeCount,
                watchUrl: `https://www.youtube.com/watch?v=${video.id}`,
                embedUrl: `https://www.youtube.com/embed/${video.id}`
            };
        } catch (error) {
            console.error('Failed to get video details:', error);
            throw error;
        }
    }
}

export default YouTubeLiveAgent;
