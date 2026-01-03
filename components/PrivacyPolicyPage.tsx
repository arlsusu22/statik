import React from 'react';

interface PrivacyPolicyPageProps {
  onBack: () => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onBack }) => {
  return (
    <div className="fixed inset-0 bg-zinc-950 text-white overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-zinc-950/90 backdrop-blur-sm border-b border-zinc-800 z-10">
        <div className="flex items-center px-4 py-4">
          <button
            onClick={onBack}
            className="text-zinc-400 hover:text-white transition-colors mr-4"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 
            className="text-xl"
            style={{ fontFamily: '"Londrina Shadow", cursive' }}
          >
            Privacy Policy
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 pb-20 space-y-6 text-zinc-300 leading-relaxed">
        <p className="text-sm text-zinc-500">Last updated: December 17, 2025</p>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">1. Introduction</h2>
          <p>
            Welcome to statik. ("we," "our," or "us"). We respect your privacy and are committed 
            to protecting your personal data. This privacy policy explains how we collect, use, 
            and safeguard your information when you use our mobile application.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">2. Information We Collect</h2>
          <p className="mb-2">We collect the following types of information:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Account Information:</strong> Email address and password when you create an account
            </li>
            <li>
              <strong>Strava Data:</strong> When you connect Strava, we access your activity data 
              including distance, duration, pace, route, and heart rate
            </li>
            <li>
              <strong>Photos:</strong> Images you upload as backgrounds for your overlays (stored locally 
              on your device, not on our servers)
            </li>
            <li>
              <strong>Usage Data:</strong> How you interact with the app to improve our services
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">3. How We Use Your Information</h2>
          <p className="mb-2">We use your information to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Provide and maintain our service</li>
            <li>Generate activity overlays with your running stats</li>
            <li>Send push notifications about new activities (if enabled)</li>
            <li>Process subscription payments</li>
            <li>Improve and personalize your experience</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">4. Strava Integration</h2>
          <p className="mb-2">
            We use Strava's API to access your activity data. We only request the permissions 
            necessary to display your activity stats. We do not modify or delete any data on 
            your Strava account. You can disconnect Strava at any time from your profile settings.
          </p>
          <p className="mb-2">
            Our use of Strava data is governed by the{' '}
            <a 
              href="https://www.strava.com/legal/api" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-orange-400 underline"
            >
              Strava API Agreement
            </a>. By connecting your Strava account, you also agree to Strava's{' '}
            <a 
              href="https://www.strava.com/legal/terms" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-orange-400 underline"
            >
              Terms of Service
            </a>{' '}and{' '}
            <a 
              href="https://www.strava.com/legal/privacy" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-orange-400 underline"
            >
              Privacy Policy
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">5. Data Storage & Security</h2>
          <p>
            Your photos and generated overlays are stored locally on your device. Account 
            information is stored securely on our servers with industry-standard encryption. 
            We do not sell your personal data to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">6. Push Notifications</h2>
          <p>
            With your permission, we send push notifications when new activities are synced 
            from Strava and your overlays are ready. You can disable notifications at any time 
            in the Settings.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">7. Subscriptions & Payments</h2>
          <p>
            Subscription payments are processed through Apple's App Store or Google Play. 
            We do not store your payment card details. Subscription management is handled 
            through your device's app store settings.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">8. Your Rights</h2>
          <p className="mb-2">You have the right to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Access and export your personal data</li>
            <li>Request deletion of your account and data</li>
            <li>Disconnect third-party services (Strava)</li>
            <li>Opt out of marketing communications</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">9. Children's Privacy</h2>
          <p>
            Our service is not intended for children under 13. We do not knowingly collect 
            personal information from children under 13.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">10. Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. We will notify you of any 
            changes by posting the new policy in the app and updating the "Last updated" date.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-white mb-2">11. Contact Us</h2>
          <p>
            If you have any questions about this privacy policy or our data practices, 
            please contact us at:
          </p>
          <p className="mt-2 text-orange-400">contact@appstatik.com</p>
        </section>

        <div className="pt-6 pb-8 text-center text-zinc-500 text-sm">
          <p 
            className="text-lg text-white mb-1"
            style={{ fontFamily: '"Londrina Shadow", cursive' }}
          >
            statik.
          </p>
          <p>© 2025 All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};
