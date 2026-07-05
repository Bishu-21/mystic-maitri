import { Client, Account, Databases } from 'node-appwrite';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);

async function testConnection() {
    console.log('Testing Appwrite Connection...');
    console.log('Endpoint:', process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT);
    console.log('Project ID:', process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

    try {
        // Try to list databases as a simple connectivity check
        // If API key has enough permissions (or even if it doesn't, we might get a 401/403 which confirms connection)
        // Better to check something generic.
        // Let's try to get the project details if possible, but the server SDK doesn't expose "getProject" easily without specific scopes.
        // listing databases is a good test.
        const dbs = await databases.list();
        console.log('✅ Connection Successful! Found', dbs.total, 'databases.');
    } catch (error: any) {
        console.error('❌ Connection Failed:', error.message);
        if (error.code === 401) {
            console.log('⚠️  Error 401 means the API Key is invalid or missing permissions.');
        }
        if (error.code === 403) {
            console.log('⚠️  Error 403 means the API Key does not have permission to list databases.');
            console.log('✅ However, this confirms the Endpoint and Project ID are likely correct and reachable.');
        }
    }
}

testConnection();
