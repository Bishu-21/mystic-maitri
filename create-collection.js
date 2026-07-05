const sdk = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

async function main() {
    const client = new sdk.Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://sgp.cloud.appwrite.io/v1')
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
        .setKey(process.env.APPWRITE_API_KEY);

    const databases = new sdk.Databases(client);
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
    const collectionId = 'prescriptions';

    const attributes = [
        () => databases.createUrlAttribute(databaseId, collectionId, 'imageUrl', true),
        () => databases.createStringAttribute(databaseId, collectionId, 'rawText', 50000, true),
        () => databases.createStringAttribute(databaseId, collectionId, 'parsedMedicines', 100000, true),
        () => databases.createFloatAttribute(databaseId, collectionId, 'ocrConfidence', true),
        () => databases.createDatetimeAttribute(databaseId, collectionId, 'createdAt', true),
        () => databases.createBooleanAttribute(databaseId, collectionId, 'pharmacistReviewed', true),
        () => databases.createStringAttribute(databaseId, collectionId, 'corrections', 100000, false),
        () => databases.createStringAttribute(databaseId, collectionId, 'patientInfo', 100000, false)
    ];

    console.log("Creating attributes individually...");

    for (const attr of attributes) {
        try {
            await attr();
            console.log("Created an attribute successfully.");
        } catch (error) {
            if (error.code === 409) {
                console.log("Attribute already exists.");
            } else {
                console.error("Error creating attribute:", error.message);
            }
        }
    }

    console.log("✅ All attributes processed! You can now use the OCR feature.");
}

main();
