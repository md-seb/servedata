import {DEBUG, PAYMENT_MODE} from '../common.js';
import stripeKey from '../publicStripeKey.js';

export default async function ToCheckoutView(state) {
  return `
    <html lang=en>
      <meta charset=utf-8>
      <meta name=viewport content="width=device-width, initial-scale=1">
      <title>Capi.Click - Redirectring to Checkout</title>
      <script type=module>
        import {loadStripe} from '/${DEBUG.BUILD}/web_modules/@stripe/stripe-js.js';

        init();

        async function init() {
          const stripe = await loadStripe("${stripeKey[PAYMENT_MODE]}");

          const {error} = await stripe.redirectToCheckout(${JSON.stringify(state)});

          if ( error ) {
            alert(error.message);
          }
        }
      </script>
    </html>
  `
}
