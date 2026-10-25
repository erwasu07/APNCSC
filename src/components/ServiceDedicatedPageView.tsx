import React, { useState, useEffect, useMemo } from 'react';
import { ServiceItem, CATEGORY_LABELS, SERVICES_LIST } from '../servicesData';
import {
  ContentPageLayout,
  ContentArticleHeader,
  KeyInfoStrip,
  PrimaryActionBar,
  MobileSectionNav,
  ContentSection,
  KeyValueRows,
  ContentChecklist,
  StepByStepList,
  OfficialSourcesAndAssistance,
  extractConciseIntro,
  KeyInfoFact,
  SectionNavItem,
  RelatedContentItem,
} from './shared/ContentDesignSystem';

interface ServiceDedicatedPageViewProps {
  service: ServiceItem;
  onBack: () => void;
  onApplyService: (serviceName: string) => void;
  onShare: (service: ServiceItem) => void;
}

export default function ServiceDedicatedPageView({
  service,
  onBack,
  onApplyService,
  onShare,
}: ServiceDedicatedPageViewProps) {
  const [activeSectionId, setActiveSectionId] = useState<string>('service-overview');

  useEffect(() => {
    const orig = document.title;
    document.title = `${service.name} – Process, Documents & Fees | CSC DOST`;
    return () => {
      document.title = orig;
    };
  }, [service]);

  const officialPortal = useMemo(() => {
    const sId = service.id.toLowerCase();
    const sName = service.name.toLowerCase();

    if (sId.includes('pan') || sName.includes('pan')) {
      return {
        name: 'NSDL Protean / Income Tax Portal',
        url: 'https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html',
      };
    }
    if (sId.includes('aadhaar') || sName.includes('aadhaar')) {
      return {
        name: 'Unique Identification Authority of India (UIDAI)',
        url: 'https://myaadhaar.uidai.gov.in',
      };
    }
    if (sId.includes('ayushman') || sName.includes('ayushman') || sName.includes('golden')) {
      return {
        name: 'National Health Authority (NHA Beneficiary Portal)',
        url: 'https://beneficiary.nha.gov.in',
      };
    }
    if (sId.includes('voter') || sName.includes('voter')) {
      return {
        name: 'Election Commission of India (ECI Voters Portal)',
        url: 'https://voters.eci.gov.in',
      };
    }
    if (sId.includes('pmkisan') || sName.includes('kisan')) {
      return {
        name: 'PM-KISAN Official Portal (Ministry of Agriculture)',
        url: 'https://pmkisan.gov.in',
      };
    }
    if (sId.includes('passport') || sName.includes('passport')) {
      return {
        name: 'Passport Seva Online (Ministry of External Affairs)',
        url: 'https://www.passportindia.gov.in',
      };
    }
    if (
      sId.includes('parivahan') ||
      sId.includes('dl') ||
      sId.includes('driving') ||
      sName.includes('license') ||
      sName.includes('rc')
    ) {
      return {
        name: 'Parivahan Sewa (Ministry of Road Transport & Highways)',
        url: 'https://parivahan.gov.in',
      };
    }
    if (sId.includes('shram') || sName.includes('shram')) {
      return {
        name: 'Ministry of Labour & Employment (e-Shram Portal)',
        url: 'https://eshram.gov.in',
      };
    }
    if (
      sId.includes('domicile') ||
      sId.includes('unnat') ||
      sName.includes('domicile') ||
      sName.includes('revenue') ||
      service.category === 'jk_state' ||
      service.category === 'revenue'
    ) {
      return {
        name: 'e-UNNAT & Jan Sugam J&K Citizen Services Portal',
        url: 'https://eunnat.jk.gov.in',
      };
    }
    return {
      name: 'National Government Services Portal (India.gov.in)',
      url: 'https://services.india.gov.in',
    };
  }, [service]);

  const categoryTitle = CATEGORY_LABELS[service.category] || 'CSC E-Services';
  const requiredDocsList = useMemo(() => {
    if (service.requirements && service.requirements.length > 0) {
      return service.requirements;
    }
    return [
      'Aadhaar Card / Valid Government Photo Identity',
      'Active Mobile Number for OTP Verification',
      'Recent Passport-Size Colour Photograph',
      'Supporting Address or Date of Birth Proof (if applicable)',
    ];
  }, [service.requirements]);

  const { intro, remainder } = useMemo(() => {
    return extractConciseIntro(service.description, 220);
  }, [service.description]);

  // Useful summary fields for CSC E-Services
  const keyFacts: KeyInfoFact[] = useMemo(() => {
    return [
      {
        label: 'Service Category',
        value: categoryTitle,
        tone: 'default',
      },
      {
        label: 'Service Channel',
        value: 'Online / CSC Desk',
        tone: 'blue',
      },
      {
        label: 'Required Documents',
        value: `${requiredDocsList.length} Key Items`,
        tone: 'default',
      },
      {
        label: 'Fee Information',
        value: service.price,
        tone: 'emerald',
      },
      {
        label: 'Processing Estimate',
        value: service.estimatedTime,
        tone: 'default',
      },
    ];
  }, [categoryTitle, requiredDocsList.length, service.price, service.estimatedTime]);

  const sections: SectionNavItem[] = useMemo(
    () => [
      { id: 'service-overview', title: 'Service Overview' },
      { id: 'who-can-request', title: 'Who Can Request This Service' },
      { id: 'documents-required', title: 'Documents Required' },
      { id: 'assistance-process', title: 'Application / Assistance Process' },
      { id: 'fees-charges', title: 'Fees & Charges' },
      { id: 'important-conditions', title: 'Important Conditions' },
      { id: 'tracking-help', title: 'Tracking & Help Information' },
      { id: 'official-sources', title: 'Official Sources' },
    ],
    []
  );

  const scrollToSection = (id: string) => {
    setActiveSectionId(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const relatedServices: RelatedContentItem[] = useMemo(() => {
    return SERVICES_LIST.filter((s) => s.id !== service.id && s.category === service.category)
      .slice(0, 4)
      .map((rel) => ({
        id: rel.id,
        title: rel.name,
        categoryLabel: CATEGORY_LABELS[rel.category] || 'Citizen Service',
        metaText: `Fee: ${rel.price} · Estimate: ${rel.estimatedTime}`,
        onClick: () => {
          window.location.hash = `#service/${rel.id}`;
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
      }));
  }, [service]);

  const handleRequestAssistance = () => {
    onApplyService(service.name);
  };

  return (
    <ContentPageLayout
      breadcrumbs={[
        { label: 'Home', onClick: onBack },
        { label: 'CSC E-Services', onClick: onBack },
        { label: service.name },
      ]}
      onBack={onBack}
      backLabel="Back to All Services"
      onPrint={() => window.print()}
      onShare={() => onShare(service)}
      sections={sections}
      activeSectionId={activeSectionId}
      onSelectSection={scrollToSection}
      relatedTitle="Related Citizen Services"
      relatedItems={relatedServices}
      sidebarCta={{
        badge: 'CSC Digital Seva Desk',
        title: 'Request Assisted Service Filing',
        description:
          'Submit your details and required document scans online. Our VLE operator will verify your paperwork and assist with official submission.',
        buttonLabel: 'Request Assistance',
        onAction: handleRequestAssistance,
      }}
      mobileStickyAction={{
        primaryLabel: 'Request Assistance',
        onPrimaryClick: handleRequestAssistance,
        secondaryLabel: 'Official Portal',
        secondaryHref: officialPortal.url,
      }}
      schemaJson={{
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: service.name,
        description: service.description,
        provider: {
          '@type': 'Organization',
          name: 'CSC DOST',
          url: 'https://www.cscdost.com',
        },
        serviceType: categoryTitle,
        offers: {
          '@type': 'Offer',
          price: service.price,
          priceCurrency: 'INR',
        },
      }}
    >
      {/* A–E: Category Label, Single H1, Concise Intro, Metadata */}
      <ContentArticleHeader
        categoryLabel={categoryTitle}
        secondaryBadge="Online & CSC Desk"
        title={service.name}
        intro={intro}
        metadata={[
          { label: 'Service Channel', value: 'Online / CSC Desk' },
          ...(service.estimatedTime
            ? [{ label: 'Indicative Estimate', value: service.estimatedTime }]
            : []),
          ...(service.price
            ? [{ label: 'Indicative Fee', value: service.price, emphasize: true }]
            : []),
          { label: 'Authority Portal', value: officialPortal.name },
        ]}
      />

      {/* F: Key Information Strip */}
      <KeyInfoStrip facts={keyFacts} />

      {/* G: Clear Primary Actions */}
      <PrimaryActionBar
        primaryAction={{
          label: 'Request Assistance',
          onClick: handleRequestAssistance,
        }}
        officialLinks={[
          {
            label: 'Official Government Portal',
            href: officialPortal.url,
          },
        ]}
        onTrackApplication={() => {
          window.location.hash = '#track';
        }}
        assistanceDisclaimer="CSC DOST provides document preparation and assisted online filing. You may also apply independently on the official government portal linked above."
      />

      {/* H: Compact Navigation to Page Sections (Sticky on Mobile) */}
      <MobileSectionNav
        sections={sections}
        activeSectionId={activeSectionId}
        onSelectSection={scrollToSection}
      />

      {/* I: Main Content Sections */}

      {/* 1. SERVICE OVERVIEW */}
      <ContentSection
        id="service-overview"
        title="Service Overview"
        subtitle="What this citizen service covers and how it is processed."
      >
        <p className="text-xs sm:text-sm text-[#102A43] leading-relaxed">{service.description}</p>
        {remainder && (
          <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">{remainder}</p>
        )}
        <KeyValueRows
          rows={[
            {
              label: 'Service Name',
              value: service.name,
              boldValue: true,
            },
            {
              label: 'Service Category',
              value: categoryTitle,
            },
            {
              label: 'Delivery Channel',
              value: 'Online Assistance Desk & Physical CSC Centre (Qazigund, J&K)',
            },
            {
              label: 'Indicative Turnaround Time',
              value: service.estimatedTime,
              tone: 'emerald',
              boldValue: true,
            },
          ]}
        />
      </ContentSection>

      {/* 2. WHO CAN REQUEST THIS SERVICE */}
      <ContentSection
        id="who-can-request"
        title="Who Can Request This Service"
        subtitle="Eligibility and general requirements for applicants."
      >
        <ContentChecklist
          columns={1}
          items={
            service.category === 'jk_state' || service.category === 'revenue'
              ? [
                  'Bonafide residents and domiciles of the Union Territory of Jammu & Kashmir applying for revenue, domicile, or social welfare certificates.',
                  'Applicants holding valid identity and parentage proof along with supporting revenue/local verification records.',
                  'Citizens seeking new certificate issuance, digital re-verification, or corrections in existing records.',
                ]
              : [
                  'Any eligible Indian citizen holding valid identity and address proof documents.',
                  'Applicants seeking a fresh registration, card re-issuance, demographic correction, or e-KYC update.',
                  'Guardians or parents applying on behalf of minor applicants with valid birth/relationship proof.',
                ]
          }
        />
      </ContentSection>

      {/* 3. DOCUMENTS REQUIRED */}
      <ContentSection
        id="documents-required"
        title="Documents Required"
        subtitle="Keep clear original scans or photographs of the following documents ready."
      >
        <ContentChecklist items={requiredDocsList} />
      </ContentSection>

      {/* 4. APPLICATION OR ASSISTANCE PROCESS */}
      <ContentSection
        id="assistance-process"
        title="Application & Assistance Process"
        subtitle="Step-by-step workflow when requesting assistance through CSC DOST or applying online."
      >
        <StepByStepList
          steps={[
            {
              title: 'Select Service & Submit Applicant Details',
              description: `Click "Request Assistance" for ${service.name} and enter your name, mobile number, and required particulars.`,
            },
            {
              title: 'Upload Supporting Documents',
              description:
                'Attach clear scans or photos of the required proofs. Our operator checks document clarity and required pixel/PDF sizes.',
            },
            {
              title: 'Operator Verification & Portal Submission',
              description: `A certified CSC VLE prepares your form on ${officialPortal.name} and coordinates OTP verification if required.`,
            },
            {
              title: 'Receive Reference Token & Official Acknowledgment',
              description:
                'Save your CSC DOST tracking token and receive the official department acknowledgment receipt once filed.',
            },
          ]}
        />
      </ContentSection>

      {/* 5. FEES AND CHARGES */}
      <ContentSection
        id="fees-charges"
        title="Fees & Charges"
        subtitle="Clear breakdown distinguishing statutory government charges from CSC assistance fees."
      >
        <KeyValueRows
          rows={[
            {
              label: 'Indicative Total Service Charge',
              value: service.price || 'As per applicable tariff',
              tone: 'blue',
              boldValue: true,
            },
            {
              label: 'Official Government / Portal Fee',
              value:
                'Included as per statutory department tariff (payable directly to the issuing authority gateway where applicable).',
            },
            {
              label: 'CSC Assistance & Document Formatting',
              value:
                'Covers document scanning, photo/PDF resizing, form preparation, and operator verification.',
            },
            {
              label: 'Direct Self-Application Option',
              value: `Citizens applying directly on ${officialPortal.name} only pay the statutory government portal fee.`,
            },
          ]}
        />
      </ContentSection>

      {/* 6. IMPORTANT CONDITIONS */}
      <ContentSection
        id="important-conditions"
        title="Important Conditions"
        subtitle="Key guidelines to prevent application rejection or processing delays."
      >
        <ContentChecklist
          columns={1}
          items={[
            'Ensure your full name, date of birth, and parentage match across your Aadhaar Card and supporting certificates.',
            'Keep your Aadhaar-linked mobile number active to receive verification OTPs during online submission.',
            'Processing timelines are indicative estimates; final approval and certificate issuance depend on the concerned government authority.',
          ]}
        />
      </ContentSection>

      {/* 7. TRACKING AND HELP INFORMATION */}
      <ContentSection
        id="tracking-help"
        title="Tracking & Help Information"
        subtitle="How to monitor your application status after submitting a request."
      >
        <p className="text-xs sm:text-sm text-[#102A43] leading-relaxed">
          Every assistance request submitted on CSC DOST generates a unique tracking reference token
          (for example, <span className="font-mono font-semibold">CSC-2026-XXXX</span>). You can
          check real-time operator verification progress, remarks, and final acknowledgment updates
          at any time using the online tracker.
        </p>
        <div className="pt-1">
          <button
            type="button"
            onClick={() => {
              window.location.hash = '#track';
            }}
            className="min-h-[40px] px-4 py-2 bg-[#F6F8FC] hover:bg-blue-50 text-[#102A43] hover:text-[#2563EB] border border-[#E2E8F0] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Open Application Status Tracker →
          </button>
        </div>
      </ContentSection>

      {/* 8. OFFICIAL SOURCES */}
      <OfficialSourcesAndAssistance
        sectionId="official-sources"
        organisationName={officialPortal.name}
        officialLinks={[
          {
            label: 'Official Government Portal',
            href: officialPortal.url,
          },
        ]}
        assistanceTitle="CSC DOST Digital Service Desk"
        assistanceDescription={`Need help preparing and submitting your ${service.name} request? Our VLE desk handles document formatting and online filing for you.`}
        assistanceButtonLabel="Request Assistance"
        onRequestAssistance={handleRequestAssistance}
      />
    </ContentPageLayout>
  );
}
