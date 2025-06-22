'use client';

import { useState, useEffect } from 'react';
import { format, isValid } from 'date-fns';
import { Calendar as CalendarIcon, Clock, DollarSign, List, Wallet } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { collection, getDocs, where, query } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust path as needed
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const waiters = [
  'Buhle', 'Brilliant', 'Edwin', 'Howard', 'Judah', 'Kamogelo', 'Karabo', 'Mthulisi', 'Noma', 'Nozipho',
  'Sam', 'Sharon', 'Simangele', 'Simon', 'Skanyiso', 'Thembie', 'Vicky', 'Zanele', 'Zweli'
];

/**
 * Dashboard component for waiters payroll management
 * @returns {JSX.Element}
 */
export default function Dashboard() {
  const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  const [endDate, setEndDate] = useState(new Date());
  const [waitersStats, setWaitersStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const q = query(
          collection(db, 'sigwaiters2'),
          where('date', '>=', format(startDate, 'yyyy/MM/dd')),
          where('date', '<=', format(endDate, 'yyyy/MM/dd'))
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          throw new Error('No data found in Firestore');
        }

        const statsMap = {};
        waiters.forEach((name) => {
          statsMap[name.toLowerCase()] = { totalHours: 0, transport: 0 };
        });

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const docDate = new Date(data.date.replace(/(\d+)\/(\d+)\/(\d+)/, '$2/$3/$1'));

          if (docDate >= startDate && docDate <= endDate) {
            const hrsWorked = data.hrs_worked || 0;
            const transportTotal = data.transport || 0;
            const docWaiters = data.waiters || [];

            waiters.forEach((name) => {
              const lowerName = name.toLowerCase();
              if (docWaiters.includes(name)) {
                statsMap[lowerName].totalHours += hrsWorked;
                statsMap[lowerName].transport += transportTotal;
              }
            });
          }
        });

        const stats = waiters.map((name) => ({
          waiter: { name },
          totalHours: statsMap[name.toLowerCase()].totalHours,
          transport: statsMap[name.toLowerCase()].transport,
          hourlyRate: 0,
          grossEarnings: 0,
        })).sort((a, b) => a.waiter.name.localeCompare(b.waiter.name));

        setWaitersStats(stats);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (startDate && endDate && isValid(startDate) && isValid(endDate)) {
      fetchData();
    }
  }, [startDate, endDate]);

  /**
   * Handle hourly rate change for a waiter
   * @param {string} waiterName - Waiter name
   * @param {string} value - New hourly rate
   */
  const handleHourlyRateChange = (waiterName, value) => {
    const rate = parseFloat(value) || 0;
    setWaitersStats((prev) =>
      prev.map((stat) =>
        stat.waiter.name === waiterName
          ? { 
              ...stat, 
              hourlyRate: rate, 
              grossEarnings: rate * stat.totalHours,
              netPayDue: (rate * stat.totalHours) - stat.transport
            }
          : stat
      )
    );
  };

  /**
   * Handle card click to navigate to events page
   * @param {string} waiterName - Waiter name
   */
  const handleCardClick = (waiterName) => {
    router.push(`/waiter-events?name=${encodeURIComponent(waiterName)}&startDate=${format(startDate, 'yyyy-MM-dd')}&endDate=${format(endDate, 'yyyy-MM-dd')}`);
  };

  /**
   * Render waiters content
   * @returns {JSX.Element}
   */
  const renderWaitersContent = () => (
    <div className="p-6 bg-gray-900 rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-white">Waiters Payroll Statistics</h2>
      <div className="mb-6 flex gap-4">
        <div className="flex items-center gap-2 bg-white rounded-lg">
          <CalendarIcon className="w-5 h-5 text-gray-600" />
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            className="border rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            dateFormat="yyyy-MM-dd"
          />
        </div>
        <div className="flex items-center gap-2 bg-white rounded-lg">
          <CalendarIcon className="w-5 h-5 text-gray-600" />
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            className="border rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            dateFormat="yyyy-MM-dd"
          />
        </div>
      </div>
      {error ? (
        <p className="text-red-600">Error: {error}</p>
      ) : loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {waitersStats.map((stat) => (
          <div
            key={stat.waiter.name}
            onClick={() => {
              // Only trigger navigation if the input is not focused
              if (document.activeElement.tagName.toLowerCase() !== 'input') {
                handleCardClick(stat.waiter.name);
              }
            }}
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-xl font-semibold text-[#ea176b]">
                {stat.waiter.name}
              </h3>
            </div>
            <hr className="my-4 border-gray-200" />
            <p className="text-[#ea176b] font-semibold mb-2 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="font-medium">Total Hours:</span> {stat.totalHours.toFixed(2)}
            </p>
            <div className="mb-4">
              <label className="block text-gray-700 mb-1 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <span>Rate per Hour:</span>
              </label>
              <input
                type="number"
                value={stat.hourlyRate || ''}
                onChange={(e) => handleHourlyRateChange(stat.waiter.name, e.target.value)}
                className="border rounded-lg p-2 w-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter rate"
                min="0"
                step="0.01"
              />
            </div>
            <p className="text-green-700 font-semibold mb-2 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-green-600" />
              <span>Gross Pay:</span> R{stat.grossEarnings.toFixed(2)}
            </p>
            <p className="text-blue-700 font-semibold mb-2 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <span>Total Transport:</span> R{stat.transport.toFixed(2)}
            </p>
            <p className="text-red-700 font-semibold flex items-center gap-2">
              <Wallet className="w-5 h-5 text-green-600" />
              <span>Net Pay Due:</span> R{(stat.grossEarnings - stat.transport).toFixed(2)}
            </p>
          </div>
        ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-[#ea176b] mb-8 text-center">
          Waiters Payroll Dashboard
        </h1>
        {renderWaitersContent()}
      </div>
    </div>
  );
}