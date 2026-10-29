import { loadStripe } from '@stripe/stripe-js';

const publishableKey = 
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 
  'pk_test_51UVcGVJcW9DVnNYE38WIwMT2fDA2uq2jFcHoJ0mT5wUN28uBgr1rNXMEuwpcVsPvBnc9J0bXSkwxTygSMpDUA1Pe00wrBlwINN';

let stripePromise = null;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};
