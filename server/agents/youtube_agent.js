import { google } from 'googleapis';
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
            this.oauth2Client = new google.auth.OAuth2(
                this.decrypt(config.client_id),
                this.decrypt(config.client_secret),
                'http://localhost:3000/auth/callback' // Redirect URI
            );

            this.oauth2Client.setCredentials({
                refresh_token: this.decrypt(config.access_token) // We store the refresh token in the access_token field in the DB for simplicity based on the setup guide
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

            const youtube = google.youtube({
                version: 'v3',
                auth: this.oauth2Client
            });

            const response = await youtube.videos.insert({
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