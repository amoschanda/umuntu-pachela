import z from "zod";

// User Profile
export const UserProfileSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  role: z.enum(["rider", "driver"]),
  full_name: z.string().nullable(),
  phone_number: z.string().nullable(),
  profile_image_url: z.string().nullable(),
  vehicle_type: z.string().nullable(),
  vehicle_plate: z.string().nullable(),
  vehicle_color: z.string().nullable(),
  rating: z.number().nullable(),
  total_rides: z.number(),
  is_available: z.number(),
  current_latitude: z.number().nullable(),
  current_longitude: z.number().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

// Ride
export const RideSchema = z.object({
  id: z.number(),
  rider_id: z.string(),
  driver_id: z.string().nullable(),
  status: z.enum(["requested", "accepted", "picked_up", "completed", "cancelled"]),
  pickup_latitude: z.number(),
  pickup_longitude: z.number(),
  pickup_address: z.string(),
  dropoff_latitude: z.number(),
  dropoff_longitude: z.number(),
  dropoff_address: z.string(),
  rider_price: z.number().nullable(),
  driver_price: z.number().nullable(),
  final_price: z.number().nullable(),
  distance_km: z.number().nullable(),
  estimated_duration_minutes: z.number().nullable(),
  vehicle_type: z.string().nullable(),
  scheduled_time: z.string().nullable(),
  payment_method: z.string().nullable(),
  rider_rating: z.number().nullable(),
  driver_rating: z.number().nullable(),
  rider_feedback: z.string().nullable(),
  driver_feedback: z.string().nullable(),
  started_at: z.string().nullable(),
  completed_at: z.string().nullable(),
  cancelled_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Ride = z.infer<typeof RideSchema>;

// Ride Message
export const RideMessageSchema = z.object({
  id: z.number(),
  ride_id: z.number(),
  sender_id: z.string(),
  message: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type RideMessage = z.infer<typeof RideMessageSchema>;

// Favorite Location
export const FavoriteLocationSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  name: z.string(),
  address: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type FavoriteLocation = z.infer<typeof FavoriteLocationSchema>;

// Driver Earnings
export const DriverEarningsSchema = z.object({
  id: z.number(),
  driver_id: z.string(),
  ride_id: z.number(),
  amount: z.number(),
  date: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type DriverEarnings = z.infer<typeof DriverEarningsSchema>;

// Emergency Contact
export const EmergencyContactSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  name: z.string(),
  phone_number: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type EmergencyContact = z.infer<typeof EmergencyContactSchema>;

// Payment Transaction
export const PaymentTransactionSchema = z.object({
  id: z.number(),
  ride_id: z.number(),
  user_id: z.string(),
  provider: z.string(),
  amount: z.number(),
  phone_number: z.string(),
  transaction_id: z.string().nullable(),
  status: z.string(),
  response_data: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type PaymentTransaction = z.infer<typeof PaymentTransactionSchema>;

// API Request/Response Types
export const CreateProfileRequestSchema = z.object({
  role: z.enum(["rider", "driver"]),
  full_name: z.string(),
  phone_number: z.string(),
  vehicle_type: z.string().optional(),
  vehicle_plate: z.string().optional(),
  vehicle_color: z.string().optional(),
});

export type CreateProfileRequest = z.infer<typeof CreateProfileRequestSchema>;

export const UpdateProfileRequestSchema = z.object({
  full_name: z.string().optional(),
  phone_number: z.string().optional(),
  vehicle_type: z.string().optional(),
  vehicle_plate: z.string().optional(),
  vehicle_color: z.string().optional(),
  is_available: z.number().optional(),
  current_latitude: z.number().optional(),
  current_longitude: z.number().optional(),
});

export type UpdateProfileRequest = z.infer<typeof UpdateProfileRequestSchema>;

export const CreateRideRequestSchema = z.object({
  pickup_latitude: z.number(),
  pickup_longitude: z.number(),
  pickup_address: z.string(),
  dropoff_latitude: z.number(),
  dropoff_longitude: z.number(),
  dropoff_address: z.string(),
  rider_price: z.number(),
  vehicle_type: z.string().optional(),
  scheduled_time: z.string().optional(),
  payment_method: z.string().optional(),
});

export type CreateRideRequest = z.infer<typeof CreateRideRequestSchema>;

export const AcceptRideRequestSchema = z.object({
  driver_price: z.number(),
});

export type AcceptRideRequest = z.infer<typeof AcceptRideRequestSchema>;

export const SendMessageRequestSchema = z.object({
  message: z.string(),
});

export type SendMessageRequest = z.infer<typeof SendMessageRequestSchema>;

export const CreateFavoriteLocationRequestSchema = z.object({
  name: z.string(),
  address: z.string(),
  latitude: z.number(),
  longitude: z.number(),
});

export type CreateFavoriteLocationRequest = z.infer<typeof CreateFavoriteLocationRequestSchema>;

export const RateRideRequestSchema = z.object({
  rating: z.number().min(1).max(5),
  feedback: z.string().optional(),
});

export type RateRideRequest = z.infer<typeof RateRideRequestSchema>;

export const ProcessPaymentRequestSchema = z.object({
  provider: z.enum(["airtel", "mtn", "zamtel", "wallet"]),
  phone_number: z.string().optional(),
  amount: z.number(),
});

export type ProcessPaymentRequest = z.infer<typeof ProcessPaymentRequestSchema>;

// Wallet
export const WalletSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  balance: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Wallet = z.infer<typeof WalletSchema>;

export const WalletTransactionSchema = z.object({
  id: z.number(),
  wallet_id: z.number(),
  amount: z.number(),
  transaction_type: z.enum(["credit", "debit", "ride_payment", "ride_earning", "refund"]),
  description: z.string().nullable(),
  ride_id: z.number().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type WalletTransaction = z.infer<typeof WalletTransactionSchema>;
