// Vercel Serverless Function - Strava Webhook Handler
// Handles subscription validation (GET) and event notifications (POST)

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Verify token for webhook subscription validation
// Set this in Vercel environment variables
const WEBHOOK_VERIFY_TOKEN = process.env.STRAVA_WEBHOOK_VERIFY_TOKEN || 'STATIK_STRAVA_WEBHOOK';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // ---------------------------------------------------------------------------
  // GET: Subscription Validation
  // Strava sends this to verify your callback URL when creating a subscription
  // ---------------------------------------------------------------------------
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    console.log('🔔 Webhook validation request:', { mode, token, challenge });

    // Verify the token matches what we expect
    if (mode === 'subscribe' && token === WEBHOOK_VERIFY_TOKEN) {
      console.log('✅ Webhook validation successful');
      // Must respond with the challenge to complete validation
      return res.status(200).json({ 'hub.challenge': challenge });
    } else {
      console.error('❌ Webhook validation failed: token mismatch');
      return res.status(403).json({ error: 'Verification failed' });
    }
  }

  // ---------------------------------------------------------------------------
  // POST: Event Notification
  // Strava sends activity/athlete events here
  // ---------------------------------------------------------------------------
  if (req.method === 'POST') {
    const event = req.body;

    console.log('📬 Webhook event received:', JSON.stringify(event, null, 2));

    // Event structure:
    // {
    //   "aspect_type": "create" | "update" | "delete",
    //   "event_time": 1549560669,
    //   "object_id": 1234567890,     // Activity or Athlete ID
    //   "object_type": "activity" | "athlete",
    //   "owner_id": 9999999,         // Athlete ID who owns the object
    //   "subscription_id": 999999,
    //   "updates": { ... }           // For updates: what changed
    // }

    const { aspect_type, object_type, object_id, owner_id, updates } = event;

    // Handle different event types
    if (object_type === 'athlete') {
      // Athlete events (e.g., deauthorization)
      if (updates?.authorized === 'false') {
        console.log(`🚪 Athlete ${owner_id} has deauthorized the app`);
        // TODO: Clean up athlete data from your database
        // This is REQUIRED per Strava API terms
      }
    } else if (object_type === 'activity') {
      // Activity events
      switch (aspect_type) {
        case 'create':
          console.log(`🆕 New activity ${object_id} created by athlete ${owner_id}`);
          // TODO: Optionally fetch activity details and notify user
          // This is where you'd trigger a push notification
          break;

        case 'update':
          console.log(`📝 Activity ${object_id} updated by athlete ${owner_id}:`, updates);
          // Updates can include: title, type, private (visibility)
          if (updates?.private === 'true') {
            console.log(`🔒 Activity ${object_id} is now private`);
            // TODO: Remove from any public displays per API terms
          }
          break;

        case 'delete':
          console.log(`🗑️ Activity ${object_id} deleted by athlete ${owner_id}`);
          // TODO: Remove activity from your cache/database
          break;
      }
    }

    // Must respond with 200 OK within 2 seconds
    // Any heavy processing should be done async
    return res.status(200).json({ received: true });
  }

  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
}
