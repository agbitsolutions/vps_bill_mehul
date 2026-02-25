import { Bill } from '../types/bill';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

export const exportBillHistory = (bills: Bill[]) => {
    // Flatten bills to include line items in the excel sheet
    const flattenedData = bills.flatMap(bill => {
        if (!bill.items || bill.items.length === 0) {
            return [{
                'Bill Number': bill.billNumber || bill.id,
                'Customer': bill.customerName,
                'Email': bill.customerEmail || '',
                'Status': bill.status,
                'Date': new Date(bill.createdAt).toLocaleDateString(),
                'Due Date': new Date(bill.dueDate).toLocaleDateString(),
                'Product': '-',
                'Price': 0,
                'Qty': 0,
                'Item Total': 0,
                'Subtotal': bill.subtotal,
                'Tax': bill.taxAmount,
                'Grand Total': bill.totalAmount
            }];
        }

        return bill.items.map((item, index) => ({
            'Bill Number': index === 0 ? (bill.billNumber || bill.id) : '',
            'Customer': index === 0 ? bill.customerName : '',
            'Email': index === 0 ? (bill.customerEmail || '') : '',
            'Status': index === 0 ? bill.status : '',
            'Date': index === 0 ? new Date(bill.createdAt).toLocaleDateString() : '',
            'Due Date': index === 0 ? new Date(bill.dueDate).toLocaleDateString() : '',
            'Product': item.productName,
            'Price': item.price,
            'Qty': item.quantity,
            'Item Total': item.total,
            'Subtotal': index === 0 ? bill.subtotal : '',
            'Tax': index === 0 ? bill.taxAmount : '',
            'Grand Total': index === 0 ? bill.totalAmount : ''
        }));
    });

    const worksheet = XLSX.utils.json_to_sheet(flattenedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bill History');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: EXCEL_TYPE });
    saveAs(data, `Bills_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
};

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';

export const exportToCSV = (bills: Bill[]) => {
    const csvContent = bills.map(bill => Object.values(bill).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'bill_history.csv');
};
