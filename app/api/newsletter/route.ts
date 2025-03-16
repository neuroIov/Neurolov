import { NextResponse } from 'next/server';
import md5 from 'md5';

const MAILCHIMP_API_KEY = '99d1ac30327ca8f29a73b35fe3cee9a4-us3';
const MAILCHIMP_AUDIENCE_ID = 'a16e1d6051';
const MAILCHIMP_SERVER_PREFIX = 'us3';

// Function to generate MD5 hash
function generateMD5Hash(message: string): string {
  return md5(message);
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Generate MD5 hash of lowercase email for Mailchimp
    const subscriberHash = generateMD5Hash(email.toLowerCase());

    const data = {
      email_address: email.toLowerCase(),
      status: 'subscribed',
      merge_fields: {}
    };

    // First try to check if member exists
    const checkResponse = await fetch(
      `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_AUDIENCE_ID}/members/${subscriberHash}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(`anystring:${MAILCHIMP_API_KEY}`).toString('base64')}`,
          'Content-Type': 'application/json',
        }
      }
    );

    if (checkResponse.status === 404) {
      // Member doesn't exist, create new
      const createResponse = await fetch(
        `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_AUDIENCE_ID}/members`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${Buffer.from(`anystring:${MAILCHIMP_API_KEY}`).toString('base64')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      const createData = await createResponse.json();

      if (!createResponse.ok) {
        console.error('Mailchimp API error:', createData);
        return NextResponse.json(
          { error: createData.detail || 'Error subscribing to newsletter' },
          { status: createResponse.status }
        );
      }

      return NextResponse.json(
        { message: 'Successfully subscribed to newsletter' },
        { status: 200 }
      );
    } else {
      // Member exists, update their status
      const updateResponse = await fetch(
        `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_AUDIENCE_ID}/members/${subscriberHash}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Basic ${Buffer.from(`anystring:${MAILCHIMP_API_KEY}`).toString('base64')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'subscribed' }),
        }
      );

      const updateData = await updateResponse.json();

      if (!updateResponse.ok) {
        console.error('Mailchimp API error:', updateData);
        return NextResponse.json(
          { error: updateData.detail || 'Error updating newsletter subscription' },
          { status: updateResponse.status }
        );
      }

      return NextResponse.json(
        { message: 'Newsletter subscription updated successfully' },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
