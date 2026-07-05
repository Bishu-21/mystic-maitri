const sdk = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

async function main() {
    const client = new sdk.Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1') // Your API Endpoint
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID) // Your project ID
        .setKey(process.env.APPWRITE_API_KEY); // Your secret API key

    const databases = new sdk.Databases(client);
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

    try {
        const response = await databases.listCollections(databaseId);
        console.log(`Collections in DB (${databaseId}):`);
        response.collections.forEach(col => {
            console.log(`- Name: ${col.name} | ID: ${col.$id}`);
        });
    } catch (error) {
        console.error("Error fetching collections:", error);
    }
}

main();
