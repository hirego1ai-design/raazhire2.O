import { youtube } from '@googleapis/youtube';
import { OAuth2Client } from 'google-auth-library';
import fs from 'fs';
import path from 'path';

/**
 * YouTube Agent - Handles video uploads and channel management
 */
export class YouTubeAgent {
    constructor(config, decrypt) {
        this.config = config;
        this.decrypt = decrypt;
        this.oauth2Client = null;

        if (config && config.client_id && config.client_secret) {
            this.oauth2Client = new OAuth2Client(
                this.decrypt(config.client_id),
                this.decrypt(config.client_secret),
                process.env.YOUTUBE_OAUTH_REDIRECT_URI || 'http://localhost:3000/api/youtube/oauth/callback' // Redirect URI
            );

            const token = this.decrypt(config.access_token);
            // Set as both access and refresh token to support both scenarios
            // logic: If it's a Refresh Token, refreshAccessToken() will work. 
            // If it's an Access Token, refreshAccessToken() will fail but we can still use it as access_token.
            this.oauth2Client.setCredentials({
                access_token: token,
                refresh_token: token
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
            console.warn('Note: YouTube token refresh failed (using stored token as-is):', error.message);
            // Do not throw. We fallback to using the stored token as an access_token.
            // If it is invalid/expired, the API call itself will fail later with 401.
            return null;
        }
    }

    /**
     * Upload a video to YouTube
     * @param {string} filePath - Path to the video file
     * @param {Object} metadata - Video metadata (title, description, tags)
     * @returns {Promise<Object>} - YouTube video data
     */
    async uploadVideo(filePath, metadata) {
        if (!this.oauth2Client) throw new Error('YouTube API not configured');

        try {
            // Ensure we have a fresh token
            await this.refreshAccessToken();

            const yt = youtube({
                version: 'v3',
                auth: this.oauth2Client
            });

            const response = await yt.videos.insert({
                part: 'snippet,status',
                requestBody: {
                    snippet: {
                        title: metadata.title || 'HireGo AI Recording',
                        description: metadata.description || 'Uploaded via HireGo AI Platform',
                        tags: metadata.tags || ['HireGo', 'AI', 'Interview'],
                        categoryId: '22' // People & Blogs
                    },
                    status: {
                        privacyStatus: this.config.privacy_status || 'unlisted',
                        selfDeclaredMadeForKids: false
                    }
                },
                media: {
                    body: fs.createReadStream(filePath)
                }
            });

            return {
                id: response.data.id,
                url: `https://www.youtube.com/watch?v=${response.data.id}`,
                data: response.data
            };
        } catch (error) {
            console.error('YouTube upload failed:', error);
            throw error;
        }
    }
}

export default YouTubeAgent;