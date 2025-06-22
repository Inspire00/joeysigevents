import { NextResponse } from 'next/server';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

/**
 * API route to fetch staff statistics for events in a date range
 * @param {Request} request
 * @returns {Promise<NextResponse>}
 */
export async function GET(request) {
  console.log('[API] Received GET request for /api/staff-stats');
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (!startDate || !endDate) {
    console.error('[API] Missing startDate or endDate');
    return NextResponse.json({ error: 'Start and end dates are required' }, { status: 400 });
  }

  try {
    // Verify db is a Firestore instance
    if (!db) {
      console.error('[API] Firestore not initialized');
      throw new Error('Firestore instance is not properly initialized');
    }

    // Normalize date formats for comparison
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    console.log('[API] Date range:', startDateObj.toISOString(), 'to', endDateObj.toISOString());

    // Fetch all event reports from casual_waiters2
    console.log('[API] Fetching event reports from casual_waiters2');
    const eventReportsSnapshot = await getDocs(collection(db, 'casual_waiters2'));
    const eventReports = eventReportsSnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((report) => {
        // Ensure cas_waiters is an array and date is valid
        if (!Array.isArray(report.cas_waiters)) {
          console.warn(`[API] Skipping document ${report.id}: cas_waiters is not an array`);
          return false;
        }
        // Parse report date (assuming format "YYYY/MM/DD")
        const reportDate = report.date ? new Date(report.date.replace(/\//g, '-')) : null;
        return reportDate && reportDate >= startDateObj && reportDate <= endDateObj;
      });
    console.log('[API] Fetched event reports:', eventReports.length, eventReports);

    // Derive unique waiters from all cas_waiters arrays
    console.log('[API] Deriving waiters from event reports');
    const waiterNames = [...new Set(
      eventReports.flatMap((report) => report.cas_waiters || [])
    )];
    const waiters = waiterNames.map((name, index) => ({
      id: `waiter_${index}`,
      name,
    }));
    console.log('[API] Fetched waiters:', waiters.length, waiters);

    // If no waiters or events found, return empty stats
    if (waiters.length === 0 || eventReports.length === 0) {
      console.warn('[API] No waiters or events found, returning empty stats');
      return NextResponse.json({ waitersStats: [] });
    }

    // Calculate stats for each waiter
    console.log('[API] Calculating stats for waiters');
    const waitersStats = waiters.map((waiter) => {
      const relevantReports = eventReports.filter((report) =>
        report.cas_waiters.includes(waiter.name)
      );
      const totalHours = relevantReports.reduce(
        (sum, report) => sum + (report.hrs_worked || 0),
        0
      );
      const totalTransport = relevantReports.reduce(
        (sum, report) => sum + (report.transport || 0),
        0
      );
      const totalEvents = relevantReports.length;

      return {
        waiter: {
          id: waiter.id,
          name: waiter.name,
        },
        totalHours,
        totalEvents,
        totalTransport,
        hourlyRate: 0,
        grossEarnings: 0,
        netEarnings: 0,
      };
    });

    console.log('[API] Returning waitersStats:', waitersStats.length);
    return NextResponse.json({ waitersStats });
  } catch (error) {
    console.error('[API] Error fetching staff stats:', error);
    return NextResponse.json({ error: `Failed to fetch stats: ${error.message}` }, { status: 500 });
  }
}