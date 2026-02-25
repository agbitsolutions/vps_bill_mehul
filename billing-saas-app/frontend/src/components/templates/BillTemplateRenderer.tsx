import React from 'react';
import { Bill } from '../../types/bill';
import { InvoiceTemplate } from '../../constants/templates';
import A4InvoicePreview from './A4InvoicePreview';
import ClassicProfessionalPreview from './ClassicProfessionalPreview';
import SimpleBasicPreview from './SimpleBasicPreview';
// Add others as needed

interface BillTemplateRendererProps {
    template: InvoiceTemplate;
    bill: Bill;
}

const BillTemplateRenderer: React.FC<BillTemplateRendererProps> = ({ template, bill }) => {
    // Map template IDs to their components
    switch (template.id) {
        case '1':
            return <A4InvoicePreview template={template} bill={bill} />;
        case '2':
            return <A4InvoicePreview template={template} bill={bill} />;
        case '3':
            return <SimpleBasicPreview template={template} bill={bill} />;
        case '4':
            return <ClassicProfessionalPreview template={template} bill={bill} />;
        default:
            return <A4InvoicePreview template={template} bill={bill} />;
    }
};

export default BillTemplateRenderer;
