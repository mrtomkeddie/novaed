'use server';

import {google} from 'googleapis';

function getGoogleAuth() {
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;

  // This function should only be called if we are sure the credentials exist.
  if (!privateKey || !clientEmail) {
    throw new Error(
      'Google Sheets API credentials are not set in environment variables.'
    );
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      private_key: privateKey,
      client_email: clientEmail,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return auth;
}

export async function getRows(sheetName: string) {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;

  // If any of the required Google Sheets variables are missing,
  // return null immediately to use the fallback data.
  if (!spreadsheetId || !privateKey || !clientEmail) {
    return null;
  }

  try {
    const auth = getGoogleAuth();
    const sheets = google.sheets({version: 'v4', auth});

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: sheetName,
    });
    return response.data;
  } catch (err) {
    console.error(`Error getting rows from Google Sheet "${sheetName}":`, err);
    // Instead of throwing, we return null so the calling component can handle it gracefully.
    return null;
  }
}
