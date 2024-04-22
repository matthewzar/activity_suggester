import axios from 'axios';
import { findSuitableActivity } from './serverUtils.js';


export class IActivityFetcher {
    async getActivityForUser(user) {
        throw new Error('getActivityForUser must be implemented by subclasses');
    }
}

export class RemoteActivityFetcher extends IActivityFetcher {
    constructor(url = 'https://www.boredapi.com/api/activity', maxRetries = 5, delay = 100) {
        super();
        this.url = url;
        this.maxRetries = maxRetries;
        this.delay = delay;
    }

    async getActivityForUser(user) {
        for (let i = 0; i < this.maxRetries; i++) {
            try {
                const response = await axios.get(this.url);
                const activities = [response.data];
                const suitableActivity = findSuitableActivity(activities, user);
                
                if (suitableActivity) {
                    return suitableActivity;
                }
            } catch (error) {
                console.error(`Attempt ${i + 1}: Failed to fetch activity`, error);
            }

            // Wait for a delay before retrying, using exponential backoff
            await new Promise(resolve => setTimeout(resolve, this.delay * (i + 1)));  
        }
        
        throw new Error('No suitable activity found');
    }
}

export class MockActivityFetcher extends IActivityFetcher {
    constructor() {
        super();
        this.mockResponses = {};
    }

    setResponseForUser(user, response) {
        this.mockResponses[user.name] = response;
    }

    async getActivityForUser(user) {
        const suitableActivity = findSuitableActivity(this.mockResponses, user);
        if (suitableActivity) {
            return suitableActivity;
        }
        throw new Error('No suitable activity found');
    }
}