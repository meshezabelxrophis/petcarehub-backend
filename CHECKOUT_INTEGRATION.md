# Stripe Checkout Integration - Usage Examples

## CheckoutButton Component

The `CheckoutButton` component handles Stripe checkout sessions and redirects users to Stripe's hosted checkout page.

### Basic Usage

```jsx
import CheckoutButton from '../components/CheckoutButton';

// In your component
<CheckoutButton
  serviceName="Pet Grooming"
  price={50.00}
  serviceId={123}
/>
```

### Advanced Usage

```jsx
import CheckoutButton from '../components/CheckoutButton';

// With custom styling and additional props
<CheckoutButton
  serviceName="Premium Pet Care Package"
  price={99.99}
  serviceId={456}
  className="w-full text-lg py-4"
  disabled={!isAvailable}
>
  Book Premium Package - $99.99
</CheckoutButton>
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `serviceName` | string | Yes | Name of the service being purchased |
| `price` | number | Yes | Price of the service |
| `serviceId` | number | No | ID of the service (for tracking) |
| `className` | string | No | Additional CSS classes |
| `disabled` | boolean | No | Disable the button |
| `children` | ReactNode | No | Custom button content |

### Features

- ✅ **Authentication Check**: Requires user to be logged in
- ✅ **Loading States**: Shows spinner during checkout creation
- ✅ **Error Handling**: Displays user-friendly error messages
- ✅ **Automatic Redirect**: Redirects to Stripe checkout page
- ✅ **Session Storage**: Stores session ID for reference

## Payment Flow

### 1. User clicks CheckoutButton
- Validates user is logged in
- Shows loading state
- Calls `/api/create-checkout-session`

### 2. Backend creates Stripe session
- Validates payment data
- Creates Stripe checkout session
- Stores payment record in database
- Returns checkout URL

### 3. User redirected to Stripe
- Secure Stripe-hosted checkout page
- User enters payment details
- Stripe processes payment

### 4. Payment completion
- **Success**: Redirected to `/payment-success`
- **Cancel**: Redirected to `/payment-cancelled`
- **Webhook**: Backend receives payment confirmation

## Integration Examples

### Service Cards
```jsx
// In Services.jsx or similar
{services.map(service => (
  <div key={service.id} className="service-card">
    <h3>{service.name}</h3>
    <p>${service.price}</p>
    <CheckoutButton
      serviceName={service.name}
      price={service.price}
      serviceId={service.id}
    />
  </div>
))}
```

### Service Detail Page
```jsx
// In ServiceDetail.jsx
<div className="service-details">
  <h1>{service.name}</h1>
  <p>{service.description}</p>
  <div className="pricing">
    <span className="price">${service.price}</span>
    <CheckoutButton
      serviceName={service.name}
      price={service.price}
      serviceId={service.id}
      className="btn-primary btn-large"
    >
      Book This Service - ${service.price}
    </CheckoutButton>
  </div>
</div>
```

### Custom Packages
```jsx
// For custom service packages
const handleCustomCheckout = () => {
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const packageName = `Custom Package (${selectedServices.length} services)`;
  
  return (
    <CheckoutButton
      serviceName={packageName}
      price={totalPrice}
      serviceId={null} // Custom package
      className="checkout-package-btn"
    >
      Pay ${totalPrice.toFixed(2)} for Package
    </CheckoutButton>
  );
};
```

## Error Handling

The component handles various error scenarios:

- **Not logged in**: Shows warning message
- **Missing data**: Validates required props
- **Network errors**: Displays error message
- **Server errors**: Shows user-friendly error

## Styling

The component uses Tailwind CSS classes and can be customized:

```jsx
// Custom styling
<CheckoutButton
  serviceName="VIP Service"
  price={199.99}
  className="
    w-full py-4 text-lg font-bold
    bg-gradient-to-r from-purple-600 to-pink-600
    hover:from-purple-700 hover:to-pink-700
    shadow-xl hover:shadow-2xl
    transform hover:scale-105 transition-all
  "
>
  🌟 Book VIP Service - $199.99
</CheckoutButton>
```

## Testing

Use Stripe test cards for development:

- **Success**: `4242424242424242`
- **Declined**: `4000000000000002`
- **3D Secure**: `4000000000003220`

## Security Notes

- Never expose secret keys in frontend
- All sensitive operations happen on backend
- Stripe handles PCI compliance
- Session IDs are safe to store in localStorage

