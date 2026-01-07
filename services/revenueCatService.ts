import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';

// ⚠️ REPLACE THIS with your actual RevenueCat API key from the dashboard
// Click "Show key" next to "Test Store" and paste it here
const REVENUECAT_API_KEY = 'appl_YOUR_API_KEY_HERE';

// Your entitlement ID from RevenueCat (configure in Products > Entitlements)
const ENTITLEMENT_ID = 'pro';

export const initializeRevenueCat = async (): Promise<void> => {
  try {
    await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG }); // Remove in production
    await Purchases.configure({
      apiKey: REVENUECAT_API_KEY,
    });
    console.log('RevenueCat initialized successfully');
  } catch (error) {
    console.error('Failed to initialize RevenueCat:', error);
  }
};

export const checkProAccess = async (): Promise<boolean> => {
  try {
    const { customerInfo } = await Purchases.getCustomerInfo();
    const isActive = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
    return isActive;
  } catch (error) {
    console.error('Failed to check pro access:', error);
    return false;
  }
};

export const getOfferings = async () => {
  try {
    const { offerings } = await Purchases.getOfferings();
    if (offerings.current) {
      return offerings.current;
    }
    return null;
  } catch (error) {
    console.error('Failed to get offerings:', error);
    return null;
  }
};

export const purchasePackage = async (packageToPurchase: any): Promise<boolean> => {
  try {
    const { customerInfo } = await Purchases.purchasePackage({
      aPackage: packageToPurchase,
    });
    const isActive = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
    return isActive;
  } catch (error: any) {
    if (error.userCancelled) {
      console.log('User cancelled purchase');
    } else {
      console.error('Purchase failed:', error);
    }
    return false;
  }
};

export const restorePurchases = async (): Promise<boolean> => {
  try {
    const { customerInfo } = await Purchases.restorePurchases();
    const isActive = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
    return isActive;
  } catch (error) {
    console.error('Failed to restore purchases:', error);
    return false;
  }
};
