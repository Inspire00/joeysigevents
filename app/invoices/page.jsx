'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from '../firebase'; // Adjust path to your Firebase config
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import toast, { Toaster } from 'react-hot-toast';

const MY_COMPANY_DETAILS = {
    name: "Sibutha Projects",
    contactPerson: "Richard Sibutha",
    phone: "0828408141",
    email: "vinnyatsa2@gmail.com",
    address: "83 Mitchell Street, Berea, 2198 Johannesburg, Gauteng Province, South Africa",
    bankName: "FNB",
    accountHolder: "Sibutha Projects",
    accountNumber: "1234567890" // Example account number
};

export default function InvoicePage() {
    const [events, setEvents] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [invoiceData, setInvoiceData] = useState(null);
    const [totalCost, setTotalCost] = useState(0);

   const fetchEvents = async () => {
    setLoading(true);

    // Add console logs to see the raw input values
    console.log("Raw Start Date:", startDate);
    console.log("Raw End Date:", endDate);

    if (!startDate || !endDate) {
        toast.error("Please select a date range.");
        setLoading(false);
        return;
    }

    // Correct the date format to match Firestore's YYYY/MM/DD
    const formattedStartDate = startDate.replace(/-/g, '/');
    const formattedEndDate = endDate.replace(/-/g, '/');
    
    // Add console logs to see the formatted values
    console.log("Formatted Start Date for Firestore Query:", formattedStartDate);
    console.log("Formatted End Date for Firestore Query:", formattedEndDate);

    try {
        const eventsRef = collection(db, "sibutha_staff");
        const q = query(eventsRef, 
            where("date", ">=", formattedStartDate), 
            where("date", "<=", formattedEndDate)
        );
        const querySnapshot = await getDocs(q);
        const fetchedEvents = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            sourceCollection: 'sibutha_staff'
        }));
        setEvents(fetchedEvents);
        toast.success(`${fetchedEvents.length} events found.`);
    } catch (error) {
        console.error("Error fetching events:", error);
        toast.error("Failed to fetch events.");
    } finally {
        setLoading(false);
    }
};

    const fetchInvoiceData = async (eventId) => {
        let staffInvoiceItems = [];
        let total = 0;
        let clientDetails = {};

        try {
            const staffDocRef = doc(db, 'sibutha_staff', eventId);
            const staffDocSnap = await getDoc(staffDocRef);

            if (!staffDocSnap.exists()) {
                toast.error("Event not found in sibutha_staff.");
                return;
            }

            const event = staffDocSnap.data();
            clientDetails = {
                companyName: event.companyName,
                client_name: event.client_name,
                date: event.date,
                location: event.location,
            };

            const processStaff = (staffArray, role, rate) => {
                staffArray?.forEach(s => {
                    if (s.name && typeof s.hours === 'number') {
                        const itemTotal = (s.hours * rate) + (s.transport || 0);
                        total += itemTotal;
                        staffInvoiceItems.push({
                            description: `${role}: ${s.name}`,
                            hours: s.hours,
                            rate: rate,
                            transport: s.transport || 0,
                            total: itemTotal,
                        });
                    }
                });
            };

            processStaff(event.head_waiters, "Head Waiter", 150);
            processStaff(event.waiters, "Waiter", 120);

            const casualsQuery = query(collection(db, 'sibutha_casuals'), where('comp', '==', clientDetails.companyName), where('date', '==', clientDetails.date));
            const casualsSnapshot = await getDocs(casualsQuery);

            casualsSnapshot.docs.forEach(doc => {
                const casualEvent = doc.data();
                casualEvent.cas_waiters?.forEach(cw => {
                    if (cw.name && typeof cw.hoursWorked === 'number') {
                        const rate = 100;
                        const itemTotal = (cw.hoursWorked * rate) + (casualEvent.transport || 0);
                        total += itemTotal;
                        staffInvoiceItems.push({
                            description: `Casual Waiter: ${cw.name}`,
                            hours: cw.hoursWorked,
                            rate: rate,
                            transport: casualEvent.transport || 0,
                            total: itemTotal,
                        });
                    }
                });
            });

        } catch (error) {
            console.error("Error fetching invoice data:", error);
            toast.error("Failed to load invoice data.");
        }
        
        setInvoiceData({ items: staffInvoiceItems, clientDetails });
        setTotalCost(total);
    };

    const handleEventClick = async (event) => {
        setIsModalOpen(true);
        setSelectedEvent(event);
        await fetchInvoiceData(event.id);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedEvent(null);
        setInvoiceData(null);
        setTotalCost(0);
    };

   const generatePDF = async () => {
    const input = document.getElementById('invoice-content');
    if (!input) {
        toast.error("Invoice content not found.");
        return;
    }

    try {
        const canvas = await html2canvas(input);
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210; 
        const pageHeight = 295;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;
        
        let position = 0;

        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        const pdfFileName = `Invoice_${invoiceData.clientDetails.companyName}_${invoiceData.clientDetails.date}.pdf`;
        pdf.save(pdfFileName);
        toast.success("Invoice PDF created!");

    } catch (error) {
        console.error("Failed to generate PDF:", error);
        toast.error("Failed to generate PDF. Check console for details.");
    }
};
    
    return (
        <div className="max-w-4xl mx-auto p-8 font-sans bg-gray-50 rounded-lg shadow-lg">
            <Toaster />
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Sibutha Projects: Invoice Generation</h1>
            
            <div className="flex flex-col md:flex-row justify-center items-center gap-6 mb-8 p-4 bg-white rounded-md shadow-sm">
                <label className="font-bold text-gray-700">
                    Start Date: <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="ml-2 p-2 border border-gray-300 rounded-md" />
                </label>
                <label className="font-bold text-gray-700">
                    End Date: <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="ml-2 p-2 border border-gray-300 rounded-md" />
                </label>
                <button onClick={fetchEvents} disabled={loading} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400">
                    {loading ? 'Loading...' : 'Fetch Events'}
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {events.length > 0 ? (
                    events.map(event => (
                        <div key={event.id} onClick={() => handleEventClick(event)} className="p-6 bg-white border-l-4 border-blue-600 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-all duration-200 ease-in-out">
                            <h3 className="text-xl font-semibold text-gray-900 mb-1">{event.companyName} - {event.client_name}</h3>
                            <p className="text-gray-600"><strong>Date:</strong> {event.date}</p>
                            <p className="text-gray-600"><strong>Location:</strong> {event.location}</p>
                        </div>
                    ))
                ) : (
                    !loading && <p className="col-span-full text-center text-gray-500">Select a date range and click Fetch Events to see available events.</p>
                )}
            </div>

            {isModalOpen && selectedEvent && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-xl shadow-2xl max-w-3xl w-11/12 max-h-[90vh] overflow-y-auto relative">
                        <button onClick={handleCloseModal} className="absolute top-4 right-6 text-gray-500 text-3xl font-light hover:text-gray-900">&times;</button>
                        
                        <div id="invoice-content">
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Invoice for {invoiceData?.clientDetails?.companyName}</h2>
                            </div>
                            <hr className="my-4 border-gray-200" />
                            
                            {invoiceData ? (
                                <>
                                    <p className="text-gray-700"><strong>Date of Service:</strong> {invoiceData.clientDetails.date}</p>
                                    <p className="text-gray-700 mb-4"><strong>Location:</strong> {invoiceData.clientDetails.location}</p>
                                    
                                    <table className="w-full border-collapse text-left">
                                        <thead>
                                            <tr>
                                                <th className="py-3 px-4 bg-gray-100 font-bold text-gray-700 border border-gray-300">Description</th>
                                                <th className="py-3 px-4 bg-gray-100 font-bold text-gray-700 border border-gray-300">Hours</th>
                                                <th className="py-3 px-4 bg-gray-100 font-bold text-gray-700 border border-gray-300">Rate/hr (R)</th>
                                                <th className="py-3 px-4 bg-gray-100 font-bold text-gray-700 border border-gray-300">Transport (R)</th>
                                                <th className="py-3 px-4 bg-gray-100 font-bold text-gray-700 border border-gray-300">Total (R)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {invoiceData.items.map((item, index) => (
                                                <tr key={index}>
                                                    <td className="py-3 px-4 border border-gray-300">{item.description}</td>
                                                    <td className="py-3 px-4 border border-gray-300">{item.hours}</td>
                                                    <td className="py-3 px-4 border border-gray-300">{item.rate}</td>
                                                    <td className="py-3 px-4 border border-gray-300">{item.transport}</td>
                                                    <td className="py-3 px-4 border border-gray-300">{item.total.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    
                                    <div className="mt-8 text-right">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Grand Total: R{totalCost.toFixed(2)}</h3>
                                        <div className="mt-6 p-4 bg-gray-50 border rounded-md text-left">
                                            <h4 className="font-bold text-gray-800">Banking Details</h4>
                                            <p className="text-gray-600">Bank: {MY_COMPANY_DETAILS.bankName}</p>
                                            <p className="text-gray-600">Account Holder: {MY_COMPANY_DETAILS.accountHolder}</p>
                                            <p className="text-gray-600">Account Number: {MY_COMPANY_DETAILS.accountNumber}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-end gap-4 mt-8">
                                        <button onClick={generatePDF} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors">Save PDF</button>
                                        <button onClick={handleCloseModal} className="px-6 py-2 bg-gray-300 text-gray-800 font-semibold rounded-md hover:bg-gray-400 transition-colors">Close</button>
                                    </div>
                                </>
                            ) : (
                                <p className="text-center text-gray-500">Loading invoice data...</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}