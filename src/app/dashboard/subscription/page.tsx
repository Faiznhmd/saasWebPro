import { getProductCount } from '@/server/db/product';
import { getProductViewCount } from '@/server/db/productViews';
import { getUserSubscriptionTier } from '@/server/db/subscription';
import { auth } from '@clerk/nextjs/server';
import { startOfMonth } from 'date-fns';

export default async function Subscription() {
  const { userId, redirectToSignIn } = await auth();
  if (userId == null) return redirectToSignIn();
  const tier = await getUserSubscriptionTier(userId);
  const productCount = await getProductCount(userId);
  const pricingViewCount = await getProductViewCount(
    userId,
    startOfMonth(new Date())
  );
  return null;
}
