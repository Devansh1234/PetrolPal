import Link from 'next/link';
import LegalPage from '@/components/LegalPage';

export const metadata = { title: 'Terms of use' };

// DRAFT — have a lawyer review before launch. Replace every [BRACKETED] item.
export default function TermsPage() {
  return (
    <LegalPage title="Terms of use" updated="[DATE]">
      <p>
        Petrol Pal (petrolpal.in) is run by [LEGAL ENTITY NAME], [REGISTERED ADDRESS] (“we”, “us”). By using this website you agree to these terms.
      </p>

      <h2>What Petrol Pal is</h2>
      <ul>
        <li>A map of petrol pumps in India, built from OpenStreetMap and from information our users send us.</li>
        <li>
          A place to share fuel test results from Petrol Pal testers. Results are measured by members of the public using consumer devices. They are an
          indication only, not a laboratory test or certificate, and they measure ethanol content only.
        </li>
        <li>We do not state or imply that any pump, dealer or oil company sells adulterated, short-measured or substandard fuel.</li>
      </ul>

      <h2>No guarantee</h2>
      <p>
        Pump locations, names, brands and results may be incomplete, out of date or wrong. Don’t rely on Petrol Pal for any decision where accuracy matters.
        The service is provided “as is”, without warranties of any kind, to the extent the law allows.
      </p>

      <h2>Uploading tests</h2>
      <ul>
        <li>Only upload tests you carried out yourself, at the pump you select, using an unmodified Petrol Pal tester.</li>
        <li>Don’t try to manipulate results — for example by uploading tests from somewhere else, copying codes, or tampering with a tester.</li>
        <li>We may exclude or remove any test, and suspend testers, at our discretion.</li>
      </ul>

      <h2>Reviews</h2>
      <ul>
        <li>Reviews must describe your own visit honestly and stick to the service and facilities.</li>
        <li>
          Don’t post claims about fuel quality or quantity, accusations of wrongdoing, personal information, anything naming or describing staff, abuse,
          or anything unlawful. Use our <Link href="/report">private contact form</Link> for fuel concerns.
        </li>
        <li>We check reviews before publishing and may decline or remove any review. You keep ownership of your review and give us a licence to show it on Petrol Pal.</li>
      </ul>

      <h2>Pump owners and dealers</h2>
      <p>
        If you own or manage a pump, you can ask us to correct its details or respond to anything shown, using “Own or manage this pump?” on its page or our{' '}
        <Link href="/grievance">grievance officer</Link>.
      </p>

      <h2>Accounts</h2>
      <p>You don’t need an account to use the map or upload tests. If you create one, keep access to your email secure. You can ask us to delete your account at any time.</p>

      <h2>Liability</h2>
      <p>To the extent the law allows, we are not liable for any indirect or consequential loss arising from use of Petrol Pal. [LIABILITY CAP — LAWYER TO ADVISE]</p>

      <h2>Changes and governing law</h2>
      <p>
        We may update these terms; the date above shows the latest version. These terms are governed by the laws of India, and courts at [CITY] have
        jurisdiction.
      </p>

      <h2>Contact</h2>
      <p>
        Questions or complaints: <Link href="/grievance">Grievance officer</Link> · [CONTACT EMAIL]
      </p>
    </LegalPage>
  );
}
