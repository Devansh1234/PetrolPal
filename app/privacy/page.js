import Link from 'next/link';
import LegalPage from '@/components/LegalPage';

export const metadata = { title: 'Privacy policy' };

// DRAFT — have a lawyer review before launch (Digital Personal Data Protection Act, 2023). Replace every [BRACKETED] item.
export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy" updated="[DATE]">
      <p>
        This policy explains what personal data Petrol Pal ([LEGAL ENTITY NAME], “we”) collects, why, and your choices. We collect as little as we need.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>When you upload a test:</strong> the reading from your tester (ethanol %, time, tester serial), the pump you chose, and your phone’s
          location at that moment. Location is used to check you were at the pump.
        </li>
        <li>
          <strong>If you sign in:</strong> your email address and name (from Google, if you use Google sign-in), and the tests and reviews linked to your
          account.
        </li>
        <li>
          <strong>If you join the waitlist:</strong> your name, phone and/or email, city and the model you’re interested in.
        </li>
        <li>
          <strong>If you contact us or report a pump:</strong> what you write and any contact details you give.
        </li>
        <li>Basic technical data needed to run the site securely (for example, IP address in server logs).</li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To show pumps and combined test results. Individual readings and locations are never shown publicly.</li>
        <li>To check tests are genuine and prevent misuse.</li>
        <li>To let you sign in and see your own history.</li>
        <li>To tell waitlist members when Petrol Pal is available.</li>
        <li>To respond to reports and requests.</li>
      </ul>
      <p>We don’t sell your personal data and we don’t use it for advertising.</p>

      <h2>Who we share it with</h2>
      <ul>
        <li>Service providers that host the site and database for us ([e.g. Supabase, Vercel]) under contract.</li>
        <li>Authorities, where the law requires it.</li>
        <li>
          We may share combined, non-personal test summaries about a pump with the relevant oil company or regulator. These never include your identity.
        </li>
      </ul>

      <h2>How long we keep it</h2>
      <p>[RETENTION PERIODS — e.g. test locations for X months; waitlist until launch + X months; accounts until you delete them.]</p>

      <h2>Your rights</h2>
      <p>
        You can ask to see, correct or delete your personal data, or withdraw consent, by contacting our <Link href="/grievance">grievance officer</Link>.
        Signed-in users can see their tests and reviews in <Link href="/account">My account</Link>.
      </p>

      <h2>Contact</h2>
      <p>
        [LEGAL ENTITY NAME], [REGISTERED ADDRESS] · [CONTACT EMAIL]
      </p>
    </LegalPage>
  );
}
