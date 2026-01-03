import React, { useState, useEffect } from 'react';
import { PoweredByStrava } from '../constants';
import { getUnitSystem, setUnitSystem, UnitSystem } from '../utils/units';

interface SettingsPageProps {
  onBack: () => void;
  onNavigateToPrivacy: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  onBack,
  onNavigateToPrivacy,
}) => {
  const [notifications, setNotifications] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [units, setUnits] = useState<UnitSystem>('metric');
  const [showHelpFAQ, setShowHelpFAQ] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  // Load saved unit preference on mount
  useEffect(() => {
    setUnits(getUnitSystem());
  }, []);

  // Save unit preference when changed
  const handleUnitsChange = (newUnits: UnitSystem) => {
    setUnits(newUnits);
    setUnitSystem(newUnits);
  };

  const Toggle: React.FC<{ enabled: boolean; onToggle: () => void }> = ({ enabled, onToggle }) => (
    <button
      onClick={onToggle}
      className={`relative w-12 h-7 rounded-full transition-colors ${
        enabled ? 'bg-orange-500' : 'bg-zinc-700'
      }`}
    >
      <div
        className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
          enabled ? 'left-6' : 'left-1'
        }`}
      />
    </button>
  );

  const SettingRow: React.FC<{
    title: string;
    subtitle?: string;
    children: React.ReactNode;
  }> = ({ title, subtitle, children }) => (
    <div className="flex items-center justify-between py-4">
      <div>
        <p className="font-medium">{title}</p>
        {subtitle && <p className="text-sm text-zinc-400">{subtitle}</p>}
      </div>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
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
            Settings
          </h1>
        </div>
      </div>

      {/* Settings Content */}
      <div className="px-4 py-2">
        {/* Notifications Section */}
        <div className="border-b border-zinc-800">
          <h2 className="text-sm text-zinc-500 uppercase tracking-wider pt-4 pb-2">
            Notifications
          </h2>
          <SettingRow
            title="Push Notifications"
            subtitle="Get notified when overlays are ready"
          >
            <Toggle enabled={notifications} onToggle={() => setNotifications(!notifications)} />
          </SettingRow>
        </div>

        {/* Sync Section */}
        <div className="border-b border-zinc-800">
          <h2 className="text-sm text-zinc-500 uppercase tracking-wider pt-4 pb-2">
            Strava Sync
          </h2>
          <SettingRow
            title="Auto-Sync Activities"
            subtitle="Automatically sync new activities"
          >
            <Toggle enabled={autoSync} onToggle={() => setAutoSync(!autoSync)} />
          </SettingRow>
        </div>

        {/* Units Section */}
        <div className="border-b border-zinc-800">
          <h2 className="text-sm text-zinc-500 uppercase tracking-wider pt-4 pb-2">
            Display
          </h2>
          <SettingRow title="Units">
            <div className="flex bg-zinc-800 rounded-lg overflow-hidden">
              <button
                onClick={() => handleUnitsChange('metric')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  units === 'metric' ? 'bg-orange-500 text-white' : 'text-zinc-400'
                }`}
              >
                Metric
              </button>
              <button
                onClick={() => handleUnitsChange('imperial')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  units === 'imperial' ? 'bg-orange-500 text-white' : 'text-zinc-400'
                }`}
              >
                Imperial
              </button>
            </div>
          </SettingRow>
        </div>

        {/* Support Section */}
        <div className="border-b border-zinc-800">
          <h2 className="text-sm text-zinc-500 uppercase tracking-wider pt-4 pb-2">
            Support
          </h2>
          <button 
            onClick={() => setShowHelpFAQ(true)}
            className="w-full text-left py-4 flex items-center justify-between"
          >
            <span>Help & FAQ</span>
            <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <a 
            href="mailto:contact@appstatik.com"
            className="w-full text-left py-4 flex items-center justify-between text-white"
          >
            <span>Contact Us</span>
            <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </a>
        </div>

        {/* Legal Section */}
        <div className="border-b border-zinc-800">
          <h2 className="text-sm text-zinc-500 uppercase tracking-wider pt-4 pb-2">
            Legal
          </h2>
          <button
            onClick={onNavigateToPrivacy}
            className="w-full text-left py-4 flex items-center justify-between"
          >
            <span>Privacy Policy</span>
            <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button
            onClick={() => setShowTerms(true)}
            className="w-full text-left py-4 flex items-center justify-between"
          >
            <span>Terms of Service</span>
            <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <a 
            href="https://www.strava.com/legal/api"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full text-left py-4 flex items-center justify-between text-white"
          >
            <span>Strava API Agreement</span>
            <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        {/* App Info */}
        <div className="py-6 text-center text-zinc-500 text-sm">
          <p 
            className="text-lg text-white mb-1"
            style={{ fontFamily: '"Londrina Shadow", cursive' }}
          >
            statik.
          </p>
          <p className="mb-3">Version 1.0.0</p>
          {/* Strava attribution - required per brand guidelines */}
          <PoweredByStrava variant="light" />
        </div>

        {/* Danger Zone */}
        <div className="pb-8">
          <button className="w-full text-red-400 hover:text-red-300 py-3 text-sm font-medium transition-colors">
            Delete Account
          </button>
        </div>
      </div>

      {/* Help & FAQ Modal */}
      {showHelpFAQ && (
        <div className="fixed inset-0 bg-zinc-950 z-50 overflow-y-auto">
          <div className="sticky top-0 bg-zinc-950/90 backdrop-blur-sm border-b border-zinc-800 z-10">
            <div className="flex items-center px-4 py-4">
              <button
                onClick={() => setShowHelpFAQ(false)}
                className="text-zinc-400 hover:text-white transition-colors mr-4"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl" style={{ fontFamily: '"Londrina Shadow", cursive' }}>
                Help & FAQ
              </h1>
            </div>
          </div>
          <div className="px-4 py-6 space-y-6 text-zinc-300 leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-white mb-3">Getting Started</h2>
              <div className="space-y-4">
                <div className="bg-zinc-900 rounded-xl p-4">
                  <h3 className="font-medium text-white mb-2">What is statik.?</h3>
                  <p className="text-sm">statik. is an app that creates beautiful, customizable overlays for your running and cycling activities. Connect your Strava account, pick a style, and share your achievements on social media.</p>
                </div>
                <div className="bg-zinc-900 rounded-xl p-4">
                  <h3 className="font-medium text-white mb-2">How do I connect Strava?</h3>
                  <p className="text-sm">Go to your Profile page and tap the "Connect with Strava" button. You'll be redirected to Strava to authorize access. Once connected, your activities will automatically sync.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">Creating Overlays</h2>
              <div className="space-y-4">
                <div className="bg-zinc-900 rounded-xl p-4">
                  <h3 className="font-medium text-white mb-2">How do I create an overlay?</h3>
                  <p className="text-sm">Tap on any activity from your feed, choose a style pack from the gallery, select a variant (Stats, Hero, Route + Stats, or Create), and customize colors and stats. Tap the save button to export your overlay.</p>
                </div>
                <div className="bg-zinc-900 rounded-xl p-4">
                  <h3 className="font-medium text-white mb-2">What are style packs?</h3>
                  <p className="text-sm">Style packs are curated font and color combinations. Each pack has a unique look and feel. Swipe through the gallery at the bottom to browse all 30+ available packs.</p>
                </div>
                <div className="bg-zinc-900 rounded-xl p-4">
                  <h3 className="font-medium text-white mb-2">What are overlay variants?</h3>
                  <p className="text-sm">Each pack offers multiple layouts: Stats (stats with route below), Hero (one large stat), Route + Stats (route with stats below), and Create (build your own layout from scratch).</p>
                </div>
                <div className="bg-zinc-900 rounded-xl p-4">
                  <h3 className="font-medium text-white mb-2">Can I add my own photo background?</h3>
                  <p className="text-sm">Yes! Tap the photo icon in the toolbar to upload a background image. The overlay will be rendered on top of your photo.</p>
                </div>
                <div className="bg-zinc-900 rounded-xl p-4">
                  <h3 className="font-medium text-white mb-2">How do I customize stats?</h3>
                  <p className="text-sm">Tap on the stats in the preview to open the editor. You can choose which stats to display, change colors, add effects like blur or grain, and enable outlines.</p>
                </div>
                <div className="bg-zinc-900 rounded-xl p-4">
                  <h3 className="font-medium text-white mb-2">How do I customize the route?</h3>
                  <p className="text-sm">Tap on the route in the preview to open the route editor. You can change the route style (solid, 3D, glow, gradient, dotted, dashed), color, and visibility.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">Toolbar Buttons</h2>
              <div className="space-y-4">
                <div className="bg-zinc-900 rounded-xl p-4">
                  <h3 className="font-medium text-white mb-2">Photo Button</h3>
                  <p className="text-sm">Add or remove a background photo for your overlay.</p>
                </div>
                <div className="bg-zinc-900 rounded-xl p-4">
                  <h3 className="font-medium text-white mb-2">T Button (Labels)</h3>
                  <p className="text-sm">Toggle stat labels on/off. When off, only the values are shown.</p>
                </div>
                <div className="bg-zinc-900 rounded-xl p-4">
                  <h3 className="font-medium text-white mb-2">Map Button (Route)</h3>
                  <p className="text-sm">Toggle the route/map visibility on or off.</p>
                </div>
                <div className="bg-zinc-900 rounded-xl p-4">
                  <h3 className="font-medium text-white mb-2">Color Button</h3>
                  <p className="text-sm">Open the color picker to customize text and route colors.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">Create Mode</h2>
              <div className="space-y-4">
                <div className="bg-zinc-900 rounded-xl p-4">
                  <h3 className="font-medium text-white mb-2">What is Create mode?</h3>
                  <p className="text-sm">Create mode lets you build a custom overlay from scratch. Add individual stats, route, title, and date elements. Drag to reposition and tap to edit each element.</p>
                </div>
                <div className="bg-zinc-900 rounded-xl p-4">
                  <h3 className="font-medium text-white mb-2">How do I add elements?</h3>
                  <p className="text-sm">Tap the + button in the bottom right corner to open the element menu. Choose from stats, route, title, and date elements to add to your canvas.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">Saving & Sharing</h2>
              <div className="space-y-4">
                <div className="bg-zinc-900 rounded-xl p-4">
                  <h3 className="font-medium text-white mb-2">How do I save my overlay?</h3>
                  <p className="text-sm">Tap the save button (download icon) in the top right corner. On iOS, you can share directly to Instagram, Messages, or save to your Photos.</p>
                </div>
                <div className="bg-zinc-900 rounded-xl p-4">
                  <h3 className="font-medium text-white mb-2">What resolution are exported overlays?</h3>
                  <p className="text-sm">Overlays are exported at 3x resolution for crisp, high-quality images perfect for social media.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">Troubleshooting</h2>
              <div className="space-y-4">
                <div className="bg-zinc-900 rounded-xl p-4">
                  <h3 className="font-medium text-white mb-2">My activities aren't syncing</h3>
                  <p className="text-sm">Pull down on the activity feed to refresh. If activities still don't appear, try disconnecting and reconnecting Strava from your Profile. Make sure the activity is marked as public or "Followers Only" on Strava.</p>
                </div>
                <div className="bg-zinc-900 rounded-xl p-4">
                  <h3 className="font-medium text-white mb-2">The route isn't showing</h3>
                  <p className="text-sm">Some activities may not have GPS data. Indoor activities (treadmill, indoor cycling) typically don't include route data. Check that the route toggle is enabled in the toolbar. Note: Activities marked as "Private" on Strava will not include route data unless you grant specific permission in your Strava privacy settings.</p>
                </div>
                <div className="bg-zinc-900 rounded-xl p-4">
                  <h3 className="font-medium text-white mb-2">Fonts look different in export</h3>
                  <p className="text-sm">Make sure all fonts are fully loaded before exporting. Wait a moment after switching packs before saving.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">Contact</h2>
              <div className="bg-zinc-900 rounded-xl p-4">
                <p className="text-sm mb-3">Still have questions? We're here to help!</p>
                <a 
                  href="mailto:contact@appstatik.com"
                  className="inline-flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email Us
                </a>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* Terms of Service Modal */}
      {showTerms && (
        <div className="fixed inset-0 bg-zinc-950 z-50 overflow-y-auto">
          <div className="sticky top-0 bg-zinc-950/90 backdrop-blur-sm border-b border-zinc-800 z-10">
            <div className="flex items-center px-4 py-4">
              <button
                onClick={() => setShowTerms(false)}
                className="text-zinc-400 hover:text-white transition-colors mr-4"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl" style={{ fontFamily: '"Londrina Shadow", cursive' }}>
                Terms of Service
              </h1>
            </div>
          </div>
          <div className="px-4 py-6 space-y-6 text-zinc-300 leading-relaxed">
            <p className="text-sm text-zinc-500">Last updated: December 17, 2025</p>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">1. Acceptance of Terms</h2>
              <p>By downloading, installing, or using statik. ("the App"), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the App.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">2. Description of Service</h2>
              <p>statik. is a mobile application that allows users to create customizable visual overlays for their fitness activities by connecting to third-party services like Strava.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">3. User Accounts</h2>
              <p className="mb-2">To use certain features of the App, you must create an account. You agree to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">4. Strava Integration</h2>
              <p>The App integrates with Strava's API to access your activity data. By connecting your Strava account, you also agree to comply with Strava's Terms of Service and API Agreement. We are not responsible for any changes to Strava's services or API availability.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">5. Subscription and Payments</h2>
              <p className="mb-2">The App offers a subscription service with the following terms:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Free trial period may be offered to new users</li>
                <li>Subscription fees are billed on a recurring basis (e.g., monthly or annually) selected by you at the time of purchase through Apple's App Store or Google Play</li>
                <li>Subscriptions auto-renew unless cancelled 24 hours before the renewal date</li>
                <li>Refunds are subject to your app store's refund policies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">6. User Content</h2>
              <p className="mb-2">You retain ownership of any content you create using the App, including overlays and exported images. You grant us a limited license to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Process your content to provide the service</li>
                <li>Display your content within the App</li>
              </ul>
              <p className="mt-2">We do not claim ownership of your photos, activities, or created overlays.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">7. Prohibited Uses</h2>
              <p className="mb-2">You agree not to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Use the App for any illegal purpose</li>
                <li>Attempt to reverse engineer or modify the App</li>
                <li>Share your account credentials with others</li>
                <li>Use automated systems to access the App</li>
                <li>Interfere with or disrupt the App's operation</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">8. Intellectual Property</h2>
              <p>The App, including its design, fonts, graphics, and code, is owned by us and protected by intellectual property laws. The fonts used in style packs are licensed under the SIL Open Font License.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">9. Disclaimer of Warranties</h2>
              <p>THE APP IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT GUARANTEE UNINTERRUPTED OR ERROR-FREE OPERATION. YOUR USE OF THE APP IS AT YOUR OWN RISK.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">10. Limitation of Liability</h2>
              <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES ARISING FROM YOUR USE OF THE APP.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">11. Changes to Terms</h2>
              <p>We may update these Terms at any time. Continued use of the App after changes constitutes acceptance of the new Terms. We will notify users of significant changes.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">12. Termination</h2>
              <p>We reserve the right to terminate or suspend your account at any time for violation of these Terms. You may delete your account at any time from the Settings page.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">13. Contact</h2>
              <p>For questions about these Terms, contact us at:</p>
              <a href="mailto:contact@appstatik.com" className="text-orange-400">contact@appstatik.com</a>
            </section>
          </div>
        </div>
      )}
    </div>
  );
};
