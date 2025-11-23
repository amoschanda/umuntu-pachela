import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import {
  exchangeCodeForSessionToken,
  getOAuthRedirectUrl,
  authMiddleware,
  deleteSession,
  MOCHA_SESSION_TOKEN_COOKIE_NAME,
} from "@getmocha/users-service/backend";
import {
  CreateProfileRequestSchema,
  UpdateProfileRequestSchema,
  CreateRideRequestSchema,
  AcceptRideRequestSchema,
  SendMessageRequestSchema,
  CreateFavoriteLocationRequestSchema,
  RateRideRequestSchema,
  ProcessPaymentRequestSchema,
  UserProfileSchema,
  RideSchema,
  RideMessageSchema,
  FavoriteLocationSchema,
  PaymentTransactionSchema,
} from "@/shared/types";

const app = new Hono<{ Bindings: Env }>();

// Auth endpoints
app.get("/api/oauth/google/redirect_url", async (c) => {
  const redirectUrl = await getOAuthRedirectUrl("google", {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  return c.json({ redirectUrl }, 200);
});

app.post("/api/sessions", async (c) => {
  const body = await c.req.json();

  if (!body.code) {
    return c.json({ error: "No authorization code provided" }, 400);
  }

  const sessionToken = await exchangeCodeForSessionToken(body.code, {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 60 * 24 * 60 * 60,
  });

  return c.json({ success: true }, 200);
});

app.get("/api/users/me", authMiddleware, async (c) => {
  return c.json(c.get("user"));
});

app.get("/api/logout", async (c) => {
  const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);

  if (typeof sessionToken === "string") {
    await deleteSession(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
    });
  }

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, "", {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 0,
  });

  return c.json({ success: true }, 200);
});

// Profile endpoints
app.post("/api/profiles", authMiddleware, async (c) => {
  const user = c.get("user")!;
  const body = await c.req.json();
  
  const validated = CreateProfileRequestSchema.parse(body);

  // Check if profile already exists
  const existing = await c.env.DB.prepare(
    "SELECT * FROM user_profiles WHERE user_id = ?"
  ).bind(user.id).first();

  if (existing) {
    return c.json({ error: "Profile already exists" }, 400);
  }

  const result = await c.env.DB.prepare(
    `INSERT INTO user_profiles (user_id, role, full_name, phone_number, vehicle_type, vehicle_plate, vehicle_color)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      user.id,
      validated.role,
      validated.full_name,
      validated.phone_number,
      validated.vehicle_type || null,
      validated.vehicle_plate || null,
      validated.vehicle_color || null
    )
    .run();

  const profile = await c.env.DB.prepare(
    "SELECT * FROM user_profiles WHERE id = ?"
  ).bind(result.meta.last_row_id).first();

  return c.json(UserProfileSchema.parse(profile), 201);
});

app.get("/api/profiles/me", authMiddleware, async (c) => {
  const user = c.get("user")!;

  const profile = await c.env.DB.prepare(
    "SELECT * FROM user_profiles WHERE user_id = ?"
  ).bind(user.id).first();

  if (!profile) {
    return c.json({ error: "Profile not found" }, 404);
  }

  return c.json(UserProfileSchema.parse(profile));
});

app.put("/api/profiles/me", authMiddleware, async (c) => {
  const user = c.get("user")!;
  const body = await c.req.json();
  
  const validated = UpdateProfileRequestSchema.parse(body);

  const updates: string[] = [];
  const values: unknown[] = [];

  if (validated.full_name !== undefined) {
    updates.push("full_name = ?");
    values.push(validated.full_name);
  }
  if (validated.phone_number !== undefined) {
    updates.push("phone_number = ?");
    values.push(validated.phone_number);
  }
  if (validated.vehicle_type !== undefined) {
    updates.push("vehicle_type = ?");
    values.push(validated.vehicle_type);
  }
  if (validated.vehicle_plate !== undefined) {
    updates.push("vehicle_plate = ?");
    values.push(validated.vehicle_plate);
  }
  if (validated.vehicle_color !== undefined) {
    updates.push("vehicle_color = ?");
    values.push(validated.vehicle_color);
  }
  if (validated.is_available !== undefined) {
    updates.push("is_available = ?");
    values.push(validated.is_available);
  }
  if (validated.current_latitude !== undefined) {
    updates.push("current_latitude = ?");
    values.push(validated.current_latitude);
  }
  if (validated.current_longitude !== undefined) {
    updates.push("current_longitude = ?");
    values.push(validated.current_longitude);
  }

  updates.push("updated_at = CURRENT_TIMESTAMP");
  values.push(user.id);

  await c.env.DB.prepare(
    `UPDATE user_profiles SET ${updates.join(", ")} WHERE user_id = ?`
  ).bind(...values).run();

  const profile = await c.env.DB.prepare(
    "SELECT * FROM user_profiles WHERE user_id = ?"
  ).bind(user.id).first();

  return c.json(UserProfileSchema.parse(profile));
});

// Ride endpoints
app.post("/api/rides", authMiddleware, async (c) => {
  const user = c.get("user")!;
  const body = await c.req.json();
  
  const validated = CreateRideRequestSchema.parse(body);

  // Verify user is a rider
  const profile = await c.env.DB.prepare(
    "SELECT * FROM user_profiles WHERE user_id = ? AND role = 'rider'"
  ).bind(user.id).first();

  if (!profile) {
    return c.json({ error: "Only riders can request rides" }, 403);
  }

  const result = await c.env.DB.prepare(
    `INSERT INTO rides (
      rider_id, status, pickup_latitude, pickup_longitude, pickup_address,
      dropoff_latitude, dropoff_longitude, dropoff_address, rider_price,
      vehicle_type, scheduled_time, payment_method
    ) VALUES (?, 'requested', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      user.id,
      validated.pickup_latitude,
      validated.pickup_longitude,
      validated.pickup_address,
      validated.dropoff_latitude,
      validated.dropoff_longitude,
      validated.dropoff_address,
      validated.rider_price,
      validated.vehicle_type || 'motorcycle',
      validated.scheduled_time || null,
      validated.payment_method || 'cash'
    )
    .run();

  const ride = await c.env.DB.prepare(
    "SELECT * FROM rides WHERE id = ?"
  ).bind(result.meta.last_row_id).first();

  return c.json(RideSchema.parse(ride), 201);
});

app.get("/api/rides", authMiddleware, async (c) => {
  const user = c.get("user")!;

  const profile = await c.env.DB.prepare(
    "SELECT * FROM user_profiles WHERE user_id = ?"
  ).bind(user.id).first();

  if (!profile) {
    return c.json({ error: "Profile not found" }, 404);
  }

  let query;
  if ((profile as { role: string }).role === "rider") {
    query = c.env.DB.prepare(
      "SELECT * FROM rides WHERE rider_id = ? ORDER BY created_at DESC"
    ).bind(user.id);
  } else {
    query = c.env.DB.prepare(
      "SELECT * FROM rides WHERE driver_id = ? ORDER BY created_at DESC"
    ).bind(user.id);
  }

  const { results } = await query.all();

  return c.json(results.map(r => RideSchema.parse(r)));
});

app.get("/api/rides/available", authMiddleware, async (c) => {
  const user = c.get("user")!;

  // Verify user is a driver
  const profile = await c.env.DB.prepare(
    "SELECT * FROM user_profiles WHERE user_id = ? AND role = 'driver'"
  ).bind(user.id).first();

  if (!profile) {
    return c.json({ error: "Only drivers can view available rides" }, 403);
  }

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM rides WHERE status = 'requested' ORDER BY created_at ASC LIMIT 20"
  ).all();

  return c.json(results.map(r => RideSchema.parse(r)));
});

app.get("/api/rides/:id", authMiddleware, async (c) => {
  const user = c.get("user")!;
  const rideId = c.req.param("id");

  const ride = await c.env.DB.prepare(
    "SELECT * FROM rides WHERE id = ?"
  ).bind(rideId).first();

  if (!ride) {
    return c.json({ error: "Ride not found" }, 404);
  }

  const rideData = ride as { rider_id: string; driver_id: string | null };

  // Verify user is involved in this ride
  if (rideData.rider_id !== user.id && rideData.driver_id !== user.id) {
    return c.json({ error: "Unauthorized" }, 403);
  }

  return c.json(RideSchema.parse(ride));
});

app.post("/api/rides/:id/accept", authMiddleware, async (c) => {
  const user = c.get("user")!;
  const rideId = c.req.param("id");
  const body = await c.req.json();
  
  const validated = AcceptRideRequestSchema.parse(body);

  // Verify user is a driver
  const profile = await c.env.DB.prepare(
    "SELECT * FROM user_profiles WHERE user_id = ? AND role = 'driver'"
  ).bind(user.id).first();

  if (!profile) {
    return c.json({ error: "Only drivers can accept rides" }, 403);
  }

  const ride = await c.env.DB.prepare(
    "SELECT * FROM rides WHERE id = ? AND status = 'requested'"
  ).bind(rideId).first();

  if (!ride) {
    return c.json({ error: "Ride not found or already accepted" }, 404);
  }

  await c.env.DB.prepare(
    `UPDATE rides SET driver_id = ?, status = 'accepted', driver_price = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).bind(user.id, validated.driver_price, rideId).run();

  const updatedRide = await c.env.DB.prepare(
    "SELECT * FROM rides WHERE id = ?"
  ).bind(rideId).first();

  return c.json(RideSchema.parse(updatedRide));
});

app.post("/api/rides/:id/pickup", authMiddleware, async (c) => {
  const user = c.get("user")!;
  const rideId = c.req.param("id");

  const ride = await c.env.DB.prepare(
    "SELECT * FROM rides WHERE id = ? AND driver_id = ? AND status = 'accepted'"
  ).bind(rideId, user.id).first();

  if (!ride) {
    return c.json({ error: "Ride not found" }, 404);
  }

  await c.env.DB.prepare(
    `UPDATE rides SET status = 'picked_up', started_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).bind(rideId).run();

  const updatedRide = await c.env.DB.prepare(
    "SELECT * FROM rides WHERE id = ?"
  ).bind(rideId).first();

  return c.json(RideSchema.parse(updatedRide));
});

app.post("/api/rides/:id/complete", authMiddleware, async (c) => {
  const user = c.get("user")!;
  const rideId = c.req.param("id");

  const ride = await c.env.DB.prepare(
    "SELECT * FROM rides WHERE id = ? AND driver_id = ? AND status = 'picked_up'"
  ).bind(rideId, user.id).first();

  if (!ride) {
    return c.json({ error: "Ride not found" }, 404);
  }

  const rideData = ride as { driver_price: number | null; rider_price: number | null };
  const finalPrice = rideData.driver_price || rideData.rider_price || 0;

  await c.env.DB.prepare(
    `UPDATE rides SET status = 'completed', final_price = ?, completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).bind(finalPrice, rideId).run();

  // Update driver and rider ride counts
  const rideDataWithIds = ride as { rider_id: string; driver_id: string };
  await c.env.DB.prepare(
    "UPDATE user_profiles SET total_rides = total_rides + 1 WHERE user_id IN (?, ?)"
  ).bind(rideDataWithIds.rider_id, rideDataWithIds.driver_id).run();

  // Record driver earnings
  await c.env.DB.prepare(
    "INSERT INTO driver_earnings (driver_id, ride_id, amount, date) VALUES (?, ?, ?, DATE('now'))"
  ).bind(rideDataWithIds.driver_id, rideId, finalPrice).run();

  const updatedRide = await c.env.DB.prepare(
    "SELECT * FROM rides WHERE id = ?"
  ).bind(rideId).first();

  return c.json(RideSchema.parse(updatedRide));
});

app.post("/api/rides/:id/rate", authMiddleware, async (c) => {
  const user = c.get("user")!;
  const rideId = c.req.param("id");
  const body = await c.req.json();
  
  const validated = RateRideRequestSchema.parse(body);

  const ride = await c.env.DB.prepare(
    "SELECT * FROM rides WHERE id = ? AND status = 'completed'"
  ).bind(rideId).first();

  if (!ride) {
    return c.json({ error: "Ride not found or not completed" }, 404);
  }

  const rideData = ride as { rider_id: string; driver_id: string | null };

  // Determine if user is rating as rider or driver
  if (rideData.rider_id === user.id) {
    // Rider rating the driver
    await c.env.DB.prepare(
      `UPDATE rides SET driver_rating = ?, rider_feedback = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).bind(validated.rating, validated.feedback || null, rideId).run();

    // Update driver's average rating
    if (rideData.driver_id) {
      const { results } = await c.env.DB.prepare(
        "SELECT AVG(driver_rating) as avg_rating FROM rides WHERE driver_id = ? AND driver_rating IS NOT NULL"
      ).bind(rideData.driver_id).all();
      
      const avgRating = results[0] ? (results[0] as { avg_rating: number }).avg_rating : null;
      
      await c.env.DB.prepare(
        "UPDATE user_profiles SET rating = ? WHERE user_id = ?"
      ).bind(avgRating, rideData.driver_id).run();
    }
  } else if (rideData.driver_id === user.id) {
    // Driver rating the rider
    await c.env.DB.prepare(
      `UPDATE rides SET rider_rating = ?, driver_feedback = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).bind(validated.rating, validated.feedback || null, rideId).run();

    // Update rider's average rating
    const { results } = await c.env.DB.prepare(
      "SELECT AVG(rider_rating) as avg_rating FROM rides WHERE rider_id = ? AND rider_rating IS NOT NULL"
    ).bind(rideData.rider_id).all();
    
    const avgRating = results[0] ? (results[0] as { avg_rating: number }).avg_rating : null;
    
    await c.env.DB.prepare(
      "UPDATE user_profiles SET rating = ? WHERE user_id = ?"
    ).bind(avgRating, rideData.rider_id).run();
  } else {
    return c.json({ error: "Unauthorized" }, 403);
  }

  const updatedRide = await c.env.DB.prepare(
    "SELECT * FROM rides WHERE id = ?"
  ).bind(rideId).first();

  return c.json(RideSchema.parse(updatedRide));
});

app.post("/api/rides/:id/cancel", authMiddleware, async (c) => {
  const user = c.get("user")!;
  const rideId = c.req.param("id");

  const ride = await c.env.DB.prepare(
    "SELECT * FROM rides WHERE id = ?"
  ).bind(rideId).first();

  if (!ride) {
    return c.json({ error: "Ride not found" }, 404);
  }

  const rideData = ride as { rider_id: string; driver_id: string | null; status: string };

  // Verify user is involved in this ride
  if (rideData.rider_id !== user.id && rideData.driver_id !== user.id) {
    return c.json({ error: "Unauthorized" }, 403);
  }

  if (rideData.status === "completed" || rideData.status === "cancelled") {
    return c.json({ error: "Cannot cancel completed or already cancelled ride" }, 400);
  }

  await c.env.DB.prepare(
    `UPDATE rides SET status = 'cancelled', cancelled_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).bind(rideId).run();

  const updatedRide = await c.env.DB.prepare(
    "SELECT * FROM rides WHERE id = ?"
  ).bind(rideId).first();

  return c.json(RideSchema.parse(updatedRide));
});

// Message endpoints
app.get("/api/rides/:id/messages", authMiddleware, async (c) => {
  const user = c.get("user")!;
  const rideId = c.req.param("id");

  const ride = await c.env.DB.prepare(
    "SELECT * FROM rides WHERE id = ?"
  ).bind(rideId).first();

  if (!ride) {
    return c.json({ error: "Ride not found" }, 404);
  }

  const rideData = ride as { rider_id: string; driver_id: string | null };

  // Verify user is involved in this ride
  if (rideData.rider_id !== user.id && rideData.driver_id !== user.id) {
    return c.json({ error: "Unauthorized" }, 403);
  }

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM ride_messages WHERE ride_id = ? ORDER BY created_at ASC"
  ).bind(rideId).all();

  return c.json(results.map(m => RideMessageSchema.parse(m)));
});

app.post("/api/rides/:id/messages", authMiddleware, async (c) => {
  const user = c.get("user")!;
  const rideId = c.req.param("id");
  const body = await c.req.json();
  
  const validated = SendMessageRequestSchema.parse(body);

  const ride = await c.env.DB.prepare(
    "SELECT * FROM rides WHERE id = ?"
  ).bind(rideId).first();

  if (!ride) {
    return c.json({ error: "Ride not found" }, 404);
  }

  const rideData = ride as { rider_id: string; driver_id: string | null };

  // Verify user is involved in this ride
  if (rideData.rider_id !== user.id && rideData.driver_id !== user.id) {
    return c.json({ error: "Unauthorized" }, 403);
  }

  const result = await c.env.DB.prepare(
    "INSERT INTO ride_messages (ride_id, sender_id, message) VALUES (?, ?, ?)"
  ).bind(rideId, user.id, validated.message).run();

  const message = await c.env.DB.prepare(
    "SELECT * FROM ride_messages WHERE id = ?"
  ).bind(result.meta.last_row_id).first();

  return c.json(RideMessageSchema.parse(message), 201);
});

// Favorite Locations endpoints
app.get("/api/favorite-locations", authMiddleware, async (c) => {
  const user = c.get("user")!;

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM favorite_locations WHERE user_id = ? ORDER BY created_at DESC"
  ).bind(user.id).all();

  return c.json(results.map(loc => FavoriteLocationSchema.parse(loc)));
});

app.post("/api/favorite-locations", authMiddleware, async (c) => {
  const user = c.get("user")!;
  const body = await c.req.json();
  
  const validated = CreateFavoriteLocationRequestSchema.parse(body);

  const result = await c.env.DB.prepare(
    "INSERT INTO favorite_locations (user_id, name, address, latitude, longitude) VALUES (?, ?, ?, ?, ?)"
  ).bind(user.id, validated.name, validated.address, validated.latitude, validated.longitude).run();

  const location = await c.env.DB.prepare(
    "SELECT * FROM favorite_locations WHERE id = ?"
  ).bind(result.meta.last_row_id).first();

  return c.json(FavoriteLocationSchema.parse(location), 201);
});

app.delete("/api/favorite-locations/:id", authMiddleware, async (c) => {
  const user = c.get("user")!;
  const locationId = c.req.param("id");

  const location = await c.env.DB.prepare(
    "SELECT * FROM favorite_locations WHERE id = ? AND user_id = ?"
  ).bind(locationId, user.id).first();

  if (!location) {
    return c.json({ error: "Location not found" }, 404);
  }

  await c.env.DB.prepare(
    "DELETE FROM favorite_locations WHERE id = ?"
  ).bind(locationId).run();

  return c.json({ success: true });
});

// Earnings endpoint
app.get("/api/earnings", authMiddleware, async (c) => {
  const user = c.get("user")!;

  // Verify user is a driver
  const profile = await c.env.DB.prepare(
    "SELECT * FROM user_profiles WHERE user_id = ? AND role = 'driver'"
  ).bind(user.id).first();

  if (!profile) {
    return c.json({ error: "Only drivers can view earnings" }, 403);
  }

  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const todayResult = await c.env.DB.prepare(
    "SELECT COALESCE(SUM(amount), 0) as total FROM driver_earnings WHERE driver_id = ? AND date = ?"
  ).bind(user.id, today).first();

  const weekResult = await c.env.DB.prepare(
    "SELECT COALESCE(SUM(amount), 0) as total FROM driver_earnings WHERE driver_id = ? AND date >= ?"
  ).bind(user.id, weekAgo).first();

  const monthResult = await c.env.DB.prepare(
    "SELECT COALESCE(SUM(amount), 0) as total FROM driver_earnings WHERE driver_id = ? AND date >= ?"
  ).bind(user.id, monthAgo).first();

  return c.json({
    today: (todayResult as { total: number }).total || 0,
    week: (weekResult as { total: number }).total || 0,
    month: (monthResult as { total: number }).total || 0,
    totalRides: (profile as { total_rides: number }).total_rides || 0,
  });
});

// Driver location endpoint
app.get("/api/rides/:id/driver-location", authMiddleware, async (c) => {
  const user = c.get("user")!;
  const rideId = c.req.param("id");

  const ride = await c.env.DB.prepare(
    "SELECT * FROM rides WHERE id = ?"
  ).bind(rideId).first();

  if (!ride) {
    return c.json({ error: "Ride not found" }, 404);
  }

  const rideData = ride as { rider_id: string; driver_id: string | null };

  // Verify user is involved in this ride
  if (rideData.rider_id !== user.id && rideData.driver_id !== user.id) {
    return c.json({ error: "Unauthorized" }, 403);
  }

  if (!rideData.driver_id) {
    return c.json({ error: "No driver assigned yet" }, 404);
  }

  // Get driver's current location
  const driver = await c.env.DB.prepare(
    "SELECT current_latitude, current_longitude FROM user_profiles WHERE user_id = ?"
  ).bind(rideData.driver_id).first();

  if (!driver) {
    return c.json({ error: "Driver not found" }, 404);
  }

  const driverProfile = driver as { current_latitude: number | null; current_longitude: number | null };

  if (!driverProfile.current_latitude || !driverProfile.current_longitude) {
    return c.json({ error: "Driver location not available" }, 404);
  }

  return c.json({
    latitude: driverProfile.current_latitude,
    longitude: driverProfile.current_longitude,
  });
});

// Wallet endpoints
app.get("/api/wallet", authMiddleware, async (c) => {
  const user = c.get("user")!;

  let wallet = await c.env.DB.prepare(
    "SELECT * FROM wallets WHERE user_id = ?"
  ).bind(user.id).first();

  if (!wallet) {
    // Create wallet if it doesn't exist
    const result = await c.env.DB.prepare(
      "INSERT INTO wallets (user_id, balance) VALUES (?, 0)"
    ).bind(user.id).run();

    wallet = await c.env.DB.prepare(
      "SELECT * FROM wallets WHERE id = ?"
    ).bind(result.meta.last_row_id).first();
  }

  return c.json(wallet);
});

app.get("/api/wallet/transactions", authMiddleware, async (c) => {
  const user = c.get("user")!;

  const wallet = await c.env.DB.prepare(
    "SELECT * FROM wallets WHERE user_id = ?"
  ).bind(user.id).first();

  if (!wallet) {
    return c.json([]);
  }

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM wallet_transactions WHERE wallet_id = ? ORDER BY created_at DESC LIMIT 50"
  ).bind((wallet as { id: number }).id).all();

  return c.json(results);
});

app.post("/api/wallet/add-funds", authMiddleware, async (c) => {
  const user = c.get("user")!;
  const body = await c.req.json();
  const amount = parseFloat(body.amount);

  if (isNaN(amount) || amount <= 0) {
    return c.json({ error: "Invalid amount" }, 400);
  }

  let wallet = await c.env.DB.prepare(
    "SELECT * FROM wallets WHERE user_id = ?"
  ).bind(user.id).first();

  if (!wallet) {
    const result = await c.env.DB.prepare(
      "INSERT INTO wallets (user_id, balance) VALUES (?, 0)"
    ).bind(user.id).run();

    wallet = await c.env.DB.prepare(
      "SELECT * FROM wallets WHERE id = ?"
    ).bind(result.meta.last_row_id).first();
  }

  const walletData = wallet as { id: number; balance: number };

  // Update wallet balance
  await c.env.DB.prepare(
    "UPDATE wallets SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).bind(amount, walletData.id).run();

  // Record transaction
  await c.env.DB.prepare(
    "INSERT INTO wallet_transactions (wallet_id, amount, transaction_type, description) VALUES (?, ?, 'credit', 'Funds added to wallet')"
  ).bind(walletData.id, amount).run();

  const updatedWallet = await c.env.DB.prepare(
    "SELECT * FROM wallets WHERE id = ?"
  ).bind(walletData.id).first();

  return c.json(updatedWallet);
});

// Payment processing endpoint
app.post("/api/rides/:id/payment", authMiddleware, async (c) => {
  const user = c.get("user")!;
  const rideId = c.req.param("id");
  const body = await c.req.json();
  
  const validated = ProcessPaymentRequestSchema.parse(body);

  const ride = await c.env.DB.prepare(
    "SELECT * FROM rides WHERE id = ? AND status = 'completed'"
  ).bind(rideId).first();

  if (!ride) {
    return c.json({ error: "Ride not found or not completed" }, 404);
  }

  const rideData = ride as { rider_id: string; final_price: number | null };

  // Verify user is the rider
  if (rideData.rider_id !== user.id) {
    return c.json({ error: "Only the rider can make payment" }, 403);
  }

  if (!rideData.final_price) {
    return c.json({ error: "No final price set for this ride" }, 400);
  }

  // Handle wallet payment
  if (validated.provider === "wallet") {
    const wallet = await c.env.DB.prepare(
      "SELECT * FROM wallets WHERE user_id = ?"
    ).bind(user.id).first();

    if (!wallet) {
      return c.json({ error: "Wallet not found" }, 404);
    }

    const walletData = wallet as { id: number; balance: number };

    if (walletData.balance < validated.amount) {
      return c.json({ error: "Insufficient wallet balance" }, 400);
    }

    // Deduct from rider's wallet
    await c.env.DB.prepare(
      "UPDATE wallets SET balance = balance - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).bind(validated.amount, walletData.id).run();

    // Record debit transaction for rider
    await c.env.DB.prepare(
      "INSERT INTO wallet_transactions (wallet_id, amount, transaction_type, description, ride_id) VALUES (?, ?, 'ride_payment', 'Payment for ride', ?)"
    ).bind(walletData.id, validated.amount, rideId).run();

    // Get driver's wallet and credit it
    const driverWallet = await c.env.DB.prepare(
      "SELECT w.* FROM wallets w JOIN rides r ON r.driver_id = w.user_id WHERE r.id = ?"
    ).bind(rideId).first();

    if (driverWallet) {
      const driverWalletData = driverWallet as { id: number };
      await c.env.DB.prepare(
        "UPDATE wallets SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
      ).bind(validated.amount, driverWalletData.id).run();

      // Record credit transaction for driver
      await c.env.DB.prepare(
        "INSERT INTO wallet_transactions (wallet_id, amount, transaction_type, description, ride_id) VALUES (?, ?, 'ride_earning', 'Earnings from ride', ?)"
      ).bind(driverWalletData.id, validated.amount, rideId).run();
    }

    // Create payment transaction record
    const result = await c.env.DB.prepare(
      `INSERT INTO payment_transactions (ride_id, user_id, provider, amount, phone_number, status, transaction_id)
       VALUES (?, ?, 'wallet', ?, '', 'completed', ?)`
    ).bind(rideId, user.id, validated.amount, `WALLET-${Date.now()}`).run();

    const transaction = await c.env.DB.prepare(
      "SELECT * FROM payment_transactions WHERE id = ?"
    ).bind(result.meta.last_row_id).first();

    return c.json({
      success: true,
      transaction: PaymentTransactionSchema.parse(transaction),
      message: "Payment completed successfully via digital wallet"
    }, 200);
  }

  // Create payment transaction record for mobile money
  const result = await c.env.DB.prepare(
    `INSERT INTO payment_transactions (ride_id, user_id, provider, amount, phone_number, status)
     VALUES (?, ?, ?, ?, ?, 'pending')`
  ).bind(rideId, user.id, validated.provider, validated.amount, validated.phone_number || "").run();

  const transactionId = result.meta.last_row_id;

  /*
   * PAYMENT INTEGRATION POINT
   * 
   * This is where you would integrate with actual payment APIs:
   * 
   * For Airtel Money:
   * - API: https://developers.airtel.africa/documentation
   * - Use c.env.AIRTEL_MONEY_API_KEY and c.env.AIRTEL_MONEY_CLIENT_ID
   * 
   * For MTN Mobile Money:
   * - API: https://momodeveloper.mtn.com/
   * - Use c.env.MTN_MOMO_API_KEY and c.env.MTN_MOMO_USER_ID
   * 
   * For Zamtel Kwacha:
   * - API: Contact Zamtel for API documentation
   * - Use c.env.ZAMTEL_API_KEY and c.env.ZAMTEL_MERCHANT_ID
   * 
   * Example integration pattern:
   * 
   * try {
   *   let paymentResponse;
   *   
   *   switch (validated.provider) {
   *     case 'airtel':
   *       paymentResponse = await fetch('https://openapi.airtel.africa/merchant/v1/payments/', {
   *         method: 'POST',
   *         headers: {
   *           'Authorization': `Bearer ${c.env.AIRTEL_MONEY_API_KEY}`,
   *           'Content-Type': 'application/json'
   *         },
   *         body: JSON.stringify({
   *           reference: `RIDE-${rideId}-${transactionId}`,
   *           subscriber: { msisdn: validated.phone_number },
   *           transaction: {
   *             amount: validated.amount,
   *             currency: 'ZMW',
   *             id: transactionId.toString()
   *           }
   *         })
   *       });
   *       break;
   *     
   *     case 'mtn':
   *       // Similar pattern for MTN
   *       break;
   *     
   *     case 'zamtel':
   *       // Similar pattern for Zamtel
   *       break;
   *   }
   *   
   *   const responseData = await paymentResponse.json();
   *   
   *   // Update transaction with API response
   *   await c.env.DB.prepare(
   *     `UPDATE payment_transactions 
   *      SET transaction_id = ?, status = ?, response_data = ?, updated_at = CURRENT_TIMESTAMP 
   *      WHERE id = ?`
   *   ).bind(
   *     responseData.transaction_id,
   *     responseData.status === 'SUCCESS' ? 'completed' : 'failed',
   *     JSON.stringify(responseData),
   *     transactionId
   *   ).run();
   * 
   * } catch (error) {
   *   // Update transaction as failed
   *   await c.env.DB.prepare(
   *     `UPDATE payment_transactions 
   *      SET status = 'failed', response_data = ?, updated_at = CURRENT_TIMESTAMP 
   *      WHERE id = ?`
   *   ).bind(JSON.stringify({ error: error.message }), transactionId).run();
   *   
   *   return c.json({ error: 'Payment processing failed' }, 500);
   * }
   */

  // For now, simulate successful payment
  await c.env.DB.prepare(
    `UPDATE payment_transactions 
     SET status = 'completed', transaction_id = ?, updated_at = CURRENT_TIMESTAMP 
     WHERE id = ?`
  ).bind(`SIM-${Date.now()}`, transactionId).run();

  const transaction = await c.env.DB.prepare(
    "SELECT * FROM payment_transactions WHERE id = ?"
  ).bind(transactionId).first();

  return c.json({
    success: true,
    transaction: PaymentTransactionSchema.parse(transaction),
    message: "Payment processed successfully. In production, this would integrate with the actual payment provider API."
  }, 200);
});

export default app;
