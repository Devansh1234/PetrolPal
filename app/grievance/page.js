import Link from 'next/link';
import LegalPage from '@/components/LegalPage';

export const metadata = { title: 'Grievance officer' };

// Required for platforms that host user content (IT Rules, 2021). Replace every [BRACKETED] item.
export default function GrievancePage() {
  return (
    <LegalPage title="Grievance officer" updated="[DATE]">
      <p>
        If you have a complaint about anything on Petrol Pal — including content about a pump you own or manage, a review, or how we handle your data —
        contact our grievance officer.
      </p>
      <div className="card flex flex-col gap-1 p-5">
        <strong>[GRIEVANCE OFFICER NAME]</strong>
        <span>[LEGAL ENTITY NAME]</span>
        <span>[REGISTERED ADDRESS]</span>
        <span>Email: [GRIEVANCE EMAIL]</span>
      </div>
      <p>We acknowledge complaints within 24 hours and aim to resolve them within 15 days.</p>
      <p>
        For corrections to a pump’s details, the quickest route is “Report wrong info” on the pump’s page, or our <Link href="/report">contact form</Link>.
      </p>
    </LegalPage>
  );
}
