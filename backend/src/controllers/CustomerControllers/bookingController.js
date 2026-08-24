import pool from "../../config/db.js";

// =====================================================
// HELPER - CALCULATE NUMBER OF NIGHTS
// =====================================================

const calculateNights = (checkIn, checkOut) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);

  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const difference =
    end.getTime() - start.getTime();

  const nights = Math.ceil(
    difference / (1000 * 60 * 60 * 24)
  );

  return nights > 0 ? nights : 0;
};


// =====================================================
// CREATE CUSTOMER BOOKING
// POST /api/customer-bookings
// =====================================================

export const createCustomerBooking = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      customerId,
      roomId,
      checkIn,
      checkOut,
      adults,
      children,
      paymentMethod,
      specialRequest,
      services,
    } = req.body;

    // =================================================
    // VALIDATION
    // =================================================

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: "Customer ID is required.",
      });
    }

    if (!roomId) {
      return res.status(400).json({
        success: false,
        message: "Room ID is required.",
      });
    }

    if (!checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message:
          "Check-in and check-out dates are required.",
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Payment method is required.",
      });
    }

    // =================================================
    // CALCULATE NIGHTS
    // =================================================

    const nights = calculateNights(
      checkIn,
      checkOut
    );

    if (nights <= 0) {
      return res.status(400).json({
        success: false,
        message:
          "Check-out date must be after check-in date.",
      });
    }

    // =================================================
    // START TRANSACTION
    // =================================================

    await client.query("BEGIN");

    // =================================================
    // CHECK CUSTOMER
    // =================================================

    const customerResult = await client.query(
      `
      SELECT
        id,
        full_name,
        email,
        phone
      FROM customers
      WHERE id = $1
      `,
      [customerId]
    );

    if (customerResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    const customer = customerResult.rows[0];

    // =================================================
    // CHECK ROOM
    // =================================================

    const roomResult = await client.query(
      `
      SELECT
        id,
        room_number,
        room_type,
        price_per_night,
        status
      FROM rooms
      WHERE id = $1
      FOR UPDATE
      `,
      [roomId]
    );

    if (roomResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        success: false,
        message: "Room not found.",
      });
    }

    const room = roomResult.rows[0];

    // =================================================
    // CHECK ROOM STATUS
    // =================================================

    const roomStatus =
      String(room.status || "")
        .toLowerCase()
        .trim();

    if (roomStatus !== "available") {
      await client.query("ROLLBACK");

      return res.status(409).json({
        success: false,
        message:
          "This room is currently not available.",
      });
    }

    // =================================================
    // ROOM PRICE
    // =================================================

    const roomPricePerNight =
      Number(room.price_per_night) || 0;

    if (roomPricePerNight <= 0) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message:
          "Room price is invalid or missing.",
      });
    }

    // =================================================
    // CHECK ROOM AVAILABILITY
    // =================================================

    const availabilityResult =
      await client.query(
        `
        SELECT
          id
        FROM bookings
        WHERE room_id = $1

          AND LOWER(
            COALESCE(
              booking_status,
              ''
            )
          ) NOT IN (
            'cancelled',
            'checked_out',
            'rejected'
          )

          AND check_in < $3
          AND check_out > $2
        `,
        [
          roomId,
          checkIn,
          checkOut,
        ]
      );

    if (availabilityResult.rows.length > 0) {
      await client.query("ROLLBACK");

      return res.status(409).json({
        success: false,
        message:
          "This room is already booked for the selected dates.",
      });
    }

    // =================================================
    // CALCULATE ROOM TOTAL
    // =================================================

    const roomTotal =
      roomPricePerNight * nights;

    // =================================================
    // CALCULATE SERVICE TOTAL
    // =================================================

    let serviceTotal = 0;

    const selectedServices = [];

    if (
      Array.isArray(services) &&
      services.length > 0
    ) {
      for (const service of services) {
        const serviceId =
          service.service_id ||
          service.id;

        const quantity =
          Number(service.quantity) || 1;

        // ---------------------------------------------
        // SKIP INVALID SERVICE
        // ---------------------------------------------

        if (!serviceId) {
          continue;
        }

        if (quantity <= 0) {
          continue;
        }

        // ---------------------------------------------
        // GET SERVICE
        // ---------------------------------------------

        const serviceResult =
          await client.query(
            `
            SELECT
              id,
              service_name,
              price,
              status
            FROM services
            WHERE id = $1
            `,
            [serviceId]
          );

        if (serviceResult.rows.length === 0) {
          await client.query("ROLLBACK");

          return res.status(404).json({
            success: false,
            message:
              `Service with ID ${serviceId} not found.`,
          });
        }

        const serviceData =
          serviceResult.rows[0];

        // ---------------------------------------------
        // SERVICE PRICE
        // ---------------------------------------------

        const servicePrice =
          Number(serviceData.price) || 0;

        const serviceAmount =
          servicePrice * quantity;

        serviceTotal += serviceAmount;

        // ---------------------------------------------
        // SAVE SERVICE
        // ---------------------------------------------

        selectedServices.push({
          service_id: serviceData.id,
          service_name:
            serviceData.service_name,
          price: servicePrice,
          quantity: quantity,
          total: serviceAmount,
        });
      }
    }

    // =================================================
    // FINAL BOOKING TOTAL
    // =================================================

    const totalAmount =
      roomTotal + serviceTotal;

    if (totalAmount <= 0) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        success: false,
        message:
          "Booking total amount must be greater than zero.",
      });
    }

    // =================================================
    // NORMALIZE PAYMENT METHOD
    // =================================================

    const normalizedPaymentMethod =
      String(paymentMethod).trim();

    // =================================================
    // CREATE BOOKING
    //
    // New booking starts as CONFIRMED.
    // =================================================

    const bookingResult =
      await client.query(
        `
        INSERT INTO bookings (
          customer_id,
          room_id,
          check_in,
          check_out,
          adults,
          children,
          total_amount,
          booking_status,
          payment_status,
          special_request,
          created_at
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          'confirmed',
          'paid',
          $8,
          CURRENT_TIMESTAMP
        )
        RETURNING *
        `,
        [
          customerId,
          roomId,
          checkIn,
          checkOut,
          Number(adults) || 1,
          Number(children) || 0,
          totalAmount,
          specialRequest || null,
        ]
      );

    const booking =
      bookingResult.rows[0];

    // =================================================
    // CREATE COMPLETED ROOM PAYMENT
    // =================================================

    const paymentResult =
      await client.query(
        `
        INSERT INTO payments (
          booking_id,
          amount,
          payment_method,
          payment_status,
          paid_at
        )
        VALUES (
          $1,
          $2,
          $3,
          'completed',
          NOW()
        )
        RETURNING *
        `,
        [
          booking.id,
          roomTotal,
          normalizedPaymentMethod,
        ]
      );

    const payment =
      paymentResult.rows[0];

    // =================================================
    // INSERT BOOKING SERVICES
    // =================================================

    for (const service of selectedServices) {
      await client.query(
        `
        INSERT INTO booking_services (
          booking_id,
          service_id,
          quantity
        )
        VALUES (
          $1,
          $2,
          $3
        )
        `,
        [
          booking.id,
          service.service_id,
          service.quantity,
        ]
      );
    }

    // =================================================
    // UPDATE ROOM
    // =================================================

    await client.query(
      `
      UPDATE rooms
      SET status = 'Occupied'
      WHERE id = $1
      `,
      [roomId]
    );

    // =================================================
    // COMMIT
    // =================================================

    await client.query("COMMIT");

    // =================================================
    // INVOICE NUMBER
    // =================================================

    const invoiceNumber =
      `INV${String(payment.id).padStart(4, "0")}`;

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(201).json({
      success: true,

      message:
        "Booking confirmed and room payment completed successfully.",

      customer,

      booking,

      payment: {
        ...payment,

        amount:
          Number(payment.amount),

        invoice_number:
          invoiceNumber,
      },

      calculation: {
        nights,

        roomPricePerNight,

        roomTotal,

        serviceTotal,

        totalAmount,

        paidNow:
          roomTotal,

        pendingServices:
          serviceTotal,
      },

      services:
        selectedServices,
    });

  } catch (error) {

    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error(
        "Rollback error:",
        rollbackError
      );
    }

    console.error(
      "Create customer booking error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to create customer booking.",

      error:
        error.message,
    });

  } finally {
    client.release();
  }
};


// =====================================================
// GET CUSTOMER BOOKINGS
// GET /api/customer-bookings/:customerId
// =====================================================

export const getCustomerBookings = async (
  req,
  res
) => {

  try {

    const {
      customerId,
    } = req.params;

    // =================================================
    // CHECK CUSTOMER
    // =================================================

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message:
          "Customer ID is required.",
      });
    }

    const customerResult =
      await pool.query(
        `
        SELECT
          id,
          full_name,
          email,
          phone
        FROM customers
        WHERE id = $1
        `,
        [customerId]
      );

    if (customerResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Customer not found.",
      });
    }

    // =================================================
    // GET BOOKINGS
    // =================================================

    const bookingsResult =
      await pool.query(
        `
        SELECT

          b.id,
          b.customer_id,
          b.room_id,

          b.check_in,
          b.check_out,

          b.adults,
          b.children,

          b.total_amount,

          b.booking_status,
          b.payment_status,

          b.special_request,
          b.created_at,

          r.room_number,
          r.room_type,
          r.price_per_night

        FROM bookings b

        LEFT JOIN rooms r
          ON r.id = b.room_id

        WHERE b.customer_id = $1

        ORDER BY
          b.created_at DESC
        `,
        [customerId]
      );

    const bookings =
      bookingsResult.rows.map(
        (booking) => ({
          ...booking,

          total_amount:
            Number(
              booking.total_amount
            ) || 0,

          price_per_night:
            Number(
              booking.price_per_night
            ) || 0,
        })
      );

    // =================================================
    // STATISTICS
    // =================================================

    const totalBookings =
      bookings.length;

    // =================================================
    // UPCOMING
    //
    // ONLY CONFIRMED BOOKINGS
    //
    // A booking appears in Upcoming ONLY when:
    //
    // 1. booking_status = confirmed
    // 2. check-in date is today or future
    //
    // checked_in      -> NOT upcoming
    // checked_out     -> NOT upcoming
    // cancelled       -> NOT upcoming
    // rejected        -> NOT upcoming
    // =================================================

    const upcoming =
      bookings.filter(
        (booking) => {

          const status =
            String(
              booking.booking_status || ""
            )
              .toLowerCase()
              .trim();

          // ONLY CONFIRMED
          if (status !== "confirmed") {
            return false;
          }

          if (!booking.check_in) {
            return false;
          }

          const today =
            new Date();

          today.setHours(
            0,
            0,
            0,
            0
          );

          const checkIn =
            new Date(
              booking.check_in
            );

          checkIn.setHours(
            0,
            0,
            0,
            0
          );

          return checkIn >= today;
        }
      ).length;

    // =================================================
    // COMPLETED
    // =================================================

    const completed =
      bookings.filter(
        (booking) => {

          const status =
            String(
              booking.booking_status || ""
            )
              .toLowerCase()
              .trim();

          return (
            status === "checked_out" ||
            status === "completed"
          );
        }
      ).length;

    // =================================================
    // CANCELLED
    // =================================================

    const cancelled =
      bookings.filter(
        (booking) => {

          const status =
            String(
              booking.booking_status || ""
            )
              .toLowerCase()
              .trim();

          return status === "cancelled";
        }
      ).length;

    // =================================================
    // CONFIRMED
    // =================================================

    const confirmed =
      bookings.filter(
        (booking) => {

          const status =
            String(
              booking.booking_status || ""
            )
              .toLowerCase()
              .trim();

          return status === "confirmed";
        }
      ).length;

    // =================================================
    // CHECKED IN
    // =================================================

    const checkedIn =
      bookings.filter(
        (booking) => {

          const status =
            String(
              booking.booking_status || ""
            )
              .toLowerCase()
              .trim();

          return status === "checked_in";
        }
      ).length;

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(200).json({

      success: true,

      customer:
        customerResult.rows[0],

      bookings,

      statistics: {

        totalBookings,

        upcoming,

        completed,

        cancelled,

        confirmed,

        checkedIn,

      },

    });

  } catch (error) {

    console.error(
      "Get customer bookings error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Failed to load customer bookings.",

      error:
        error.message,

    });

  }

};


// =====================================================
// GET SINGLE CUSTOMER BOOKING DETAILS
// GET /api/customer-bookings/:customerId/:bookingId
// =====================================================

export const getCustomerBookingDetails = async (
  req,
  res
) => {

  try {

    const {
      customerId,
      bookingId,
    } = req.params;

    // =================================================
    // VALIDATION
    // =================================================

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message:
          "Customer ID is required.",
      });
    }

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message:
          "Booking ID is required.",
      });
    }

    // =================================================
    // GET BOOKING
    // =================================================

    const bookingResult =
      await pool.query(
        `
        SELECT

          b.id,
          b.customer_id,
          b.room_id,

          b.check_in,
          b.check_out,

          b.adults,
          b.children,

          b.total_amount,

          b.booking_status,
          b.payment_status,

          b.special_request,
          b.created_at,

          r.room_number,
          r.room_type,
          r.price_per_night,

          c.full_name AS customer_name,
          c.email AS customer_email,
          c.phone AS customer_phone,

          p.payment_method,
          p.payment_status AS latest_payment_status,
          p.amount AS payment_amount,
          p.paid_at,
          p.id AS payment_id

        FROM bookings b

        LEFT JOIN rooms r
          ON r.id = b.room_id

        LEFT JOIN customers c
          ON c.id = b.customer_id

        LEFT JOIN LATERAL (
          SELECT

            id,
            payment_method,
            payment_status,
            amount,
            paid_at

          FROM payments

          WHERE booking_id = b.id

          ORDER BY id DESC

          LIMIT 1

        ) p ON TRUE

        WHERE b.id = $1
          AND b.customer_id = $2

        LIMIT 1
        `,
        [
          bookingId,
          customerId,
        ]
      );

    // =================================================
    // NOT FOUND
    // =================================================

    if (bookingResult.rows.length === 0) {

      return res.status(404).json({
        success: false,
        message:
          "Booking not found for this customer.",
      });

    }

    const booking =
      bookingResult.rows[0];

    // =================================================
    // USE LATEST PAYMENT STATUS
    // =================================================

    if (
      booking.latest_payment_status
    ) {

      booking.payment_status =
        booking.latest_payment_status;

    }

    // =================================================
    // GET SERVICES
    // =================================================

    const servicesResult =
      await pool.query(
        `
        SELECT

          bs.id,
          bs.booking_id,
          bs.service_id,
          bs.quantity,
          bs.requested_at,

          s.service_name,
          s.price,
          s.description,
          s.category,
          s.availability,
          s.status

        FROM booking_services bs

        LEFT JOIN services s
          ON s.id = bs.service_id

        WHERE bs.booking_id = $1

        ORDER BY
          bs.id ASC
        `,
        [bookingId]
      );

    // =================================================
    // SERVICE DATA
    // =================================================

    booking.services =
      servicesResult.rows.map(
        (service) => ({

          ...service,

          price:
            Number(
              service.price
            ) || 0,

          quantity:
            Number(
              service.quantity
            ) || 0,

          total:
            (
              Number(
                service.price
              ) || 0
            ) *
            (
              Number(
                service.quantity
              ) || 0
            ),

        })
      );

    // =================================================
    // SERVICE TOTAL
    // =================================================

    booking.service_total =
      booking.services.reduce(
        (total, service) =>
          total +
          Number(
            service.total || 0
          ),
        0
      );

    // =================================================
    // ROOM TOTAL
    // =================================================

    const roomTotal =
      Number(
        booking.total_amount || 0
      ) -
      Number(
        booking.service_total || 0
      );

    booking.room_total =
      roomTotal > 0
        ? roomTotal
        : 0;

    // =================================================
    // PAYMENT INFORMATION
    // =================================================

    if (booking.payment_id) {

      booking.payment = {

        id:
          booking.payment_id,

        amount:
          Number(
            booking.payment_amount || 0
          ),

        payment_method:
          booking.payment_method,

        payment_status:
          booking.latest_payment_status,

        paid_at:
          booking.paid_at,

        invoice_number:
          `INV${String(
            booking.payment_id
          ).padStart(4, "0")}`,

      };

    } else {

      booking.payment = null;

    }

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(200).json({

      success: true,

      message:
        "Booking details loaded successfully.",

      booking,

    });

  } catch (error) {

    console.error(
      "Get customer booking details error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Failed to load booking details.",

      error:
        error.message,

    });

  }

};


// =====================================================
// CANCEL CUSTOMER BOOKING
//
// PUT /api/customer-bookings/:customerId/:bookingId/cancel
//
// CUSTOMER CAN CANCEL ONLY:
//
// confirmed -> YES
//
// checked_in  -> NO
// checked_out -> NO
// cancelled   -> NO
// rejected    -> NO
// any other   -> NO
// =====================================================

export const cancelCustomerBooking = async (
  req,
  res
) => {

  const client =
    await pool.connect();

  try {

    const {
      customerId,
      bookingId,
    } = req.params;

    // =================================================
    // VALIDATION
    // =================================================

    if (!customerId) {

      return res.status(400).json({
        success: false,
        message:
          "Customer ID is required.",
      });

    }

    if (!bookingId) {

      return res.status(400).json({
        success: false,
        message:
          "Booking ID is required.",
      });

    }

    // =================================================
    // START TRANSACTION
    // =================================================

    await client.query("BEGIN");

    // =================================================
    // GET BOOKING
    //
    // FOR UPDATE prevents two requests from
    // cancelling the same booking at the same time.
    // =================================================

    const bookingResult =
      await client.query(
        `
        SELECT

          b.*,

          r.room_number

        FROM bookings b

        LEFT JOIN rooms r
          ON r.id = b.room_id

        WHERE b.id = $1
          AND b.customer_id = $2

        FOR UPDATE
        `,
        [
          bookingId,
          customerId,
        ]
      );

    // =================================================
    // BOOKING NOT FOUND
    // =================================================

    if (
      bookingResult.rows.length === 0
    ) {

      await client.query(
        "ROLLBACK"
      );

      return res.status(404).json({

        success: false,

        message:
          "Booking not found for this customer.",

      });

    }

    const booking =
      bookingResult.rows[0];

    // =================================================
    // NORMALIZE STATUS
    // =================================================

    const status =
      String(
        booking.booking_status || ""
      )
        .toLowerCase()
        .trim();

    // =================================================
    // ONLY CONFIRMED CAN BE CANCELLED
    // =================================================

    if (status !== "confirmed") {

      await client.query(
        "ROLLBACK"
      );

      let displayStatus =
        status || "unknown";

      // Remove underscore only for display
      displayStatus =
        displayStatus.replace(
          /_/g,
          " "
        );

      return res.status(400).json({

        success: false,

        message:
          `This reservation cannot be cancelled because it is ${displayStatus}.`,

      });

    }

    // =================================================
    // CHECK CHECKOUT DATE
    // =================================================

    if (!booking.check_out) {

      await client.query(
        "ROLLBACK"
      );

      return res.status(400).json({

        success: false,

        message:
          "Checkout date is missing.",

      });

    }

    // =================================================
    // TODAY
    // =================================================

    const today =
      new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );

    // =================================================
    // CHECKOUT DATE
    // =================================================

    const checkoutDate =
      new Date(
        booking.check_out
      );

    checkoutDate.setHours(
      0,
      0,
      0,
      0
    );

    // =================================================
    // CANNOT CANCEL ON/AFTER CHECKOUT DATE
    // =================================================

    if (
      today >= checkoutDate
    ) {

      await client.query(
        "ROLLBACK"
      );

      return res.status(400).json({

        success: false,

        message:
          "This reservation can no longer be cancelled because the checkout date has arrived.",

      });

    }

    // =================================================
    // UPDATE BOOKING
    // =================================================

    const updateResult =
      await client.query(
        `
        UPDATE bookings

        SET
          booking_status = 'cancelled',
          status = 'cancelled'

        WHERE id = $1
          AND customer_id = $2

        RETURNING
          id,
          customer_id,
          room_id,
          check_in,
          check_out,
          booking_status,
          payment_status,
          status
        `,
        [
          bookingId,
          customerId,
        ]
      );

    // =================================================
    // FIND LATEST PAYMENT
    // =================================================

    let paymentStatus =
      "refund_pending";

    let refundAmount = 0;

    const paymentResult =
      await client.query(
        `
        SELECT

          id,
          amount,
          payment_status

        FROM payments

        WHERE booking_id = $1

        ORDER BY id DESC

        LIMIT 1

        FOR UPDATE
        `,
        [bookingId]
      );

    // =================================================
    // PAYMENT EXISTS
    // =================================================

    if (
      paymentResult.rows.length > 0
    ) {

      const payment =
        paymentResult.rows[0];

      const currentPaymentStatus =
        String(
          payment.payment_status || ""
        )
          .toLowerCase()
          .trim();

      // ===============================================
      // COMPLETED PAYMENT
      // ===============================================

      if (
        currentPaymentStatus ===
        "completed"
      ) {

        await client.query(
          `
          UPDATE payments

          SET
            payment_status = 'refund_pending'

          WHERE id = $1
          `,
          [payment.id]
        );

        paymentStatus =
          "refund_pending";

        refundAmount =
          Number(
            payment.amount
          ) || 0;

      } else {

        paymentStatus =
          currentPaymentStatus ||
          "refund_pending";

        refundAmount =
          Number(
            payment.amount
          ) || 0;

      }

    } else {

      // No payment found

      paymentStatus =
        "refund_pending";

      refundAmount = 0;

    }

    // =================================================
    // UPDATE BOOKING PAYMENT STATUS
    // =================================================

    await client.query(
      `
      UPDATE bookings

      SET
        payment_status = $1

      WHERE id = $2
      `,
      [
        paymentStatus,
        bookingId,
      ]
    );

    // =================================================
    // MAKE ROOM AVAILABLE
    // =================================================

    await client.query(
      `
      UPDATE rooms

      SET
        status = 'Available'

      WHERE id = $1
      `,
      [
        booking.room_id,
      ]
    );

    // =================================================
    // COMMIT
    // =================================================

    await client.query(
      "COMMIT"
    );

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(200).json({

      success: true,

      message:
        "Reservation cancelled successfully.",

      refund_message:
        paymentStatus ===
        "refund_pending"

          ? "Your room payment refund is pending and will be processed according to the hotel's refund policy."

          : "No completed payment was found for this reservation.",

      payment_status:
        paymentStatus,

      refund_amount:
        refundAmount,

      booking_id:
        bookingId,

      booking_status:
        "cancelled",

      booking:
        updateResult.rows[0],

    });

  } catch (error) {

    // =================================================
    // ROLLBACK
    // =================================================

    try {

      await client.query(
        "ROLLBACK"
      );

    } catch (rollbackError) {

      console.error(
        "Rollback error:",
        rollbackError
      );

    }

    console.error(
      "Cancel customer booking error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Failed to cancel booking.",

      error:
        error.message,

    });

  } finally {

    client.release();

  }

};
