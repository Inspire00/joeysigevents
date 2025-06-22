'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { format, isValid } from 'date-fns';
import { CalendarIcon, ClockIcon, MapPinIcon, UserIcon, DollarSignIcon, TruckIcon } from 'lucide-react';
import { collection, getDocs, where, query } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust path as needed

/**
 * WaiterEventsPage component to display events attended by a waiter
 * @returns {JSX.Element}
 */
export default function WaiterEventsPage() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!name || !startDate || !endDate || !isValid(new Date(startDate)) || !isValid(new Date(endDate))) {
          throw new Error('Invalid query parameters');
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        const q = query(
          collection(db, 'sigwaiters2'),
          where('date', '>=', format(start, 'yyyy/MM/dd')),
          where('date', '<=', format(end, 'yyyy/MM/dd')),
          where('waiters', 'array-contains', name)
        );
        const querySnapshot = await getDocs(q);

        console.log('Query Snapshot:', querySnapshot); // Debug log
        if (querySnapshot.empty) {
          setEvents([]);
          return;
        }

        const eventsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEvents(eventsData);
      } catch (error) {
        console.error('Error fetching events:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (name && startDate && endDate) {
      fetchEvents();
    }
  }, [name, startDate, endDate]);

  if (!name || !startDate || !endDate) {
    return <div className="p-6 text-center text-red-600">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-[#ea176b] mb-8 text-center">
          Events for {name}
        </h1>
        {error ? (
          <p className="text-red-600 text-center">{error}</p>
        ) : loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : events.length === 0 ? (
          <p className="text-gray-600 text-center">No events found for this waiter.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-in"
                style={{ animationDelay: `${events.indexOf(event) * 0.1}s` }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <UserIcon className="w-6 h-6 text-blue-600" />
                  <h3 className="text-xl font-semibold text-gray-800">Event Details</h3>
                </div>
                <hr className="my-4 border-gray-200" />
                <p className="text-gray-700 mb-2 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Date:</span> {event.date}
                </p>
                <p className="text-gray-700 mb-2 flex items-center gap-2">
                  <ClockIcon className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Time:</span> {event.start_time} - {event.end_time}
                </p>
                <p className="text-gray-700 mb-2 flex items-center gap-2">
                  <MapPinIcon className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Location:</span> {event.location}
                </p>
                <p className="text-gray-700 mb-2 flex items-center gap-2">
                  <ClockIcon className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Hours Worked:</span> {event.hrs_worked}
                </p>
               
                <p className="text-blue-700 font-semibold mb-2 flex items-center gap-2">
                  <TruckIcon className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Transport:</span> R{event.transport}
                </p>
                <p className="text-gray-700 mb-2 flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Client:</span> {event.client_name}
                </p>
                <p className="text-gray-700 mb-2 flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Company:</span> {event.companyName}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}