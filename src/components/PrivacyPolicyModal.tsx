import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Database, 
  CreditCard, 
  Laptop, 
  Cpu, 
  Share2, 
  Lock, 
  ExternalLink, 
  UserCheck, 
  RefreshCw, 
  Mail, 
  Phone, 
  Globe, 
  X, 
  Check, 
  Copy, 
  Printer, 
  Building2, 
  Calendar,
  Scale,
  AlertTriangle,
  Gavel,
  BookOpen,
  Ban,
  ShieldAlert,
  Link as LinkIcon,
  HelpCircle,
  Award,
  Layers,
  ArrowUpRight,
  Trash2,
  MapPin,
  Copyright,
  CheckCircle2,
  AlertOctagon,
  LifeBuoy,
  UploadCloud,
  Clock,
  MessageCircle
} from 'lucide-react';

export type PolicyTab = 'privacy' | 'terms' | 'hyperlink' | 'copyright' | 'disclaimer' | 'help';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: PolicyTab;
}

export default function PrivacyPolicyModal({ 
  isOpen, 
  onClose,
  initialTab = 'hyperlink'
}: PrivacyPolicyModalProps) {
  const [activeTab, setActiveTab] = useState<PolicyTab>(initialTab);
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('sec-1');

  useEffect(() => {
    setActiveTab(initialTab);
    if (initialTab === 'privacy') setActiveSection('sec-1');
    else if (initialTab === 'terms') setActiveSection('tou-1');
    else if (initialTab === 'hyperlink') setActiveSection('hl-1');
    else if (initialTab === 'copyright') setActiveSection('cr-1');
    else if (initialTab === 'disclaimer') setActiveSection('dc-1');
    else if (initialTab === 'help') setActiveSection('hp-1');
  }, [initialTab, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const privacyText = `CSC Dost - Privacy Policy
Effective Date: July 29, 2026
Website: https://www.cscdost.online/
Business Name: CSC Dost ("we," "our," or "us")

Welcome to CSC Dost. We are committed to protecting your privacy and ensuring that your personal information is handled in a safe and responsible manner. This Privacy Policy outlines how we collect, use, disclose, and safeguard your information when you visit our website https://www.cscdost.online/ or utilize our digital services, online form filling, printing, and allied assistance.

1. INFORMATION WE COLLECT
- Personal Identification Information: Name, phone number, email address, postal address, and date of birth.
- Service & Document Details: Identity details (Aadhaar, PAN, photographs, certificates) required for government applications.
- Payment Information: Secure transaction details processed via authorized gateways.
- Technical Data: IP address, browser type, cookies, and device analytics.

2. HOW WE USE YOUR INFORMATION
- Service Delivery: Processing online forms, printing, and citizen queries.
- Communication: Updates, receipts, status notifications, and customer support.
- Operations: Website performance, logs, and security maintenance.
- Legal & Compliance: Preventing fraud and abiding by legal mandates.

3. SHARING AND DISCLOSURE OF INFORMATION
- Service Fulfillment: Sharing with government portals/boards for processing applications.
- Service Providers: Trusted partners (payment gateways, hosting, SMS providers) under confidentiality.
- Legal Requirements: Compliance with statutory orders and protecting rights.

4. DATA SECURITY
Technical, physical, and administrative safeguards to protect your personal data and sensitive documents.

5. THIRD-PARTY LINKS
External links to government/payment portals are subject to their own privacy policies.

6. CHILDREN'S PRIVACY
Intended for general audience. No intentional collection from minors under 18 without guardian consent.

7. CHANGES TO THIS PRIVACY POLICY
Updates will be posted with an updated Effective Date.

8. CONTACT US
Website: https://www.cscdost.online/
Email: cscdost.support@gmail.com
Phone: 7006833767`;

  const termsText = `CSC Dost - Terms of Use
Effective Date: July 29, 2026
Website: https://www.cscdost.online/
Business Name: CSC Dost ("we," "our," or "us")

Welcome to CSC Dost. By accessing or using our website (https://www.cscdost.online/) and our digital services, you agree to be bound by these Terms of Use. If you do not agree with any part of these terms, please do not use our website or services.

1. DESCRIPTION OF SERVICES
CSC Dost provides digital assistance, including but not limited to online form filling, government and citizen service applications, documentation assistance, printing, and other allied digital services.
Disclaimer: CSC Dost acts strictly as a facilitator and service provider to assist citizens in applying for various services. Unless explicitly stated, we are not an official government portal, and our role is limited to data entry and application submission on your behalf based on the information you provide.

2. USER RESPONSIBILITIES
- Accuracy of Information: You are solely responsible for ensuring that all personal details, documents, and data provided to us are accurate, truthful, and up-to-date.
- Document Authenticity: You guarantee that any documents (such as Aadhaar, PAN, certificates) submitted to us for processing are genuine. We are not liable for any rejection due to fake or incorrect documentation.
- Lawful Use: You agree not to use our website or services for any unlawful, fraudulent, or malicious activities.

3. PAYMENTS, FEES, AND REFUNDS
- Service Charges: We charge a nominal consulting, processing, or service fee for the time and effort spent assisting you, separate from official government fees.
- Finality of Payments: Once an online form or application has been successfully submitted and the receipt is generated, our service fee is non-refundable.
- Government Rejections: We do not guarantee approval by respective authorities. If an application is rejected due to eligibility issues or document discrepancies, CSC Dost is not liable for a refund of the service fee.

4. INTELLECTUAL PROPERTY
All content on this website, including text, graphics, logos, and design, is the property of CSC Dost or its content suppliers and is protected by applicable copyright laws.

5. DISCLAIMER OF WARRANTIES
Our website and services are provided on an "as is" and "as available" basis without implied warranties regarding availability or application outcomes.

6. LIMITATION OF LIABILITY
CSC Dost, its proprietors, and employees shall not be liable for any direct, indirect, incidental, or consequential damages, processing delays, or portal downtimes.

7. THIRD-PARTY LINKS
We assume no responsibility for content, privacy policies, or practices of third-party websites or government portals.

8. TERMINATION
We reserve the right to suspend or terminate access for violations of these Terms of Use or harmful conduct.

9. MODIFICATIONS TO THE TERMS
We reserve the right to update or replace any part of these Terms of Use by posting updates on our website.

10. GOVERNING LAW AND JURISDICTION
Governed by the laws of India. Subject to the exclusive jurisdiction of the courts located in Jammu & Kashmir, India.

11. CONTACT INFORMATION
Website: https://www.cscdost.online/
Email / Support: cscdost.support@gmail.com
Phone: 7006833767`;

  const hyperlinkText = `CSC Dost - Hyperlink Policy
Effective Date: July 29, 2026
Website: https://www.cscdost.online/
Business Name: CSC Dost ("we," "our," or "us")

Welcome to CSC Dost. This Hyperlink Policy outlines the terms and conditions regarding the use of hyperlinks on our website, as well as the guidelines for external websites wishing to link to https://www.cscdost.online/.

1. LINKS TO EXTERNAL WEBSITES (OUTBOUND LINKS)
As a digital service provider, our website frequently contains hyperlinks to external, third-party websites. These may include official government portals, educational boards, payment gateways, and other citizen service websites necessary to complete your applications.
- For Convenience Only: These links are provided solely for your convenience and to facilitate the services you have requested.
- No Endorsement: The inclusion of a link does not imply endorsement, approval, or recommendation of the external website, its content, or its operators by CSC Dost.
- Disclaimer of Liability: CSC Dost does not control these external websites. We are not responsible for their content, accuracy, reliability, availability, or any changes and updates made to them.
- Separate Policies: Once you click a link and leave https://www.cscdost.online/, you are subject to the Privacy Policy and Terms of Use of the destination website. We strongly encourage you to review their policies before sharing any personal information or making payments on those platforms.

2. LINKS TO OUR WEBSITE (INBOUND LINKS)
We welcome links to our website from other legitimate and relevant websites, provided you adhere to the following guidelines:
- No Misrepresentation: You must not misrepresent your relationship with CSC Dost or falsely imply that we are endorsing your website, products, or services.
- Accurate Context: The link must be provided in a fair and legal manner that does not damage our reputation or take advantage of it.
- No Framing: You may not frame or mirror any page of our website within another website without our express written permission.
- Content Restrictions: You must not link to us from a website that contains content that is illegal, offensive, defamatory, or infringes on any intellectual property rights.

3. REMOVAL OF LINKS
- From our website: If you find any link on our website that you believe is broken, offensive, or inappropriate, please contact us. We will consider requests to remove links but are not obligated to do so or to respond directly to you.
- From your website: We reserve the right to request the removal of any link to our website at our sole discretion. If we request the removal of a link, you agree to immediately remove it.

4. CHANGES TO THIS POLICY
We reserve the right to amend this Hyperlink Policy at any time without prior notice. Any changes will be posted on this page with an updated "Effective Date."

5. CONTACT US
Website: https://www.cscdost.online/
Email / Support: cscdost.support@gmail.com
Phone: 7006833767`;

  const copyrightText = `CSC Dost - Copyright Policy
Effective Date: July 29, 2026
Website: https://www.cscdost.online/
Business Name: CSC Dost ("we," "our," or "us")

Welcome to CSC Dost. This Copyright Policy outlines the ownership, permitted uses, and restrictions regarding the digital content, materials, and intellectual property found on our website, https://www.cscdost.online/.

1. OWNERSHIP OF CONTENT
All content presented on this website—including but not limited to text, graphics, logos, images, digital downloads, data compilations, user interfaces, website design, and software—is the exclusive property of CSC Dost or its content suppliers. This material is protected by Indian copyright laws, international copyright treaties, and other intellectual property laws.

2. PERMITTED USE
We grant you a limited, non-exclusive, non-transferable, and revocable license to access and use our website strictly in accordance with this policy. You may:
- View and browse the website content on a computer or mobile device.
- Print or download temporary copies of application receipts, forms, or instructional materials strictly for your personal, non-commercial use.

3. PROHIBITED USE
Any use of the website's content outside of the permitted scope requires prior written consent from CSC Dost. Without our explicit written permission, you are strictly prohibited from:
- Copying or Reproducing: Replicating any part of the website's text, layout, or graphics for use on another website or in print.
- Distribution: Selling, renting, licensing, or distributing our content or materials to third parties for commercial gain.
- Modification: Modifying, translating, or creating derivative works based on our website's content.
- Data Extraction: Using automated means (such as web scrapers, bots, or spiders) to harvest data, text, or images from our website.

4. TRADEMARKS
The business name "CSC Dost," our logo, and any related product or service names, designs, and slogans are trademarks of CSC Dost. You may not use these trademarks in any manner that is likely to cause confusion among users, in any advertising or promotional material, or in any way that disparages or discredits CSC Dost, without our prior written consent.

5. COPYRIGHT INFRINGEMENT CLAIMS
We respect the intellectual property rights of others and expect our users to do the same. If you believe that any content on our website infringes upon your copyright, please contact us immediately with the following information:
- A description of the copyrighted work that you claim has been infringed.
- The exact URL or location on our website where the alleged infringing material is found.
- Your contact information, including name, address, telephone number, and email address.
- A statement by you, made under penalty of perjury, that the information in your notice is accurate and that you are the copyright owner or authorized to act on the copyright owner's behalf.
Upon receiving a valid claim, we will investigate the matter and, if necessary, promptly remove or disable access to the infringing content.

6. ENFORCEMENT OF COPYRIGHT
We take the protection of our copyright very seriously. If we discover that you have used our copyright materials in contravention of the license set out in this notice, we may bring legal proceedings against you seeking monetary damages and an injunction to stop you from using those materials. You could also be ordered to pay legal costs.

7. CHANGES TO THIS POLICY
We reserve the right to modify this Copyright Policy at any time. Changes will take effect immediately upon their posting on the website. Your continued use of the website following the posting of changes constitutes your acceptance of such changes.

8. CONTACT INFORMATION
Website: https://www.cscdost.online/
Email / Support: cscdost.support@gmail.com
Phone: 7006833767`;

  const disclaimerText = `CSC Dost - Disclaimer
Effective Date: July 29, 2026
Website: https://www.cscdost.online/
Business Name: CSC Dost ("we," "our," or "us")

The information and services provided by CSC Dost on https://www.cscdost.online/ (the "Site") are for general informational and facilitation purposes only. By using our website and services, you accept and agree to this disclaimer in full.

1. NON-GOVERNMENT ENTITY
CSC Dost is an independent digital service facilitator. While we assist citizens in accessing, filling out, and submitting online forms for various government and non-government services, we are not a government department, nor do we claim to be the official portal for any state or central government entity. Any official logos, department names, or government schemes mentioned on our website are used purely for identification and informational purposes to help users find the right services.

2. NO GUARANTEE OF APPLICATION APPROVAL
We act strictly as a data-entry and application submission assistant based on the details and documents provided by you.
- We do not have the authority to approve, reject, or expedite any application, certificate, or service request.
- The final decision regarding the approval or issuance of any document or service rests entirely with the respective government department or official authority.
- CSC Dost is not responsible for any rejections, delays, or holds placed on your application due to incorrect information, ineligibility, or discrepancies in the documents you provided.

3. ACCURACY OF INFORMATION
While we strive to keep the information on our website updated and correct, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the information, services, or related graphics contained on the Site. Any reliance you place on such information is therefore strictly at your own risk. It is the user's responsibility to verify scheme guidelines, eligibility criteria, and deadlines from official government sources before applying.

4. THIRD-PARTY PORTALS AND TECHNICAL ISSUES
The processing of many services relies on third-party portals, government servers, and external payment gateways.
- CSC Dost cannot be held liable for delays, failed transactions, or application failures resulting from server downtimes, technical glitches, or maintenance activities on these external portals.
- Links to external websites do not constitute an endorsement. We have no control over the nature, content, and availability of those sites.

5. LIMITATION OF LIABILITY
In no event will CSC Dost, its proprietors, employees, or agents be liable for any loss or damage including, without limitation, indirect or consequential loss or damage, or any loss or damage whatsoever arising from loss of data, loss of time, or financial loss arising out of, or in connection with, the use of this website or our digital services.

6. PAYMENTS AND FEES
The fees collected by CSC Dost include government department fees (where applicable) alongside our nominal service/consulting charges for the time and effort spent assisting you. Once an application is successfully submitted on your behalf, our service charges are strictly non-refundable, regardless of the final outcome of the application by the concerned authorities.

7. CONTACT US
If you require any more information or have any questions about our site's disclaimer, please feel free to contact us:
Website: https://www.cscdost.online/
Email / Support: cscdost.support@gmail.com
Phone: 7006833767`;

  const helpText = `CSC Dost - Help & Support
Welcome to the CSC Dost Help Center!

We are here to make your online form filling, government service applications, and digital document processing as smooth and hassle-free as possible. Below you will find a guide on how to use our services, along with answers to commonly asked questions.

1. HOW OUR SERVICE WORKS
- Choose Your Service: Browse our website and select the specific service, form, or application you need assistance with (e.g., PAN card, Aadhaar printing, scholarships, government schemes).
- Review Requirements: Check the list of mandatory documents and details required for your selected service.
- Submit Your Details: Provide your accurate personal details and upload clear, readable copies of your supporting documents through our secure portal or via our designated contact channels.
- Make Payment: Pay the required government fees plus our nominal service charge using our secure online payment methods.
- Processing & Receipt: Our team will process your application on the respective official portals. Once successfully submitted, we will share the final application receipt and tracking details with you.

2. FREQUENTLY ASKED QUESTIONS (FAQs)
General Inquiries:
- What is CSC Dost? CSC Dost is an independent digital service facilitator. We act as an assistant to help citizens correctly fill out and submit online applications for various government and non-government services.
- Are you an official government portal? No. We are an independent service provider and not an official government entity. We process applications on official government portals on your behalf based on the data you provide.

Applications & Documents:
- How do I know which documents are required? The required documents vary by service. When you select a specific service on our website, a list of mandatory documents (such as Aadhaar, photos, income certificates) will be displayed.
- What if I make a mistake in my provided details? Please contact us immediately. If the application has not yet been finally submitted to the government portal, we can correct it. Once a final submission is made, corrections usually require a formal modification request which may incur extra time or official fees.
- How can I track the status of my application? Upon successful submission, we will provide you with an application/acknowledgement number. You can use this number to track your status directly on the respective official government portal, or you can contact our support team for assistance.

Payments & Refunds:
- What are your service charges? Our charges include the actual fee levied by the respective department (if any) plus a nominal service fee for our time, data entry, and assistance. The exact breakdown is provided before you make a payment.
- Can I get a refund if my application is rejected? Our service fee covers the time and effort spent filling and submitting your application and is strictly non-refundable once the receipt is generated. We are not responsible for rejections made by official departments due to eligibility issues or incorrect documents provided by you.

3. DOCUMENT UPLOAD GUIDELINES
- Clarity: Ensure all scanned copies or photos of documents are clear, well-lit, and fully readable.
- No Cropping: Do not cut off the edges of certificates or ID cards. The entire document must be visible.
- File Format: We generally accept PDF, JPG, and PNG formats.
- Authenticity: Never submit forged, expired, or altered documents.

4. STILL NEED HELP? CONTACT US
Website: https://www.cscdost.online/
Email Support: cscdost.support@gmail.com
Phone / WhatsApp: 7006833767
Working Hours: Monday to Saturday, 09:00 AM – 08:30 PM`;

  const handleCopy = () => {
    let textToCopy = privacyText;
    if (activeTab === 'terms') textToCopy = termsText;
    if (activeTab === 'hyperlink') textToCopy = hyperlinkText;
    if (activeTab === 'copyright') textToCopy = copyrightText;
    if (activeTab === 'disclaimer') textToCopy = disclaimerText;
    if (activeTab === 'help') textToCopy = helpText;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const privacySections = [
    { id: 'sec-1', label: '1. Information Collected' },
    { id: 'sec-2', label: '2. How We Use' },
    { id: 'sec-3', label: '3. Data Sharing' },
    { id: 'sec-4', label: '4. Security' },
    { id: 'sec-5', label: '5. Third-Party Links' },
    { id: 'sec-6', label: '6. Children' },
    { id: 'sec-7', label: '7. Updates' },
    { id: 'sec-8', label: '8. Contact' }
  ];

  const termsSections = [
    { id: 'tou-1', label: '1. Services' },
    { id: 'tou-2', label: '2. User Responsibilities' },
    { id: 'tou-3', label: '3. Payments & Refunds' },
    { id: 'tou-4', label: '4. Intellectual Property' },
    { id: 'tou-5', label: '5. Warranties' },
    { id: 'tou-6', label: '6. Limitation of Liability' },
    { id: 'tou-7', label: '7. Third-Party Links' },
    { id: 'tou-8', label: '8. Termination' },
    { id: 'tou-9', label: '9. Modifications' },
    { id: 'tou-10', label: '10. Jurisdiction' },
    { id: 'tou-11', label: '11. Contact' }
  ];

  const hyperlinkSections = [
    { id: 'hl-1', label: '1. Outbound Links' },
    { id: 'hl-2', label: '2. Inbound Links' },
    { id: 'hl-3', label: '3. Link Removal' },
    { id: 'hl-4', label: '4. Policy Changes' },
    { id: 'hl-5', label: '5. Contact Us' }
  ];

  const copyrightSections = [
    { id: 'cr-1', label: '1. Ownership' },
    { id: 'cr-2', label: '2. Permitted Use' },
    { id: 'cr-3', label: '3. Prohibited Use' },
    { id: 'cr-4', label: '4. Trademarks' },
    { id: 'cr-5', label: '5. Infringement Claims' },
    { id: 'cr-6', label: '6. Enforcement' },
    { id: 'cr-7', label: '7. Policy Changes' },
    { id: 'cr-8', label: '8. Contact Info' }
  ];

  const disclaimerSections = [
    { id: 'dc-1', label: '1. Non-Government Entity' },
    { id: 'dc-2', label: '2. Application Approval' },
    { id: 'dc-3', label: '3. Accuracy' },
    { id: 'dc-4', label: '4. Third-Party Portals' },
    { id: 'dc-5', label: '5. Liability Limits' },
    { id: 'dc-6', label: '6. Payments & Fees' },
    { id: 'dc-7', label: '7. Contact Us' }
  ];

  const helpSections = [
    { id: 'hp-1', label: '1. How It Works' },
    { id: 'hp-2', label: '2. FAQs' },
    { id: 'hp-3', label: '3. Document Upload' },
    { id: 'hp-4', label: '4. Contact Support' }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-900 dark:text-slate-100 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* TRICOLOR HEADER ACCENT */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#128807]"></div>

        {/* MODAL NAVBAR / HEADER */}
        <div className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl border transition-all ${
              activeTab === 'privacy' 
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                : activeTab === 'terms'
                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                : activeTab === 'hyperlink'
                ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                : activeTab === 'copyright'
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                : activeTab === 'disclaimer'
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                : 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20'
            }`}>
              {activeTab === 'privacy' && <ShieldCheck className="w-6 h-6" />}
              {activeTab === 'terms' && <Scale className="w-6 h-6" />}
              {activeTab === 'hyperlink' && <LinkIcon className="w-6 h-6" />}
              {activeTab === 'copyright' && <Copyright className="w-6 h-6" />}
              {activeTab === 'disclaimer' && <AlertTriangle className="w-6 h-6" />}
              {activeTab === 'help' && <LifeBuoy className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white font-display tracking-tight">
                  {activeTab === 'privacy' && 'Privacy Policy'}
                  {activeTab === 'terms' && 'Terms of Use'}
                  {activeTab === 'hyperlink' && 'Hyperlink Policy'}
                  {activeTab === 'copyright' && 'Copyright Policy'}
                  {activeTab === 'disclaimer' && 'Disclaimer'}
                  {activeTab === 'help' && 'Help & Support Center'}
                </h2>
                <span className="text-[10px] font-black uppercase tracking-wider bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-orange-300 px-2.5 py-0.5 rounded-full border border-orange-200 dark:border-orange-800">
                  CSC DOST
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Effective Date: <strong>July 29, 2026</strong></span>
              </p>
            </div>
          </div>

          {/* TAB SWITCHER & ACTION BUTTONS */}
          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2">
            
            {/* POLICY TYPE TOGGLE */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-extrabold overflow-x-auto no-scrollbar">
              <button
                onClick={() => { setActiveTab('privacy'); setActiveSection('sec-1'); }}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'privacy' 
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Privacy</span>
              </button>
              <button
                onClick={() => { setActiveTab('terms'); setActiveSection('tou-1'); }}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'terms' 
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Terms</span>
              </button>
              <button
                onClick={() => { setActiveTab('hyperlink'); setActiveSection('hl-1'); }}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'hyperlink' 
                    ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Hyperlink</span>
              </button>
              <button
                onClick={() => { setActiveTab('copyright'); setActiveSection('cr-1'); }}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'copyright' 
                    ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Copyright className="w-3.5 h-3.5" />
                <span>Copyright</span>
              </button>
              <button
                onClick={() => { setActiveTab('disclaimer'); setActiveSection('dc-1'); }}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'disclaimer' 
                    ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Disclaimer</span>
              </button>
              <button
                onClick={() => { setActiveTab('help'); setActiveSection('hp-1'); }}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'help' 
                    ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LifeBuoy className="w-3.5 h-3.5" />
                <span>Help &amp; Support</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleCopy}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                title="Copy Policy Text"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>

              <button
                onClick={handlePrint}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                title="Print Policy"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

          </div>
        </div>

        {/* QUICK NAVIGATION BAR */}
        <div className="bg-slate-50 dark:bg-slate-950/60 px-6 py-2.5 border-b border-slate-200 dark:border-slate-800/80 overflow-x-auto no-scrollbar flex items-center gap-2 text-[11px] font-bold">
          <span className="text-slate-400 uppercase tracking-wider text-[10px] shrink-0 font-extrabold mr-1">Quick Jump:</span>
          {(
            activeTab === 'privacy' 
              ? privacySections 
              : activeTab === 'terms' 
              ? termsSections 
              : activeTab === 'hyperlink'
              ? hyperlinkSections
              : activeTab === 'copyright'
              ? copyrightSections
              : activeTab === 'disclaimer'
              ? disclaimerSections
              : helpSections
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`px-3 py-1 rounded-lg shrink-0 transition-all cursor-pointer ${
                activeSection === item.id 
                  ? activeTab === 'privacy' 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : activeTab === 'terms'
                    ? 'bg-[#0051a5] text-white shadow-xs'
                    : activeTab === 'hyperlink'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : activeTab === 'copyright'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : activeTab === 'disclaimer'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* POLICY CONTENT BODY */}
        <div className="p-6 overflow-y-auto space-y-8 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          
          {/* ============================================================ */}
          {/* TAB 1: PRIVACY POLICY CONTENT */}
          {/* ============================================================ */}
          {activeTab === 'privacy' && (
            <>
              {/* WELCOME / HERO NOTICE CARD */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 via-slate-50 to-emerald-50 dark:from-blue-950/40 dark:via-slate-900 dark:to-emerald-950/40 border border-blue-200 dark:border-blue-900/60 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300 font-extrabold text-sm uppercase tracking-wide">
                  <Building2 className="w-4 h-4 text-orange-500" />
                  <span>Website &amp; Business Overview</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 text-[10px] uppercase font-extrabold block">Official Website</span>
                    <a href="https://www.cscdost.online/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 mt-0.5">
                      <span>https://www.cscdost.online/</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 text-[10px] uppercase font-extrabold block">Business Name</span>
                    <span className="font-bold text-slate-900 dark:text-white">CSC Dost ("we," "our," or "us")</span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 pt-1 leading-relaxed">
                  Welcome to <strong>CSC Dost</strong>. We are committed to protecting your privacy and ensuring that your personal information is handled in a safe and responsible manner. This Privacy Policy outlines how we collect, use, disclose, and safeguard your information when you visit our website <a href="https://www.cscdost.online/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline font-semibold">https://www.cscdost.online/</a> or utilize our digital services, online form filling, printing, and allied assistance.
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 italic font-medium">
                  Please read this Privacy Policy carefully. By accessing or using our website and services, you agree to the collection and use of information in accordance with this policy.
                </p>
              </div>

              {/* 1. INFORMATION WE COLLECT */}
              <section id="sec-1" className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500 text-white rounded-xl shadow-xs">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      1. Information We Collect
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Data gathered through interaction, form submissions, and online service inquiries.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-1.5 hover:border-blue-300 transition-colors">
                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold text-xs uppercase tracking-wide">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <span>Personal Identification</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Name, phone number, email address, postal address, and date of birth when provided by you for registration, candidate verification, or service requests.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-1.5 hover:border-blue-300 transition-colors">
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs uppercase tracking-wide">
                      <ShieldCheck className="w-4 h-4 text-amber-500" />
                      <span>Service &amp; Document Details</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Information, documents, and identity details (such as Aadhaar, PAN, photographs, or academic certificates) required specifically for processing online applications, government/citizen services, or documentation requested by you.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-1.5 hover:border-blue-300 transition-colors">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-wide">
                      <CreditCard className="w-4 h-4 text-emerald-500" />
                      <span>Payment Information</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Transaction details, payment confirmations, and billing information processed through secure payment gateways (we do <strong>not</strong> store your complete banking credentials or sensitive card PINs/CVVs on our servers).
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-1.5 hover:border-blue-300 transition-colors">
                    <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 font-bold text-xs uppercase tracking-wide">
                      <Laptop className="w-4 h-4 text-purple-500" />
                      <span>Technical Data</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      IP address, browser type, device information, operating system, and browsing behavior collected automatically through cookies and analytics tools to improve website performance.
                    </p>
                  </div>
                </div>
              </section>

              {/* 2. HOW WE USE YOUR INFORMATION */}
              <section id="sec-2" className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-xs">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      2. How We Use Your Information
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Purposes for processing your data for efficient service delivery.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-emerald-500 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">✓</span>
                    <div>
                      <h4 className="font-extrabold text-xs text-emerald-900 dark:text-emerald-300 uppercase tracking-wide">Service Delivery</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">To process your online applications, service requests, print jobs, and customer queries efficiently.</p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-emerald-500 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">✓</span>
                    <div>
                      <h4 className="font-extrabold text-xs text-emerald-900 dark:text-emerald-300 uppercase tracking-wide">Communication</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">To contact you regarding the status of your services, send confirmations, updates, receipts, or respond to your inquiries.</p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-emerald-500 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">✓</span>
                    <div>
                      <h4 className="font-extrabold text-xs text-emerald-900 dark:text-emerald-300 uppercase tracking-wide">Business Operations</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">To manage our website, improve user experience, maintain transaction records, and ensure proper functioning of our portal.</p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-emerald-500 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">✓</span>
                    <div>
                      <h4 className="font-extrabold text-xs text-emerald-900 dark:text-emerald-300 uppercase tracking-wide">Legal &amp; Compliance</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">To comply with applicable legal obligations, prevent fraudulent activities, and safeguard our business rights.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* 3. SHARING AND DISCLOSURE */}
              <section id="sec-3" className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500 text-white rounded-xl shadow-xs">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      3. Sharing and Disclosure of Information
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Strictly controlled disclosure policy — we never sell or rent your personal data.
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 bg-indigo-50/60 dark:bg-indigo-950/30 p-3.5 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 font-medium">
                  We value your trust and do <strong>not</strong> sell, trade, or rent your personal information to third parties. We may share your information only in the following limited circumstances:
                </p>

                <ul className="space-y-2.5 text-xs">
                  <li className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
                    <span className="p-1 bg-indigo-500 text-white rounded-md text-[10px] font-black shrink-0 mt-0.5">3.1</span>
                    <div>
                      <strong className="text-slate-900 dark:text-white">Service Fulfillment:</strong> With authorized government portals, official boards, or service partners <em>strictly</em> as required to complete the specific application or service requested by you.
                    </div>
                  </li>
                  <li className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
                    <span className="p-1 bg-indigo-500 text-white rounded-md text-[10px] font-black shrink-0 mt-0.5">3.2</span>
                    <div>
                      <strong className="text-slate-900 dark:text-white">Service Providers:</strong> With trusted third-party vendors (such as payment gateway providers, hosting services, or SMS notification providers) who assist us in operating our website and conducting our business, under strict confidentiality obligations.
                    </div>
                  </li>
                  <li className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
                    <span className="p-1 bg-indigo-500 text-white rounded-md text-[10px] font-black shrink-0 mt-0.5">3.3</span>
                    <div>
                      <strong className="text-slate-900 dark:text-white">Legal Requirements:</strong> When required by law, court order, or governmental regulations, or to protect the safety, rights, and property of CSC Dost, our customers, or others.
                    </div>
                  </li>
                </ul>
              </section>

              {/* 4. DATA SECURITY */}
              <section id="sec-4" className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500 text-white rounded-xl shadow-xs">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      4. Data Security
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Safeguarding your documents and personal records.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-900/60 text-xs space-y-2">
                  <p className="text-slate-700 dark:text-amber-200 font-medium leading-relaxed">
                    We implement appropriate technical, physical, and administrative security measures to protect your personal data and sensitive documents from unauthorized access, alteration, disclosure, or destruction.
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] italic">
                    However, please note that no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
                  </p>
                </div>
              </section>

              {/* 5. THIRD-PARTY LINKS & 6. CHILDREN'S PRIVACY */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800/80">
                <section id="sec-5" className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-cyan-500" />
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      5. Third-Party Links
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Our website may contain links to external websites, payment portals, or government resources (such as official service portals). We are not responsible for the privacy practices or content of such third-party sites. We encourage you to read the privacy policies of any external website you visit.
                  </p>
                </section>

                <section id="sec-6" className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-rose-500" />
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      6. Children's Privacy
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Our services are generally intended for a general audience. We do not knowingly collect personal information from individuals under the age of 18 without parental or guardian consent. If you believe we have inadvertently collected information from a minor, please contact us immediately so we can take steps to remove it.
                  </p>
                </section>
              </div>

              {/* 7. CHANGES TO THIS PRIVACY POLICY */}
              <section id="sec-7" className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-500 text-white rounded-xl shadow-xs">
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      7. Changes to This Privacy Policy
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Periodic policy updates and notifications.
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-1">
                  We reserve the right to update or modify this Privacy Policy at any time. Any changes will be posted on this page with an updated "Effective Date." We encourage you to review this Privacy Policy periodically to stay informed about how we protect your information.
                </p>
              </section>

              {/* 8. CONTACT US CARD */}
              <section id="sec-8" className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950 text-white shadow-xl space-y-4">
                <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-orange-500 text-white rounded-xl">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-white">
                        8. Contact Us
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Questions, concerns, or requests regarding this Privacy Policy?
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full font-bold">
                    CSC DOST Helpdesk
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-blue-400" /> Website
                    </span>
                    <a href="https://www.cscdost.online/" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-300 hover:underline block truncate">
                      https://www.cscdost.online/
                    </a>
                  </div>

                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-emerald-400" /> Email / Support
                    </span>
                    <a href="mailto:cscdost.support@gmail.com" className="font-bold text-emerald-300 hover:underline block truncate">
                      cscdost.support@gmail.com
                    </a>
                  </div>

                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-amber-400" /> Phone Support
                    </span>
                    <a href="tel:7006833767" className="font-bold text-amber-300 hover:underline block">
                      +91 7006833767
                    </a>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* ============================================================ */}
          {/* TAB 2: TERMS OF USE CONTENT */}
          {/* ============================================================ */}
          {activeTab === 'terms' && (
            <>
              {/* HERO WELCOME NOTICE */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 via-slate-50 to-indigo-50 dark:from-blue-950/40 dark:via-slate-900 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-900/60 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300 font-extrabold text-sm uppercase tracking-wide">
                  <Scale className="w-4 h-4 text-blue-600" />
                  <span>Terms of Use Agreement</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 text-[10px] uppercase font-extrabold block">Official Website</span>
                    <a href="https://www.cscdost.online/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 mt-0.5">
                      <span>https://www.cscdost.online/</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 text-[10px] uppercase font-extrabold block">Business Name</span>
                    <span className="font-bold text-slate-900 dark:text-white">CSC Dost ("we," "our," or "us")</span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 pt-1 leading-relaxed">
                  Welcome to <strong>CSC Dost</strong>. By accessing or using our website (<a href="https://www.cscdost.online/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline font-semibold">https://www.cscdost.online/</a>) and our digital services, you agree to be bound by these Terms of Use. If you do not agree with any part of these terms, please do not use our website or services.
                </p>
              </div>

              {/* 1. DESCRIPTION OF SERVICES */}
              <section id="tou-1" className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      1. Description of Services
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Scope of online form filling and digital support services.
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  CSC Dost provides digital assistance, including but not limited to online form filling, government and citizen service applications, documentation assistance, printing, and other allied digital services.
                </p>

                {/* IMPORTANT DISCLAIMER CALLOUT */}
                <div className="p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-extrabold text-xs uppercase tracking-wide">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Important Disclaimer</span>
                  </div>
                  <p className="text-xs text-amber-950 dark:text-amber-200 leading-relaxed font-medium">
                    CSC Dost acts strictly as a facilitator and service provider to assist citizens in applying for various services. Unless explicitly stated, we are not an official government portal, and our role is limited to data entry and application submission on your behalf based on the information you provide.
                  </p>
                </div>
              </section>

              {/* 2. USER RESPONSIBILITIES */}
              <section id="tou-2" className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      2. User Responsibilities
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Your obligations when requesting applications or processing documents.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                      Mandate 2.1
                    </span>
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white pt-1">Accuracy of Information</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      You are solely responsible for ensuring that all personal details, documents, and data provided to us for filling out forms or applications are accurate, truthful, and up-to-date.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-md">
                      Mandate 2.2
                    </span>
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white pt-1">Document Authenticity</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      You guarantee that any documents (such as Aadhaar, PAN, certificates) submitted to us for processing are genuine. We are not liable for any rejection of applications due to fake, expired, or incorrect documentation provided by you.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/60 px-2 py-0.5 rounded-md">
                      Mandate 2.3
                    </span>
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white pt-1">Lawful Use</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      You agree not to use our website or services for any unlawful, fraudulent, or malicious activities.
                    </p>
                  </div>
                </div>
              </section>

              {/* 3. PAYMENTS, FEES, AND REFUNDS */}
              <section id="tou-3" className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      3. Payments, Fees, and Refunds
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Terms regarding service charges, processing fees, and non-refundable policy.
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">₹</span>
                    <div>
                      <strong className="text-slate-900 dark:text-white text-xs block font-extrabold uppercase tracking-wide">Service Charges</strong>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                        We charge a nominal consulting, processing, or service fee for the time and effort spent assisting you, which is separate from any official government or departmental fees.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-rose-50/70 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900/60 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-rose-600 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">✕</span>
                    <div>
                      <strong className="text-rose-950 dark:text-rose-300 text-xs block font-extrabold uppercase tracking-wide">Finality of Payments</strong>
                      <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
                        Once an online form or application has been successfully submitted and the receipt is generated, our service fee is non-refundable.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-700 dark:bg-slate-800 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">!</span>
                    <div>
                      <strong className="text-slate-900 dark:text-white text-xs block font-extrabold uppercase tracking-wide">Government Rejections</strong>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                        We do not guarantee the approval of any application by the respective authorities or government departments. If an application is rejected by the concerned department due to eligibility issues or document discrepancies, CSC Dost is not liable for a refund of the service fee.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* 4. INTELLECTUAL PROPERTY & 5. DISCLAIMER OF WARRANTIES */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800/80">
                <section id="tou-4" className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-500" />
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      4. Intellectual Property
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    All content on this website, including text, graphics, logos, and design, is the property of CSC Dost or its content suppliers and is protected by applicable copyright and intellectual property laws. You may not reproduce, distribute, or create derivative works from any part of our website without prior written consent.
                  </p>
                </section>

                <section id="tou-5" className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-orange-500" />
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      5. Disclaimer of Warranties
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Our website and services are provided on an "as is" and "as available" basis. While we strive to provide accurate and timely services, we make no warranties, expressed or implied, regarding the continuous availability, accuracy, or reliability of our website or the outcome of the applications processed through us.
                  </p>
                </section>
              </div>

              {/* 6. LIMITATION OF LIABILITY */}
              <section id="tou-6" className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-600 text-white rounded-xl shadow-xs">
                    <Gavel className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      6. Limitation of Liability
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Legal limits on damage claims and operational disruptions.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  To the maximum extent permitted by law, CSC Dost, its proprietors, and employees shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising out of your use of our website, errors or delays in application processing, server downtimes, or issues arising from third-party or government portals.
                </div>
              </section>

              {/* 7. THIRD-PARTY LINKS, 8. TERMINATION, 9. MODIFICATIONS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-slate-200 dark:border-slate-800/80">
                <section id="tou-7" className="p-3.5 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">7. Third-Party Links</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    Our website may contain links to third-party portals or payment gateways. We have no control over and assume no responsibility for third-party practices.
                  </p>
                </section>

                <section id="tou-8" className="p-3.5 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">8. Termination</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    We reserve the right to suspend or terminate access for conduct violating these Terms of Use or harmful to other users or CSC Dost.
                  </p>
                </section>

                <section id="tou-9" className="p-3.5 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">9. Modifications</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    We reserve the right to update or replace any part of these Terms by posting updates here. Check this page periodically for changes.
                  </p>
                </section>
              </div>

              {/* 10. GOVERNING LAW AND JURISDICTION */}
              <section id="tou-10" className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 space-y-2 pt-4">
                <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300 font-extrabold text-xs uppercase tracking-wide">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>10. Governing Law and Jurisdiction</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                  These Terms of Use shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or relating to these terms or our services shall be subject to the exclusive jurisdiction of the courts located in <strong>Jammu &amp; Kashmir, India</strong>.
                </p>
              </section>

              {/* 11. CONTACT INFORMATION CARD */}
              <section id="tou-11" className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950 text-white shadow-xl space-y-4">
                <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-600 text-white rounded-xl">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-white">
                        11. Contact Information
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Questions or concerns regarding these Terms of Use?
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-1 rounded-full font-bold">
                    Terms &amp; Support
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-blue-400" /> Website
                    </span>
                    <a href="https://www.cscdost.online/" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-300 hover:underline block truncate">
                      https://www.cscdost.online/
                    </a>
                  </div>

                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-emerald-400" /> Email / Support
                    </span>
                    <a href="mailto:cscdost.support@gmail.com" className="font-bold text-emerald-300 hover:underline block truncate">
                      cscdost.support@gmail.com
                    </a>
                  </div>

                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-amber-400" /> Phone
                    </span>
                    <a href="tel:7006833767" className="font-bold text-amber-300 hover:underline block">
                      +91 7006833767
                    </a>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* ============================================================ */}
          {/* TAB 3: HYPERLINK POLICY CONTENT */}
          {/* ============================================================ */}
          {activeTab === 'hyperlink' && (
            <>
              {/* HERO WELCOME NOTICE */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-50 via-slate-50 to-blue-50 dark:from-purple-950/40 dark:via-slate-900 dark:to-blue-950/40 border border-purple-200 dark:border-purple-900/60 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-purple-900 dark:text-purple-300 font-extrabold text-sm uppercase tracking-wide">
                  <LinkIcon className="w-4 h-4 text-purple-600" />
                  <span>Hyperlink Policy</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 text-[10px] uppercase font-extrabold block">Official Website</span>
                    <a href="https://www.cscdost.online/" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 font-bold hover:underline flex items-center gap-1 mt-0.5">
                      <span>https://www.cscdost.online/</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 text-[10px] uppercase font-extrabold block">Business Name</span>
                    <span className="font-bold text-slate-900 dark:text-white">CSC Dost ("we," "our," or "us")</span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 pt-1 leading-relaxed">
                  Welcome to <strong>CSC Dost</strong>. This Hyperlink Policy outlines the terms and conditions regarding the use of hyperlinks on our website, as well as the guidelines for external websites wishing to link to <a href="https://www.cscdost.online/" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 underline font-semibold">https://www.cscdost.online/</a>.
                </p>
              </div>

              {/* 1. LINKS TO EXTERNAL WEBSITES (OUTBOUND LINKS) */}
              <section id="hl-1" className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-600 text-white rounded-xl shadow-xs">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      1. Links to External Websites (Outbound Links)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Rules regarding links departing from CSC Dost to third-party portals.
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  As a digital service provider, our website frequently contains hyperlinks to external, third-party websites. These may include official government portals, educational boards, payment gateways, and other citizen service websites necessary to complete your applications.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-1.5 hover:border-purple-300 transition-colors">
                    <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 font-bold text-xs uppercase tracking-wide">
                      <HelpCircle className="w-4 h-4 text-purple-500" />
                      <span>For Convenience Only</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      These links are provided solely for your convenience and to facilitate the digital services and applications you have requested.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-1.5 hover:border-purple-300 transition-colors">
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs uppercase tracking-wide">
                      <ShieldAlert className="w-4 h-4 text-amber-500" />
                      <span>No Endorsement</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      The inclusion of a link does not imply endorsement, approval, or recommendation of the external website, its content, or its operators by CSC Dost.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-1.5 hover:border-purple-300 transition-colors">
                    <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-xs uppercase tracking-wide">
                      <AlertTriangle className="w-4 h-4 text-rose-500" />
                      <span>Disclaimer of Liability</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      CSC Dost does not control these external websites. We are not responsible for their content, accuracy, reliability, availability, or any changes and updates made to them.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-1.5 hover:border-purple-300 transition-colors">
                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold text-xs uppercase tracking-wide">
                      <Lock className="w-4 h-4 text-blue-500" />
                      <span>Separate Policies</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Once you click a link and leave <a href="https://www.cscdost.online/" target="_blank" rel="noopener noreferrer" className="underline font-semibold">cscdost.online</a>, you are subject to the Privacy Policy and Terms of Use of the destination website. Review their policies carefully.
                    </p>
                  </div>

                </div>
              </section>

              {/* 2. LINKS TO OUR WEBSITE (INBOUND LINKS) */}
              <section id="hl-2" className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      2. Links to Our Website (Inbound Links)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Guidelines for third-party portals wishing to link to CSC Dost.
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  We welcome links to our website from other legitimate and relevant websites, provided you adhere strictly to the following guidelines:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-blue-600 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">2.1</span>
                    <div>
                      <strong className="text-slate-900 dark:text-white text-xs block font-extrabold uppercase tracking-wide">No Misrepresentation</strong>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                        You must not misrepresent your relationship with CSC Dost or falsely imply that we are endorsing your website, products, or services.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-blue-600 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">2.2</span>
                    <div>
                      <strong className="text-slate-900 dark:text-white text-xs block font-extrabold uppercase tracking-wide">Accurate Context</strong>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                        The link must be provided in a fair and legal manner that does not damage our reputation or take unfair advantage of it.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-purple-600 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">2.3</span>
                    <div>
                      <strong className="text-slate-900 dark:text-white text-xs block font-extrabold uppercase tracking-wide">No Framing</strong>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                        You may not frame or mirror any page of our website within another website without our express written permission.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-rose-600 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">2.4</span>
                    <div>
                      <strong className="text-slate-900 dark:text-white text-xs block font-extrabold uppercase tracking-wide">Content Restrictions</strong>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                        You must not link to us from a website that contains illegal, offensive, defamatory content, or infringes on any intellectual property rights.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* 3. REMOVAL OF LINKS & 4. CHANGES TO THIS POLICY */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800/80">
                
                <section id="hl-3" className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-rose-500" />
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      3. Removal of Links
                    </h3>
                  </div>
                  <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
                    <li>
                      <strong className="text-slate-900 dark:text-white">From our website:</strong> If you find any link on our website that you believe is broken, offensive, or inappropriate, please contact us. We will consider removal requests but are not obligated to do so.
                    </li>
                    <li>
                      <strong className="text-slate-900 dark:text-white">From your website:</strong> We reserve the right to request the removal of any link to our website at our sole discretion. You agree to immediately remove it upon notice.
                    </li>
                  </ul>
                </section>

                <section id="hl-4" className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-teal-500" />
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      4. Changes to This Policy
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    We reserve the right to amend this Hyperlink Policy at any time without prior notice. Any changes will be posted on this page with an updated "Effective Date."
                  </p>
                </section>

              </div>

              {/* 5. CONTACT US CARD */}
              <section id="hl-5" className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-purple-950 text-white shadow-xl space-y-4">
                <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-600 text-white rounded-xl">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-white">
                        5. Contact Us
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Questions or permission requests regarding hyperlinks?
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-1 rounded-full font-bold">
                    Hyperlink Support
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-blue-400" /> Website
                    </span>
                    <a href="https://www.cscdost.online/" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-300 hover:underline block truncate">
                      https://www.cscdost.online/
                    </a>
                  </div>

                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-emerald-400" /> Email / Support
                    </span>
                    <a href="mailto:cscdost.support@gmail.com" className="font-bold text-emerald-300 hover:underline block truncate">
                      cscdost.support@gmail.com
                    </a>
                  </div>

                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-amber-400" /> Phone Support
                    </span>
                    <a href="tel:7006833767" className="font-bold text-amber-300 hover:underline block">
                      +91 7006833767
                    </a>
                  </div>
                </div>
              </section>

            </>
          )}

          {/* ============================================================ */}
          {/* TAB 4: COPYRIGHT POLICY CONTENT */}
          {/* ============================================================ */}
          {activeTab === 'copyright' && (
            <>
              {/* HERO WELCOME NOTICE */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-slate-50 to-orange-50 dark:from-amber-950/40 dark:via-slate-900 dark:to-orange-950/40 border border-amber-200 dark:border-amber-900/60 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-extrabold text-sm uppercase tracking-wide">
                  <Copyright className="w-4 h-4 text-amber-600" />
                  <span>Intellectual Property &amp; Copyright Policy</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 text-[10px] uppercase font-extrabold block">Official Website</span>
                    <a href="https://www.cscdost.online/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 mt-0.5">
                      <span>https://www.cscdost.online/</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 text-[10px] uppercase font-extrabold block">Business Name</span>
                    <span className="font-bold text-slate-900 dark:text-white">CSC Dost ("we," "our," or "us")</span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 pt-1 leading-relaxed">
                  Welcome to <strong>CSC Dost</strong>. This Copyright Policy outlines the ownership, permitted uses, and restrictions regarding the digital content, materials, and intellectual property found on our website, <a href="https://www.cscdost.online/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline font-semibold">https://www.cscdost.online/</a>.
                </p>
              </div>

              {/* 1. OWNERSHIP OF CONTENT */}
              <section id="cr-1" className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-600 text-white rounded-xl shadow-xs">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      1. Ownership of Content
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Exclusive property rights and statutory protections.
                    </p>
                  </div>
                </div>

                <div className="p-4.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 space-y-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  <p>
                    All content presented on this website—including but not limited to text, graphics, logos, images, digital downloads, data compilations, user interfaces, website design, and software—is the exclusive property of <strong>CSC Dost</strong> or its content suppliers.
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    This material is protected by Indian copyright laws, international copyright treaties, and other applicable intellectual property statutes.
                  </p>
                </div>
              </section>

              {/* 2. PERMITTED USE & 3. PROHIBITED USE GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800/80">
                
                {/* 2. PERMITTED USE */}
                <section id="cr-2" className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300">
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 p-0.5 bg-emerald-100 dark:bg-emerald-900 rounded-full" />
                    <h3 className="text-sm font-extrabold uppercase tracking-wide">
                      2. Permitted Use
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    We grant you a limited, non-exclusive, non-transferable, and revocable license to access and use our website strictly in accordance with this policy. You may:
                  </p>
                  <ul className="space-y-2 text-xs">
                    <li className="flex items-start gap-2 bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>View and browse the website content on a computer or mobile device.</span>
                    </li>
                    <li className="flex items-start gap-2 bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>Print or download temporary copies of application receipts, forms, or instructional materials strictly for your <strong>personal, non-commercial use</strong>.</span>
                    </li>
                  </ul>
                </section>

                {/* 3. PROHIBITED USE */}
                <section id="cr-3" className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 space-y-3">
                  <div className="flex items-center gap-2 text-rose-900 dark:text-rose-300">
                    <Ban className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    <h3 className="text-sm font-extrabold uppercase tracking-wide">
                      3. Prohibited Use
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Without our explicit written permission, you are strictly prohibited from:
                  </p>
                  <ul className="space-y-2 text-xs">
                    <li className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-rose-100 dark:border-rose-900/40">
                      <strong className="text-rose-700 dark:text-rose-400 block">Copying or Reproducing:</strong>
                      Replicating any part of the website's text, layout, or graphics for use on another website or in print.
                    </li>
                    <li className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-rose-100 dark:border-rose-900/40">
                      <strong className="text-rose-700 dark:text-rose-400 block">Distribution:</strong>
                      Selling, renting, licensing, or distributing our content or materials to third parties for commercial gain.
                    </li>
                    <li className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-rose-100 dark:border-rose-900/40">
                      <strong className="text-rose-700 dark:text-rose-400 block">Modification &amp; Extraction:</strong>
                      Modifying, translating, or creating derivative works, or using automated scrapers/bots to harvest data.
                    </li>
                  </ul>
                </section>
              </div>

              {/* 4. TRADEMARKS */}
              <section id="cr-4" className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-600 text-white rounded-xl shadow-xs">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      4. Trademarks
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Brand identifiers, logos, and service slogans.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/60 text-xs text-slate-700 dark:text-slate-300 leading-relaxed space-y-2">
                  <p>
                    The business name <strong>"CSC Dost,"</strong> our logo, and any related product or service names, designs, and slogans are trademarks of CSC Dost.
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    You may not use these trademarks in any manner that is likely to cause confusion among users, in any advertising or promotional material, or in any way that disparages or discredits CSC Dost, without our prior written consent.
                  </p>
                </div>
              </section>

              {/* 5. COPYRIGHT INFRINGEMENT CLAIMS */}
              <section id="cr-5" className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      5. Copyright Infringement Claims
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Procedure for reporting alleged copyright violations.
                    </p>
                  </div>
                </div>

                <div className="p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    We respect the intellectual property rights of others and expect our users to do the same. If you believe that any content on our website infringes upon your copyright, please contact us immediately with the following information:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-2">
                      <span className="w-5 h-5 rounded-md bg-blue-500 text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">1</span>
                      <span>A description of the copyrighted work that you claim has been infringed.</span>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-2">
                      <span className="w-5 h-5 rounded-md bg-blue-500 text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">2</span>
                      <span>The exact URL or location on our website where the alleged infringing material is found.</span>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-2">
                      <span className="w-5 h-5 rounded-md bg-blue-500 text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">3</span>
                      <span>Your complete contact information, including name, address, telephone number, and email address.</span>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-2">
                      <span className="w-5 h-5 rounded-md bg-blue-500 text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">4</span>
                      <span>A statement under penalty of perjury that the information in your notice is accurate and you are the copyright owner or authorized agent.</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-1">
                    Upon receiving a valid claim, we will investigate the matter and, if necessary, promptly remove or disable access to the infringing content.
                  </p>
                </div>
              </section>

              {/* 6. ENFORCEMENT & 7. CHANGES TO THIS POLICY */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800/80">
                
                {/* 6. ENFORCEMENT */}
                <section id="cr-6" className="p-4 rounded-2xl bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-900/60 space-y-2">
                  <div className="flex items-center gap-2 text-red-900 dark:text-red-300 font-extrabold text-sm">
                    <Gavel className="w-4 h-4 text-red-600" />
                    <span>6. Enforcement of Copyright</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    We take the protection of our copyright very seriously. If we discover that you have used our copyright materials in contravention of this policy, we may bring legal proceedings against you seeking monetary damages and an injunction to stop you from using those materials. You could also be ordered to pay legal costs.
                  </p>
                </section>

                {/* 7. CHANGES TO THIS POLICY */}
                <section id="cr-7" className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-sm">
                    <RefreshCw className="w-4 h-4 text-amber-500" />
                    <span>7. Changes to This Policy</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    We reserve the right to modify this Copyright Policy at any time. Changes will take effect immediately upon their posting on the website. Your continued use of the website following the posting of changes constitutes your acceptance of such changes.
                  </p>
                </section>

              </div>

              {/* 8. CONTACT INFORMATION */}
              <section id="cr-8" className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-amber-950 to-slate-900 text-white shadow-xl space-y-4">
                <div className="flex items-center justify-between gap-2 border-b border-amber-900/60 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-amber-500 text-white rounded-xl">
                      <Copyright className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-white">
                        8. Contact Information
                      </h3>
                      <p className="text-[11px] text-amber-200/80">
                        For permission requests or copyright infringement reports:
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-full font-bold">
                    Copyright Licensing
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-blue-400" /> Website
                    </span>
                    <a href="https://www.cscdost.online/" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-300 hover:underline block truncate">
                      https://www.cscdost.online/
                    </a>
                  </div>

                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-emerald-400" /> Email / Support
                    </span>
                    <a href="mailto:cscdost.support@gmail.com" className="font-bold text-emerald-300 hover:underline block truncate">
                      cscdost.support@gmail.com
                    </a>
                  </div>

                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-amber-400" /> Phone Support
                    </span>
                    <a href="tel:7006833767" className="font-bold text-amber-300 hover:underline block">
                      +91 7006833767
                    </a>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* ============================================================ */}
          {/* TAB 5: DISCLAIMER CONTENT */}
          {/* ============================================================ */}
          {activeTab === 'disclaimer' && (
            <>
              {/* HERO WELCOME NOTICE */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-50 via-slate-50 to-orange-50 dark:from-rose-950/40 dark:via-slate-900 dark:to-orange-950/40 border border-rose-200 dark:border-rose-900/60 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-rose-900 dark:text-rose-300 font-extrabold text-sm uppercase tracking-wide">
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <span>Important Notice &amp; Disclaimer</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 text-[10px] uppercase font-extrabold block">Official Website</span>
                    <a href="https://www.cscdost.online/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 mt-0.5">
                      <span>https://www.cscdost.online/</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 text-[10px] uppercase font-extrabold block">Business Name</span>
                    <span className="font-bold text-slate-900 dark:text-white">CSC Dost ("we," "our," or "us")</span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 pt-1 leading-relaxed">
                  The information and services provided by <strong>CSC Dost</strong> on <a href="https://www.cscdost.online/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline font-semibold">https://www.cscdost.online/</a> (the "Site") are for general informational and facilitation purposes only. By using our website and services, you accept and agree to this disclaimer in full.
                </p>
              </div>

              {/* 1. NON-GOVERNMENT ENTITY */}
              <section id="dc-1" className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-600 text-white rounded-xl shadow-xs">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      1. Non-Government Entity
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Independent service facilitator status.
                    </p>
                  </div>
                </div>

                <div className="p-4.5 rounded-2xl bg-orange-50/60 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/60 space-y-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2 text-orange-900 dark:text-orange-300 font-extrabold text-xs uppercase tracking-wide bg-orange-100 dark:bg-orange-900/50 px-2.5 py-1 rounded-lg w-fit">
                    <ShieldAlert className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                    <span>Independent Service Facilitator</span>
                  </div>
                  <p>
                    <strong>CSC Dost is an independent digital service facilitator.</strong> While we assist citizens in accessing, filling out, and submitting online forms for various government and non-government services, we are <strong>not</strong> a government department, nor do we claim to be the official portal for any state or central government entity.
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Any official logos, department names, or government schemes mentioned on our website are used purely for identification and informational purposes to help users find the right services.
                  </p>
                </div>
              </section>

              {/* 2. NO GUARANTEE OF APPLICATION APPROVAL */}
              <section id="dc-2" className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-600 text-white rounded-xl shadow-xs">
                    <AlertOctagon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      2. No Guarantee of Application Approval
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Facilitation scope and authority limitations.
                    </p>
                  </div>
                </div>

                <div className="p-4.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 space-y-3 text-xs">
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    We act strictly as a data-entry and application submission assistant based on the details and documents provided by you.
                  </p>
                  <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                    <li className="flex items-start gap-2 bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-rose-100 dark:border-rose-900/40">
                      <span className="text-rose-600 font-black shrink-0">•</span>
                      <span>We do not have the authority to approve, reject, or expedite any application, certificate, or service request.</span>
                    </li>
                    <li className="flex items-start gap-2 bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-rose-100 dark:border-rose-900/40">
                      <span className="text-rose-600 font-black shrink-0">•</span>
                      <span>The final decision regarding the approval or issuance of any document or service rests entirely with the respective government department or official authority.</span>
                    </li>
                    <li className="flex items-start gap-2 bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-rose-100 dark:border-rose-900/40">
                      <span className="text-rose-600 font-black shrink-0">•</span>
                      <span><strong>CSC Dost</strong> is not responsible for any rejections, delays, or holds placed on your application due to incorrect information, ineligibility, or discrepancies in the documents you provided.</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* 3. ACCURACY OF INFORMATION & 4. THIRD-PARTY PORTALS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800/80">
                
                {/* 3. ACCURACY OF INFORMATION */}
                <section id="dc-3" className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/60 space-y-2.5">
                  <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300 font-extrabold text-sm">
                    <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>3. Accuracy of Information</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    While we strive to keep the information on our website updated and correct, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the information, services, or related graphics contained on the Site.
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/40">
                    Any reliance you place on such information is therefore strictly at your own risk. It is the user's responsibility to verify scheme guidelines, eligibility criteria, and deadlines from official government sources before applying.
                  </p>
                </section>

                {/* 4. THIRD-PARTY PORTALS AND TECHNICAL ISSUES */}
                <section id="dc-4" className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/60 space-y-2.5">
                  <div className="flex items-center gap-2 text-purple-900 dark:text-purple-300 font-extrabold text-sm">
                    <Laptop className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>4. Third-Party Portals &amp; Technical Issues</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    The processing of many services relies on third-party portals, government servers, and external payment gateways.
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <li className="p-2 bg-white/80 dark:bg-slate-900/80 rounded-lg border border-purple-100 dark:border-purple-900/40">
                      <strong>CSC Dost</strong> cannot be held liable for delays, failed transactions, or application failures resulting from server downtimes, technical glitches, or maintenance activities on these external portals.
                    </li>
                    <li className="p-2 bg-white/80 dark:bg-slate-900/80 rounded-lg border border-purple-100 dark:border-purple-900/40">
                      Links to external websites do not constitute an endorsement. We have no control over the nature, content, and availability of those sites.
                    </li>
                  </ul>
                </section>
              </div>

              {/* 5. LIMITATION OF LIABILITY & 6. PAYMENTS AND FEES GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800/80">
                
                {/* 5. LIMITATION OF LIABILITY */}
                <section id="dc-5" className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-sm">
                    <Gavel className="w-4 h-4 text-rose-500" />
                    <span>5. Limitation of Liability</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    In no event will <strong>CSC Dost</strong>, its proprietors, employees, or agents be liable for any loss or damage including, without limitation, indirect or consequential loss or damage, or any loss or damage whatsoever arising from loss of data, loss of time, or financial loss arising out of, or in connection with, the use of this website or our digital services.
                  </p>
                </section>

                {/* 6. PAYMENTS AND FEES */}
                <section id="dc-6" className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-extrabold text-sm">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    <span>6. Payments &amp; Fee Policy</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    The fees collected by <strong>CSC Dost</strong> include government department fees (where applicable) alongside our nominal service/consulting charges for the time and effort spent assisting you.
                  </p>
                  <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-white/80 dark:bg-slate-900/80 p-2 rounded-lg border border-emerald-200 dark:border-emerald-900/40">
                    Once an application is successfully submitted on your behalf, our service charges are strictly non-refundable, regardless of the final outcome of the application by concerned authorities.
                  </p>
                </section>

              </div>

              {/* 7. CONTACT US */}
              <section id="dc-7" className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900 text-white shadow-xl space-y-4">
                <div className="flex items-center justify-between gap-2 border-b border-rose-900/60 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-rose-600 text-white rounded-xl">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-white">
                        7. Contact Us
                      </h3>
                      <p className="text-[11px] text-rose-200/80">
                        If you require more information or have questions regarding our disclaimer:
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2.5 py-1 rounded-full font-bold">
                    Disclaimer Inquiries
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-blue-400" /> Website
                    </span>
                    <a href="https://www.cscdost.online/" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-300 hover:underline block truncate">
                      https://www.cscdost.online/
                    </a>
                  </div>

                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-emerald-400" /> Email / Support
                    </span>
                    <a href="mailto:cscdost.support@gmail.com" className="font-bold text-emerald-300 hover:underline block truncate">
                      cscdost.support@gmail.com
                    </a>
                  </div>

                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-rose-400" /> Phone Support
                    </span>
                    <a href="tel:7006833767" className="font-bold text-rose-300 hover:underline block">
                      +91 7006833767
                    </a>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* ============================================================ */}
          {/* TAB 6: HELP & SUPPORT CONTENT */}
          {/* ============================================================ */}
          {activeTab === 'help' && (
            <>
              {/* HERO WELCOME BANNER */}
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-teal-50 via-cyan-50 to-emerald-50 dark:from-teal-950/40 dark:via-slate-900 dark:to-emerald-950/40 border border-teal-200 dark:border-teal-900/60 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-teal-900 dark:text-teal-300 font-extrabold text-sm uppercase tracking-wide">
                  <LifeBuoy className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  <span>Welcome to the CSC Dost Help Center!</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  We are here to make your online form filling, government service applications, and digital document processing as smooth and hassle-free as possible. Below you will find a guide on how to use our services, along with answers to commonly asked questions.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="px-3 py-1 bg-white/90 dark:bg-slate-900/90 text-teal-700 dark:text-teal-300 rounded-full border border-teal-200 dark:border-teal-800 font-bold flex items-center gap-1.5 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" /> Fast Application Assistance
                  </span>
                  <span className="px-3 py-1 bg-white/90 dark:bg-slate-900/90 text-teal-700 dark:text-teal-300 rounded-full border border-teal-200 dark:border-teal-800 font-bold flex items-center gap-1.5 shadow-2xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-500" /> Verified Portal Guidelines
                  </span>
                  <span className="px-3 py-1 bg-white/90 dark:bg-slate-900/90 text-teal-700 dark:text-teal-300 rounded-full border border-teal-200 dark:border-teal-800 font-bold flex items-center gap-1.5 shadow-2xs">
                    <Clock className="w-3.5 h-3.5 text-teal-500" /> Dedicated Support 6 Days/Week
                  </span>
                </div>
              </div>

              {/* 1. HOW OUR SERVICE WORKS */}
              <section id="hp-1" className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-teal-600 text-white rounded-2xl shadow-xs">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      1. How Our Service Works
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Step-by-step guide to getting your digital applications done easily.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  {/* Step 1 */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-teal-500/50 transition-all space-y-2 relative overflow-hidden group">
                    <div className="flex items-center justify-between">
                      <span className="w-7 h-7 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 font-black flex items-center justify-center text-xs border border-teal-200 dark:border-teal-800">
                        01
                      </span>
                      <FileText className="w-4 h-4 text-slate-400 group-hover:text-teal-500 transition-colors" />
                    </div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-xs">
                      Choose Your Service
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                      Browse our website and select the specific service, form, or application you need assistance with (e.g., PAN card, Aadhaar printing, scholarships, government schemes).
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-teal-500/50 transition-all space-y-2 relative overflow-hidden group">
                    <div className="flex items-center justify-between">
                      <span className="w-7 h-7 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 font-black flex items-center justify-center text-xs border border-teal-200 dark:border-teal-800">
                        02
                      </span>
                      <CheckCircle2 className="w-4 h-4 text-slate-400 group-hover:text-teal-500 transition-colors" />
                    </div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-xs">
                      Review Requirements
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                      Check the list of mandatory documents and details required for your selected service before initiating your application.
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-teal-500/50 transition-all space-y-2 relative overflow-hidden group">
                    <div className="flex items-center justify-between">
                      <span className="w-7 h-7 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 font-black flex items-center justify-center text-xs border border-teal-200 dark:border-teal-800">
                        03
                      </span>
                      <UploadCloud className="w-4 h-4 text-slate-400 group-hover:text-teal-500 transition-colors" />
                    </div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-xs">
                      Submit Your Details
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                      Provide your accurate personal details and upload clear, readable copies of your supporting documents through our secure portal or designated channels.
                    </p>
                  </div>

                  {/* Step 4 */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-teal-500/50 transition-all space-y-2 relative overflow-hidden group">
                    <div className="flex items-center justify-between">
                      <span className="w-7 h-7 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 font-black flex items-center justify-center text-xs border border-teal-200 dark:border-teal-800">
                        04
                      </span>
                      <CreditCard className="w-4 h-4 text-slate-400 group-hover:text-teal-500 transition-colors" />
                    </div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-xs">
                      Make Payment
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                      Pay the required government fees plus our nominal service charge using our secure online payment methods.
                    </p>
                  </div>

                  {/* Step 5 */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-teal-500/50 transition-all space-y-2 relative overflow-hidden group sm:col-span-2 lg:col-span-2">
                    <div className="flex items-center justify-between">
                      <span className="w-7 h-7 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 font-black flex items-center justify-center text-xs border border-teal-200 dark:border-teal-800">
                        05
                      </span>
                      <Award className="w-4 h-4 text-slate-400 group-hover:text-teal-500 transition-colors" />
                    </div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-xs">
                      Processing &amp; Official Receipt
                    </h4>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                      Our expert team will process your application on the respective official portals. Once successfully submitted, we will share the final application receipt and tracking details directly with you.
                    </p>
                  </div>
                </div>
              </section>

              {/* 2. FREQUENTLY ASKED QUESTIONS (FAQs) */}
              <section id="hp-2" className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-xs">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      2. Frequently Asked Questions (FAQs)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Clear answers regarding services, documents, and payments.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Category A: General Inquiries */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300 font-extrabold text-xs uppercase tracking-wide bg-blue-50 dark:bg-blue-950/50 px-3 py-1.5 rounded-xl border border-blue-200/80 dark:border-blue-900/60 w-fit">
                      <MessageCircle className="w-3.5 h-3.5 text-blue-600" />
                      <span>General Inquiries</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                        <h5 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                          <span className="text-blue-600 font-black">Q.</span> What is CSC Dost?
                        </h5>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px] pt-1">
                          CSC Dost is an independent digital service facilitator. We act as an assistant to help citizens correctly fill out and submit online applications for various government and non-government services.
                        </p>
                      </div>

                      <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                        <h5 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                          <span className="text-blue-600 font-black">Q.</span> Are you an official government portal?
                        </h5>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px] pt-1">
                          <strong>No.</strong> We are an independent service provider and not an official government entity. We process applications on official government portals on your behalf based on the data you provide.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Category B: Applications & Documents */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-purple-900 dark:text-purple-300 font-extrabold text-xs uppercase tracking-wide bg-purple-50 dark:bg-purple-950/50 px-3 py-1.5 rounded-xl border border-purple-200/80 dark:border-purple-900/60 w-fit">
                      <FileText className="w-3.5 h-3.5 text-purple-600" />
                      <span>Applications &amp; Documents</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                        <h5 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                          <span className="text-purple-600 font-black">Q.</span> Required documents?
                        </h5>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px] pt-1">
                          The required documents vary by service. When you select a specific service on our website, a list of mandatory documents (such as Aadhaar, photos, income certificates) will be displayed.
                        </p>
                      </div>

                      <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                        <h5 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                          <span className="text-purple-600 font-black">Q.</span> Mistakes in provided details?
                        </h5>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px] pt-1">
                          Please contact us immediately. If the application has not yet been finally submitted, we can correct it. After final submission, corrections require formal requests which may incur extra time or fees.
                        </p>
                      </div>

                      <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                        <h5 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                          <span className="text-purple-600 font-black">Q.</span> Tracking application status?
                        </h5>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px] pt-1">
                          Upon submission, we provide an application/acknowledgement number. Use this number on the official portal, or contact our support team for live updates.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Category C: Payments & Refunds */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-extrabold text-xs uppercase tracking-wide bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-900/60 w-fit">
                      <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Payments &amp; Refunds</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                        <h5 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                          <span className="text-emerald-600 font-black">Q.</span> What are your service charges?
                        </h5>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px] pt-1">
                          Our charges include the actual fee levied by the respective department (if any) plus a nominal service fee for our time, data entry, and assistance. The exact breakdown is provided before payment.
                        </p>
                      </div>

                      <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                        <h5 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                          <span className="text-emerald-600 font-black">Q.</span> Refund on application rejection?
                        </h5>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px] pt-1">
                          Our service fee covers time and effort spent filling and submitting your application and is strictly non-refundable once the receipt is generated. We are not responsible for rejections made by official departments due to eligibility issues or document discrepancies.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* 3. DOCUMENT UPLOAD GUIDELINES */}
              <section id="hp-3" className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-600 text-white rounded-2xl shadow-xs">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      3. Document Upload Guidelines
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Follow these guidelines to prevent application delays or rejections.
                    </p>
                  </div>
                </div>

                <div className="p-4.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 space-y-3">
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    To ensure your application is processed without delays or rejections, please follow these guidelines when sending us your documents:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-amber-200/80 dark:border-amber-900/40 space-y-0.5">
                      <span className="text-amber-800 dark:text-amber-300 font-extrabold text-xs block flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" /> Clarity
                      </span>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                        Ensure all scanned copies or photos of documents are clear, well-lit, and fully readable.
                      </p>
                    </div>

                    <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-amber-200/80 dark:border-amber-900/40 space-y-0.5">
                      <span className="text-amber-800 dark:text-amber-300 font-extrabold text-xs block flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" /> No Cropping
                      </span>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                        Do not cut off the edges of certificates or ID cards. The entire document must be visible.
                      </p>
                    </div>

                    <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-amber-200/80 dark:border-amber-900/40 space-y-0.5">
                      <span className="text-amber-800 dark:text-amber-300 font-extrabold text-xs block flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" /> File Format
                      </span>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                        We generally accept standard PDF, JPG, and PNG formats.
                      </p>
                    </div>

                    <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-amber-200/80 dark:border-amber-900/40 space-y-0.5">
                      <span className="text-amber-800 dark:text-amber-300 font-extrabold text-xs block flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" /> Authenticity
                      </span>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                        Never submit forged, expired, or altered documents.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* 4. STILL NEED HELP? CONTACT US */}
              <section id="hp-4" className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-teal-950 via-slate-900 to-cyan-950 text-white shadow-xl space-y-4 border border-teal-800/60">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-teal-800/80 pb-3.5">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-teal-500 text-slate-950 rounded-2xl font-bold">
                      <LifeBuoy className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-white">
                        4. Still Need Help? Contact Us!
                      </h3>
                      <p className="text-xs text-teal-200/80">
                        If you couldn't find your answer, our support team is ready to assist you directly.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs bg-teal-500/20 text-teal-300 border border-teal-500/30 px-3 py-1 rounded-full font-bold shrink-0">
                    Active Support Desk
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-1.5">
                    <span className="text-teal-400 text-[10px] uppercase font-extrabold flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5" /> Official Website
                    </span>
                    <a href="https://www.cscdost.online/" target="_blank" rel="noopener noreferrer" className="font-bold text-white hover:text-teal-300 hover:underline block truncate">
                      cscdost.online
                    </a>
                  </div>

                  <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-1.5">
                    <span className="text-teal-400 text-[10px] uppercase font-extrabold flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" /> Email Support
                    </span>
                    <a href="mailto:cscdost.support@gmail.com" className="font-bold text-white hover:text-teal-300 hover:underline block truncate">
                      cscdost.support@gmail.com
                    </a>
                  </div>

                  <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-1.5">
                    <span className="text-teal-400 text-[10px] uppercase font-extrabold flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" /> Phone / WhatsApp
                    </span>
                    <a href="tel:7006833767" className="font-bold text-white hover:text-teal-300 hover:underline block">
                      +91 7006833767
                    </a>
                  </div>

                  <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-1.5">
                    <span className="text-teal-400 text-[10px] uppercase font-extrabold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Working Hours
                    </span>
                    <span className="font-bold text-slate-200 block text-[11px]">
                      Mon – Sat: 09:00 AM – 08:30 PM
                    </span>
                  </div>
                </div>
              </section>
            </>
          )}

        </div>

        {/* FOOTER BAR */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>CSC DOST Verified Legal Document</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 font-extrabold rounded-xl transition-all cursor-pointer shadow-sm"
          >
            Close Policy
          </button>
        </div>

      </div>
    </div>
  );
}
